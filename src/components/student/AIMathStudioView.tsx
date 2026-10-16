import React, { useState } from 'react';
import { AccountTier, MathTopic, ScanResult, SocraticMessage } from '../../types/math';
import { SAMPLE_SCAN_RESULTS, SAMPLE_SOCRATIC_MESSAGES } from '../../data/mockData';
import { MathView } from '../MathView';
import { FunctionGrapher } from '../FunctionGrapher';
import {
  Camera,
  MessageSquare,
  Sparkles,
  Zap,
  CheckCircle2,
  RefreshCw,
  Send,
  HelpCircle,
  Lightbulb,
  Upload,
  Image as ImageIcon,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  Bot,
  User,
  History,
} from 'lucide-react';

interface AIMathStudioViewProps {
  dailyScanCount: number;
  maxDailyScans: number;
  tier: AccountTier;
  onIncrementScan: () => void;
  onUpgradeTier: () => void;
  onStartExam?: () => void;
}

export const AIMathStudioView: React.FC<AIMathStudioViewProps> = ({
  dailyScanCount,
  maxDailyScans,
  tier,
  onIncrementScan,
  onUpgradeTier,
  onStartExam,
}) => {
  // Chế độ: 'scanner' (Quét AI) hoặc 'tutor' (Gia sư Socratic)
  const [activeStudioTab, setActiveStudioTab] = useState<'scanner' | 'tutor'>('scanner');

  // ==========================================
  // STATE MÁY QUÉT BÀI TẬP AI
  // ==========================================
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [customProblemText, setCustomProblemText] = useState('');
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);

  // ==========================================
  // STATE GIA SƯ SOCRATIC
  // ==========================================
  const [messages, setMessages] = useState<SocraticMessage[]>(SAMPLE_SOCRATIC_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [hintsRemaining, setHintsRemaining] = useState(2);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const isLimitReached = tier === 'free' && dailyScanCount >= maxDailyScans;

  // Xử lý quét bài tập
  const handlePerformScan = () => {
    if (isLimitReached) {
      onUpgradeTier();
      return;
    }

    setIsScanning(true);
    setTimeout(() => {
      const result = SAMPLE_SCAN_RESULTS[selectedPresetIndex % SAMPLE_SCAN_RESULTS.length];
      if (customProblemText.trim()) {
        setScanResult({
          ...result,
          problemText: customProblemText.trim(),
        });
      } else {
        setScanResult(result);
      }
      setIsScanning(false);
      onIncrementScan();
    }, 1200);
  };

  // Chuyển bài toán đã quét sang Gia Sư Socratic để đàm thoại gợi mở
  const handleTransferToSocraticTutor = () => {
    if (!scanResult) return;

    const newSystemPrompt: SocraticMessage = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: `Thầy đã nhận được bài toán bạn vừa quét: "${scanResult.problemText}". Thay vì cho ngay đáp án, thầy sẽ gợi ý từng bước. Theo bạn, điều kiện xác định hoặc bước biến đổi đầu tiên của bài toán này là gì?`,
      latex: scanResult.latexFormula,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newSystemPrompt]);
    setActiveStudioTab('tutor');
  };

  // Gửi tin nhắn cho Gia sư Socratic
  const handleSendTutorMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: SocraticMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsAiThinking(true);

    // Giả lập Gia sư Socratic gợi ý từng bước không lộ đáp án
    setTimeout(() => {
      let aiResponseText = '';
      let latexHint = '';
      let graphData: any = undefined;

      const lower = userMsg.content.toLowerCase();
      if (lower.includes('đạo hàm') || lower.includes('nghiệm') || lower.includes('bước')) {
        aiResponseText =
          'Rất chuẩn xác! Bước tính đạo hàm của bạn đã đúng hướng. Bây giờ, hãy xét dấu của $f\'(x)$ trên từng khoảng để xác định khoảng đồng biến và nghịch biến nhé.';
        latexHint = "f'(x) = 3x^2 - 6x = 3x(x - 2)";
        graphData = { equation: 'x^3 - 3*x^2 + 2', label: 'f(x) = x³ - 3x² + 2' };
      } else if (lower.includes('không biết') || lower.includes('quên') || lower.includes('gợi ý')) {
        aiResponseText =
          'Đừng lo lắng! Hãy nhớ lại quy tắc tính đạo hàm hàm đa thức $(x^n)\' = n \\cdot x^{n-1}$. Thử tính đạo hàm của $x^3$ và $3x^2$ xem sao?';
        latexHint = '(x^3)\' = 3x^2, \\quad (3x^2)\' = 6x';
      } else {
        aiResponseText =
          'Thầy ghi nhận suy luận của bạn. Thử thế giá trị $x = 0$ và $x = 2$ vào đạo hàm để kiểm tra các điểm tới hạn xem cực trị nằm ở đâu nhé!';
        latexHint = "f'(0) = 0, \\quad f'(2) = 0";
      }

      const aiMsg: SocraticMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: aiResponseText,
        latex: latexHint,
        graphHint: graphData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsAiThinking(false);
    }, 1000);
  };

  // Yêu cầu gợi ý thông minh từ Gia sư
  const handleRequestHint = () => {
    if (hintsRemaining <= 0) return;
    setHintsRemaining((prev) => prev - 1);

    const hintMsg: SocraticMessage = {
      id: `hint_${Date.now()}`,
      role: 'assistant',
      content: `💡 Gợi ý cấp độ ${3 - hintsRemaining}: Hãy lập bảng xét dấu cho $f'(x)$. Khi đi qua nghiệm bội lẻ, đạo hàm sẽ đổi dấu từ dương sang âm (cực đại) hoặc từ âm sang dương (cực tiểu).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, hintMsg]);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner Studio */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-blue-600" />
              <span>Hỏi AI · Toán THPT GDPT 2018</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
              Gemini Vision + Socratic Tutor Hợp Nhất
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Hỏi AI - Trợ Lý Giải Toán & Gia Sư Socratic
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
            Gộp máy quét bài tập AI bằng Camera OCR và Gia sư Socratic tương tác: bóc tách lời giải chuẩn Bộ GD&ĐT, đồng thời đàm thoại gợi mở từng bước mà không lộ đáp án.
          </p>
        </div>

        {/* Studio Mode Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold w-full md:w-auto">
          <button
            onClick={() => setActiveStudioTab('scanner')}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeStudioTab === 'scanner'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera size={16} />
            <span>1. Quét / Nhập Bài Toán</span>
          </button>
          <button
            onClick={() => setActiveStudioTab('tutor')}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeStudioTab === 'tutor'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare size={16} />
            <span>2. Gia Sư Socratic</span>
          </button>
        </div>
      </div>

      {/* Account Tier Usage Meter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Zap size={18} />
          </div>
          <div>
            <span className="font-bold text-slate-800">
              Hạn mức lượt quét AI hôm nay:{' '}
              <strong className="text-blue-600 font-mono">
                {dailyScanCount} / {tier === 'premium' ? 'Không giới hạn' : maxDailyScans} lượt
              </strong>
            </span>
            <span className="text-slate-400 block text-[11px]">
              {tier === 'premium'
                ? 'Gói Pro: Truy vấn không giới hạn mô hình Gemini 3.8 Flash Vision'
                : 'Gói Miễn phí: Đặt lại 10 lượt quét miễn phí vào lúc 00:00 hàng ngày'}
            </span>
          </div>
        </div>

        {tier === 'free' && (
          <button
            onClick={onUpgradeTier}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles size={14} />
            <span>Nâng cấp Pro</span>
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* PHẦN 1: MÁY QUÉT BÀI TẬP AI (CAMERA OCR & GEMINI VISION)    */}
      {/* ========================================================= */}
      {activeStudioTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Cột trái: Khung quét ảnh & Chọn bài mẫu (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Camera size={20} className="text-blue-600" />
                  <h3 className="font-extrabold text-base text-slate-900">Khung Quét Camera</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-400">OCR Tự Động</span>
              </div>

              {/* Viewport máy ảnh giả lập */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-4/3 flex flex-col items-center justify-center p-6 text-center text-white border-2 border-dashed border-slate-700">
                {customImagePreview ? (
                  <img
                    src={customImagePreview}
                    alt="Xem trước ảnh bài toán"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3">
                      <Camera size={32} className="text-blue-400" />
                    </div>
                    <p className="font-bold text-sm text-slate-200">Đưa đề bài toán vào khung hình</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Hỗ trợ ảnh chụp sách giáo khoa, bài viết tay hoặc file đề PDF
                    </p>
                  </>
                )}

                {/* Khung ngắm OCR */}
                <div className="absolute inset-4 border-2 border-blue-400/40 rounded-xl pointer-events-none" />
              </div>

              {/* Tải ảnh hoặc chọn đề toán mẫu */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">Chọn đề toán mẫu thực tế:</label>
                <div className="space-y-1.5">
                  {SAMPLE_SCAN_RESULTS.map((res: ScanResult, index: number) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedPresetIndex(index);
                        setCustomProblemText('');
                        setCustomImagePreview(null);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                        selectedPresetIndex === index && !customProblemText
                          ? 'bg-blue-50 border-blue-500 font-bold text-blue-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{res.problemText}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-500 font-mono shrink-0 ml-2">
                          {res.topic}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nhập đề thủ công hoặc tải ảnh */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <label className="font-bold text-slate-700 block">Hoặc nhập nội dung bài toán:</label>
                <textarea
                  rows={2}
                  value={customProblemText}
                  onChange={(e) => setCustomProblemText(e.target.value)}
                  placeholder="Nhập phương trình, bất phương trình hoặc bài toán cần giải..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Nút bấm Quét & Giải Toán */}
              <button
                onClick={handlePerformScan}
                disabled={isScanning}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                {isScanning ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>AI Đang Phân Tích OCR & Giải Toán...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Quét & Bóc Tách Lời Giải AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cột phải: Lời giải chi tiết & Cầu nối sang Gia sư Socratic (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {scanResult ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-300">
                {/* Header kết quả */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                        {scanResult.topic}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        Độ khó: {scanResult.difficulty}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 mt-2">
                      {scanResult.problemText}
                    </h3>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    Xử lý: {scanResult.processingTimeMs}ms
                  </span>
                </div>

                {/* Công thức trích xuất OCR LaTeX */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
                    Công thức nhận dạng:
                  </span>
                  <div className="overflow-x-auto py-1">
                    <MathView latex={scanResult.latexFormula} />
                  </div>
                </div>

                {/* Các bước giải chi tiết từng bước */}
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Các Bước Giải Chuẩn Mực GDPT 2018:</span>
                  </h4>

                  <div className="space-y-3">
                    {scanResult.stepByStepSolution.map((step) => (
                      <div
                        key={step.stepNumber}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {step.stepNumber}
                          </span>
                          <span className="font-bold text-slate-900">{step.title}</span>
                        </div>
                        <p className="text-slate-600 pl-8 leading-relaxed">{step.description}</p>
                        <div className="pl-8 pt-1 overflow-x-auto">
                          <MathView latex={step.latex} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Đáp số cuối cùng */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900">Đáp Số Cuối Cùng:</span>
                  <span className="font-mono font-black text-emerald-800 text-sm">
                    {scanResult.finalAnswer}
                  </span>
                </div>

                {/* NÚT KẾT NỐI SANG GIA SƯ SOCRATIC (GỘP TÍNH NĂNG) */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Bot size={22} />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-indigo-950">Chưa hiểu rõ bản chất bài toán?</h5>
                      <p className="text-[11px] text-indigo-700">
                        Chuyển bài toán sang Gia sư Socratic để được hướng dẫn đàm thoại gợi mở từng bước!
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleTransferToSocraticTutor}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs whitespace-nowrap transition-colors"
                  >
                    <span>Hỏi Gia Sư Socratic</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-3 shadow-xs">
                <Camera size={48} className="mx-auto text-slate-300" />
                <h4 className="font-bold text-base text-slate-700">Chưa có kết quả quét nào</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Hãy bấm nút <strong>"Quét & Bóc Tách Lời Giải AI"</strong> ở cột bên trái để AI tự động nhận dạng đề bài và đưa ra lời giải chuẩn Bộ GD&ĐT.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PHẦN 2: GIA SƯ SOCRATIC ĐÀM THOẠI & GỢI MỞ                 */}
      {/* ========================================================= */}
      {activeStudioTab === 'tutor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Cột trái: Khung chat Socratic (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs flex flex-col min-h-[580px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Gia Sư AI Socratic</h3>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Đang trực tuyến · Phương pháp đàm thoại không lộ đáp án
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRequestHint}
                  disabled={hintsRemaining <= 0}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 transition-colors"
                >
                  <Lightbulb size={14} className="text-amber-600" />
                  <span>Xin Gợi Ý ({hintsRemaining}/2)</span>
                </button>
              </div>
            </div>

            {/* Stream tin nhắn đối thoại */}
            <div className="flex-1 overflow-y-auto space-y-4 max-h-[420px] pr-2 text-xs">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser ? 'bg-blue-600 text-white' : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {isUser ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-4 rounded-2xl leading-relaxed ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : 'bg-slate-100 text-slate-900 rounded-tl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>

                        {m.latex && (
                          <div className="mt-2 pt-2 border-t border-black/10 overflow-x-auto">
                            <MathView latex={m.latex} />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block px-1">{m.timestamp}</span>
                    </div>
                  </div>
                );
              })}

              {isAiThinking && (
                <div className="flex gap-3 items-center text-xs text-slate-400 italic">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <span>Gia sư AI đang suy nghĩ câu hỏi gợi ý...</span>
                </div>
              )}
            </div>

            {/* Input Form gửi tin nhắn */}
            <form onSubmit={handleSendTutorMessage} className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Trả lời câu hỏi của gia sư hoặc hỏi thêm về bài toán..."
                className="flex-1 h-11 px-4 rounded-xl border border-slate-300 text-xs focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-5 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <Send size={15} />
                <span>Gửi</span>
              </button>
            </form>
          </div>

          {/* Cột phải: Đồ thị hàm số minh họa kèm theo (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-600" />
                  <h4 className="font-extrabold text-sm text-slate-900">Đồ Thị Trực Quan</h4>
                </div>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono">2D Oxy</span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Minh họa trực quan hình dáng đồ thị $f(x)$ và tiếp tuyến để học sinh dễ hình dung cực trị.
              </p>

              <div className="rounded-2xl overflow-hidden border border-slate-200">
                <FunctionGrapher defaultEquation="x^3 - 3*x^2 + 2" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
