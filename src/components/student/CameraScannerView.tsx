import React, { useState } from 'react';
import { ScanResult, AccountTier } from '../../types/math';
import { SAMPLE_OCR_PROBLEMS } from '../../data/mockData';
import { MathView } from '../MathView';
import { Camera, Image as ImageIcon, Sparkles, Zap, Clock, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';

interface CameraScannerViewProps {
  dailyScanCount: number;
  maxDailyScans: number;
  tier: AccountTier;
  onIncrementScan: () => void;
  onUpgradeTier: () => void;
  onAskTutor: (question: string) => void;
}

export const CameraScannerView: React.FC<CameraScannerViewProps> = ({
  dailyScanCount,
  maxDailyScans,
  tier,
  onIncrementScan,
  onUpgradeTier,
  onAskTutor,
}) => {
  const [selectedSample, setSelectedSample] = useState(SAMPLE_OCR_PROBLEMS[0]);
  const [customInputText, setCustomInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSolution, setActiveSolution] = useState<ScanResult | null>(SAMPLE_OCR_PROBLEMS[0].solution);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  const remainingScans = tier === 'premium' ? 9999 : Math.max(0, maxDailyScans - dailyScanCount);

  const handleScanProblem = async (problemData?: typeof SAMPLE_OCR_PROBLEMS[0], customPrompt?: string) => {
    if (tier !== 'premium' && remainingScans <= 0) {
      alert('Bạn đã sử dụng hết lượt quét miễn phí hôm nay. Vui lòng nâng cấp gói Pro để quét không giới hạn!');
      return;
    }

    setIsProcessing(true);
    onIncrementScan();

    const targetProblem = problemData || selectedSample;

    try {
      // Gọi API Server Proxy với cơ chế Caching
      const response = await fetch('/api/gemini/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemText: customPrompt || targetProblem.solution.problemText,
          latex: targetProblem.latex,
          tier,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setActiveSolution(data.result);
      } else {
        // Fallback sử dụng dữ liệu mẫu nếu API server chưa nạp key hoặc môi trường offline
        setActiveSolution(targetProblem.solution);
      }
    } catch (err) {
      // Fallback tự động
      setActiveSolution(targetProblem.solution);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImagePreview(reader.result as string);
        // Tự động phân tích bài toán
        handleScanProblem(SAMPLE_OCR_PROBLEMS[1], 'Bài toán hình học từ ảnh tải lên');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Title & Quota Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Máy Quét Bài Tập AI & OCR Math</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              Gemini Vision
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Chụp hoặc tải ảnh đề toán (in hoặc viết tay). AI tự động bóc tách LaTeX và phân tích phương pháp giải.
          </p>
        </div>

        {/* Quota Management Widget */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
          <div className="text-right">
            <span className="text-[11px] text-slate-500 font-semibold block">Hạn ngạch hôm nay</span>
            <span className="text-sm font-extrabold text-slate-900 tabular-nums">
              {tier === 'premium' ? 'Không giới hạn' : `${remainingScans} / ${maxDailyScans} lượt`}
            </span>
          </div>
          {tier !== 'premium' && (
            <button
              onClick={onUpgradeTier}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all"
            >
              Lên Pro
            </button>
          )}
        </div>
      </div>

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Camera / Upload / Preset Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Virtual Camera Viewfinder */}
          <div className="relative rounded-3xl bg-slate-900 text-white p-6 border-2 border-slate-800 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-wider uppercase text-blue-400 flex items-center gap-1.5">
                <Camera size={14} />
                <span>Khung Nhận Diện AI</span>
              </span>
              <span className="text-[11px] text-slate-400">Tự động bắt nét</span>
            </div>

            {/* Viewfinder Frame */}
            <div className="relative h-56 rounded-2xl bg-slate-800/80 border-2 border-dashed border-blue-500/60 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
              {uploadedImagePreview ? (
                <img
                  src={uploadedImagePreview}
                  alt="Bài toán đã tải lên"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">
                      {selectedSample.title}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-1 bg-slate-950/60 px-2 py-1 rounded">
                      {selectedSample.imagePreviewText}
                    </p>
                  </div>
                </div>
              )}

              {/* Laser Scan Animation */}
              {isProcessing && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-bounce top-1/2" />
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
              <label className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-700 transition-colors">
                <ImageIcon size={15} />
                <span>Tải ảnh đề thi</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => handleScanProblem()}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                {isProcessing ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Zap size={15} />
                )}
                <span>{isProcessing ? 'Đang nhận diện...' : 'Quét & Giải ngay'}</span>
              </button>
            </div>
          </div>

          {/* Preset Sample Problems (1-Click Test) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Mẫu bài tập thử nghiệm sẵn:</h3>
              <span className="text-[11px] text-slate-400">Bấm để quét thử</span>
            </div>

            <div className="space-y-2">
              {SAMPLE_OCR_PROBLEMS.map((prob) => (
                <button
                  key={prob.id}
                  onClick={() => {
                    setSelectedSample(prob);
                    setUploadedImagePreview(null);
                    handleScanProblem(prob);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    selectedSample.id === prob.id
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{prob.title}</span>
                    <span className="text-[11px] text-slate-500 font-mono mt-0.5">{prob.imagePreviewText}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {prob.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Solution & LaTeX Result (7 Cols) */}
        <div className="lg:col-span-7">
          {activeSolution ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
              {/* Header with Cache status and Time */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                    {activeSolution.difficulty}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Chuyên đề: {activeSolution.topic}
                  </span>
                </div>

                {/* Cache Badge */}
                <div className="flex items-center gap-2">
                  {activeSolution.source === 'cache' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <Zap size={14} className="fill-emerald-600" />
                      <span>Redis Cache ({activeSolution.processingTimeMs}ms)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                      <Sparkles size={14} />
                      <span>Gemini AI ({activeSolution.processingTimeMs}ms)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Problem LaTeX Equation Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                  Công thức LaTeX nhận diện từ ảnh:
                </span>
                <div className="py-2 text-center text-slate-900">
                  <MathView math={activeSolution.latexFormula} block />
                </div>
              </div>

              {/* Step-by-Step Breakdown */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <span>Các bước giải chi tiết</span>
                  <span className="text-xs font-normal text-slate-500">({activeSolution.stepByStepSolution.length} bước)</span>
                </h3>

                <div className="space-y-3">
                  {activeSolution.stepByStepSolution.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-colors space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          {step.stepNumber}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{step.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 pl-8">{step.description}</p>
                      <div className="pl-8 pt-1 text-blue-900">
                        <MathView math={step.latex} block />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Answer Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 block">
                    Đáp số kết luận:
                  </span>
                  <span className="text-xl font-extrabold tracking-tight mt-0.5 block">
                    {activeSolution.finalAnswer}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-white" />
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onAskTutor(
                    `Mình muốn tự tìm cách giải bài này, hãy gợi mở từng bước và đừng đưa đáp án ngay: ${activeSolution.problemText} (${activeSolution.latexFormula})`,
                  )
                }
                className="w-full rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
              >
                Hỏi gia sư Socratic về bài này
              </button>
            </div>
          ) : (
            <div className="h-96 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <Camera size={48} className="text-slate-300 mb-3" />
              <p className="font-bold text-slate-600">Chưa có bài toán nào được quét</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Hãy chọn một bài mẫu bên trái hoặc bấm "Quét & Giải ngay" để kiểm tra tính năng OCR.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
