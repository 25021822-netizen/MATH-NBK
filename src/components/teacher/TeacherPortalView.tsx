import React, { useState, useRef } from 'react';
import { Exam, Question, ExamPartType, Classroom } from '../../types/math';
import { SAMPLE_EXAM_BGD, SAMPLE_CLASSROOMS } from '../../data/mockData';
import { MathView } from '../MathView';
import { ParsedExamSchema } from '../../lib/pdfParserSchema';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileUp,
  Download,
  Code2,
  Eye,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  HelpCircle,
  Save,
  BookOpen,
  X,
  SlidersHorizontal,
  Clock,
  Calendar,
  Users,
  Image as ImageIcon,
  Paperclip,
  Check,
  Compass,
} from 'lucide-react';

interface TeacherPortalViewProps {
  onPublishExam?: (newExam: Exam) => void;
  onPreviewExam?: (exam: Exam) => void;
  classrooms?: Classroom[];
}

export const TeacherPortalView: React.FC<TeacherPortalViewProps> = ({
  onPublishExam,
  onPreviewExam,
  classrooms = SAMPLE_CLASSROOMS,
}) => {
  // Chế độ: 'manual' (Tạo đề thủ công) hoặc 'ai_pdf' (AI Bóc Tách PDF)
  const [creationMode, setCreationMode] = useState<'manual' | 'ai_pdf'>('manual');

  // ================= STATE DÀNH CHO TẠO ĐỀ THỦ CÔNG =================
  const [manualTitle, setManualTitle] = useState('Đề Khảo Sát Toán THPT 2025 - Chuẩn Cấu Trúc Bộ GD&ĐT');
  const [manualGrade, setManualGrade] = useState<10 | 11 | 12>(12);
  const [manualYear, setManualYear] = useState<number>(2025);
  const [manualDuration, setManualDuration] = useState<number>(90);
  const [manualCreatedBy, setManualCreatedBy] = useState('ThS. Trần Văn Minh - Tổ Toán THPT');

  // 1. Giới hạn số lượt làm bài (0 = Không giới hạn, 1 = Thi chính thức, 2, 3...)
  const [manualMaxAttempts, setManualMaxAttempts] = useState<number>(1);

  // 2. Thời gian mở đề thi và đóng đề thi
  const [manualHasTimeWindow, setManualHasTimeWindow] = useState<boolean>(true);
  const [manualOpenTime, setManualOpenTime] = useState<string>(
    new Date(Date.now() - 3600 * 1000).toISOString().slice(0, 16)
  );
  const [manualCloseTime, setManualCloseTime] = useState<string>(
    new Date(Date.now() + 7 * 86400 * 1000).toISOString().slice(0, 16)
  );

  // 3. Giao đề cho nhóm lớp hoặc đưa vào kho tổng hợp
  const [manualDistributionType, setManualDistributionType] = useState<'classroom' | 'repository' | 'both'>('classroom');
  const [manualTargetClassIds, setManualTargetClassIds] = useState<string[]>(['cls_12a1']);

  // Danh sách câu hỏi trong đề thi (Chỉ 3 phần trắc nghiệm chuẩn BGD)
  const [manualQuestions, setManualQuestions] = useState<Question[]>(SAMPLE_EXAM_BGD.questions);

  // 4. Tổng điểm tính toán tự động dựa trên tổng điểm từng câu hỏi của bài
  const dynamicTotalPoints = manualQuestions.reduce((sum, q) => sum + (q.points || 0), 0);

  // Modal thêm/sửa câu hỏi
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form state cho câu hỏi đang tạo/sửa (CHỈ GỒM: part_1_mcq, part_2_true_false, part_3_short_answer)
  const [modalPart, setModalPart] = useState<'part_1_mcq' | 'part_2_true_false' | 'part_3_short_answer'>('part_1_mcq');
  const [modalPrompt, setModalPrompt] = useState('');
  const [modalLatex, setModalLatex] = useState('');
  const [modalExplanation, setModalExplanation] = useState('');
  const [modalPoints, setModalPoints] = useState<number>(0.25);

  // File đính kèm ảnh hoặc PDF cho câu hỏi (hỗ trợ dán clipboard Ctrl+V)
  const [modalImageAttachment, setModalImageAttachment] = useState<string | null>(null);
  const [modalPdfName, setModalPdfName] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // State riêng cho Phần 1 (MCQ)
  const [modalOptA, setModalOptA] = useState('');
  const [modalOptB, setModalOptB] = useState('');
  const [modalOptC, setModalOptC] = useState('');
  const [modalOptD, setModalOptD] = useState('');
  const [modalCorrectMcq, setModalCorrectMcq] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // State riêng cho Phần 2 (Đúng/Sai)
  const [modalTfA, setModalTfA] = useState({ text: '', isCorrect: true });
  const [modalTfB, setModalTfB] = useState({ text: '', isCorrect: false });
  const [modalTfC, setModalTfC] = useState({ text: '', isCorrect: true });
  const [modalTfD, setModalTfD] = useState({ text: '', isCorrect: true });

  // State riêng cho Phần 3 (Trả lời ngắn <= 4 ký tự)
  const [modalShortAnswer, setModalShortAnswer] = useState('');

  // Thông báo xuất bản & xóa
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);
  const [manualValidationErrors, setManualValidationErrors] = useState<string[]>([]);
  const [questionToDelete, setQuestionToDelete] = useState<{ id: string; questionNumber: number; prompt: string } | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState<boolean>(false);
  const [showPublishConfirmModal, setShowPublishConfirmModal] = useState<boolean>(false);

  // ================= STATE DÀNH CHO AI PDF PARSER =================
  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseStatus, setParseStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [parsedExamData, setParsedExamData] = useState<any | null>(null);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  // Mở modal để tạo câu hỏi mới
  const handleOpenAddQuestion = (partType: 'part_1_mcq' | 'part_2_true_false' | 'part_3_short_answer' = 'part_1_mcq') => {
    setEditingQuestionId(null);
    setModalPart(partType);
    setModalPrompt('');
    setModalLatex('');
    setModalExplanation('');
    setModalImageAttachment(null);
    setModalPdfName(null);

    if (partType === 'part_1_mcq') {
      setModalPoints(0.25);
      setModalOptA('Phương án A');
      setModalOptB('Phương án B');
      setModalOptC('Phương án C');
      setModalOptD('Phương án D');
      setModalCorrectMcq('A');
    } else if (partType === 'part_2_true_false') {
      setModalPoints(1.0);
      setModalTfA({ text: 'Mệnh đề a', isCorrect: true });
      setModalTfB({ text: 'Mệnh đề b', isCorrect: false });
      setModalTfC({ text: 'Mệnh đề c', isCorrect: true });
      setModalTfD({ text: 'Mệnh đề d', isCorrect: false });
    } else if (partType === 'part_3_short_answer') {
      setModalPoints(0.5);
      setModalShortAnswer('4');
    }

    setShowQuestionModal(true);
  };

  // Mở modal để chỉnh sửa câu hỏi
  const handleOpenEditQuestion = (q: Question) => {
    const safePart = q.part;
    setEditingQuestionId(q.id);
    setModalPart(safePart);
    setModalPrompt(q.prompt);
    setModalLatex(q.latex || '');
    setModalExplanation(q.explanation || '');
    setModalPoints(q.points);
    setModalImageAttachment(q.imageAttachment || null);
    setModalPdfName(q.pdfAttachmentName || null);

    if (q.part === 'part_1_mcq') {
      setModalOptA(q.options.find((o) => o.key === 'A')?.text || '');
      setModalOptB(q.options.find((o) => o.key === 'B')?.text || '');
      setModalOptC(q.options.find((o) => o.key === 'C')?.text || '');
      setModalOptD(q.options.find((o) => o.key === 'D')?.text || '');
      setModalCorrectMcq(q.correctAnswer);
    } else if (q.part === 'part_2_true_false') {
      const a = q.items.find((i) => i.subKey === 'a');
      const b = q.items.find((i) => i.subKey === 'b');
      const c = q.items.find((i) => i.subKey === 'c');
      const d = q.items.find((i) => i.subKey === 'd');
      setModalTfA({ text: a?.text || '', isCorrect: a?.isCorrect ?? true });
      setModalTfB({ text: b?.text || '', isCorrect: b?.isCorrect ?? false });
      setModalTfC({ text: c?.text || '', isCorrect: c?.isCorrect ?? true });
      setModalTfD({ text: d?.text || '', isCorrect: d?.isCorrect ?? false });
    } else if (q.part === 'part_3_short_answer') {
      setModalShortAnswer(q.correctAnswer);
    }

    setShowQuestionModal(true);
  };

  // Xử lý dán ảnh từ clipboard (Ctrl + V)
  const handlePasteImageFromClipboard = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setModalImageAttachment(event.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  // Xử lý tải ảnh từ máy tính
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setModalImageAttachment(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý tải file PDF đính kèm
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setModalPdfName(file.name);
    }
  };

  // Lưu câu hỏi vào danh sách (đảm bảo không còn Phần 4 tự luận)
  const handleSaveQuestion = () => {
    if (!modalPrompt.trim() && !modalImageAttachment) {
      alert('Vui lòng nhập nội dung đề bài hoặc dán/đính kèm file ảnh!');
      return;
    }

    const questionNumber = editingQuestionId
      ? manualQuestions.find((q) => q.id === editingQuestionId)?.questionNumber || 1
      : manualQuestions.length + 1;

    let newQuestion: Question;

    if (modalPart === 'part_1_mcq') {
      newQuestion = {
        id: editingQuestionId || `q_${Date.now()}`,
        part: 'part_1_mcq',
        questionNumber,
        prompt: modalPrompt,
        latex: modalLatex || undefined,
        options: [
          { key: 'A', text: modalOptA || 'Phương án A' },
          { key: 'B', text: modalOptB || 'Phương án B' },
          { key: 'C', text: modalOptC || 'Phương án C' },
          { key: 'D', text: modalOptD || 'Phương án D' },
        ],
        correctAnswer: modalCorrectMcq,
        explanation: modalExplanation,
        points: modalPoints || 0.25,
        imageAttachment: modalImageAttachment || undefined,
        pdfAttachmentName: modalPdfName || undefined,
      };
    } else if (modalPart === 'part_2_true_false') {
      newQuestion = {
        id: editingQuestionId || `q_${Date.now()}`,
        part: 'part_2_true_false',
        questionNumber,
        prompt: modalPrompt,
        latex: modalLatex || undefined,
        items: [
          { id: `tf_a_${Date.now()}`, subKey: 'a', text: modalTfA.text || 'Mệnh đề a', isCorrect: modalTfA.isCorrect },
          { id: `tf_b_${Date.now()}`, subKey: 'b', text: modalTfB.text || 'Mệnh đề b', isCorrect: modalTfB.isCorrect },
          { id: `tf_c_${Date.now()}`, subKey: 'c', text: modalTfC.text || 'Mệnh đề c', isCorrect: modalTfC.isCorrect },
          { id: `tf_d_${Date.now()}`, subKey: 'd', text: modalTfD.text || 'Mệnh đề d', isCorrect: modalTfD.isCorrect },
        ],
        explanation: modalExplanation,
        points: modalPoints || 1.0,
        imageAttachment: modalImageAttachment || undefined,
        pdfAttachmentName: modalPdfName || undefined,
      };
    } else {
      const sanitized = modalShortAnswer.trim().replace(/\s+/g, '');
      if (sanitized.length > 4) {
        alert('Quy chế BGD Phần 3: Đáp án không được vượt quá 4 ký tự!');
        return;
      }
      newQuestion = {
        id: editingQuestionId || `q_${Date.now()}`,
        part: 'part_3_short_answer',
        questionNumber,
        prompt: modalPrompt,
        latex: modalLatex || undefined,
        correctAnswer: sanitized || '0',
        explanation: modalExplanation,
        points: modalPoints || 0.5,
        imageAttachment: modalImageAttachment || undefined,
        pdfAttachmentName: modalPdfName || undefined,
      };
    }

    if (editingQuestionId) {
      setManualQuestions((prev) => prev.map((q) => (q.id === editingQuestionId ? newQuestion : q)));
    } else {
      setManualQuestions((prev) => [...prev, newQuestion]);
    }

    setShowQuestionModal(false);
  };

  // Xác nhận xóa 1 câu hỏi
  const handleConfirmDeleteQuestion = () => {
    if (!questionToDelete) return;
    const qNum = questionToDelete.questionNumber;
    const updated = manualQuestions.filter((q) => q.id !== questionToDelete.id);
    const renumbered = updated.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    setManualQuestions(renumbered);
    setQuestionToDelete(null);
    setPublishSuccessMessage(`Đã xóa câu hỏi số ${qNum} thành công.`);
    setTimeout(() => setPublishSuccessMessage(null), 3000);
  };

  // Tự động phân bổ lại điểm số chuẩn 10.0đ của Bộ GD&ĐT
  const handleAutoNormalizePoints = () => {
    const updated = manualQuestions.map((q) => {
      if (q.part === 'part_1_mcq') return { ...q, points: 0.25 };
      if (q.part === 'part_2_true_false') return { ...q, points: 1.0 };
      return { ...q, points: 0.5 };
    });
    setManualQuestions(updated);
    setPublishSuccessMessage('Đã phân bổ lại điểm số chuẩn Bộ GD: Phần 1 (0.25đ), Phần 2 (1.0đ), Phần 3 (0.5đ)!');
    setTimeout(() => setPublishSuccessMessage(null), 3000);
  };

  // Bấm nút Xuất bản -> Kiểm tra hợp lệ và Mở hộp thoại thông báo xác nhận
  const handleRequestPublishExam = () => {
    setManualValidationErrors([]);
    const errors: string[] = [];

    if (manualQuestions.length === 0) {
      errors.push('Đề thi chưa có câu hỏi nào. Vui lòng thêm ít nhất 1 câu hỏi!');
    }

    if (manualDistributionType !== 'repository' && manualTargetClassIds.length === 0) {
      errors.push('Vui lòng chọn ít nhất 1 nhóm lớp nhận đề thi, hoặc chọn hình thức "Kho Đề Thi Tổng Hợp"!');
    }

    if (errors.length > 0) {
      setManualValidationErrors(errors);
      return;
    }

    // Mở bước xác nhận xuất bản
    setShowPublishConfirmModal(true);
  };

  // Xác nhận xuất bản chính thức trong modal
  const handleConfirmPublishExam = () => {
    const calculatedTotalPoints = Number(dynamicTotalPoints.toFixed(2));

    const newExam: Exam = {
      id: `exam_manual_${Date.now()}`,
      title: manualTitle.trim() || 'Đề Thi Toán Mới',
      grade: manualGrade,
      year: manualYear,
      durationMinutes: manualDuration,
      totalPoints: calculatedTotalPoints,
      status: 'approved',
      createdBy: manualCreatedBy,
      createdAt: new Date().toISOString(),
      questions: manualQuestions,
      maxAttempts: manualMaxAttempts > 0 ? manualMaxAttempts : undefined,
      openTime: manualHasTimeWindow && manualOpenTime ? manualOpenTime : undefined,
      closeTime: manualHasTimeWindow && manualCloseTime ? manualCloseTime : undefined,
      distributionType: manualDistributionType,
      targetClassIds: manualDistributionType !== 'repository' ? manualTargetClassIds : undefined,
    };

    if (onPublishExam) {
      onPublishExam(newExam);
    }

    setShowPublishConfirmModal(false);

    const targetDesc =
      manualDistributionType === 'classroom'
        ? `cho ${manualTargetClassIds.length} nhóm lớp được chỉ định`
        : manualDistributionType === 'repository'
        ? 'vào Kho đề thi tổng hợp toàn trường'
        : 'cho các nhóm lớp và Kho đề thi chung';

    setPublishSuccessMessage(
      `Đã xuất bản thành công "${manualTitle}" với tổng ${calculatedTotalPoints} điểm (${targetDesc})!`
    );
    setTimeout(() => setPublishSuccessMessage(null), 5000);
  };

  const partCounts = {
    part1: manualQuestions.filter((q) => q.part === 'part_1_mcq').length,
    part2: manualQuestions.filter((q) => q.part === 'part_2_true_false').length,
    part3: manualQuestions.filter((q) => q.part === 'part_3_short_answer').length,
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
            Cổng Soạn Đề Thi Giáo Viên Chuẩn Bộ GD&ĐT 2025
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Biên Soạn & Xuất Bản Đề Thi THPT
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
            Tùy biến số lượt thi, cài đặt thời gian mở/đóng đề, dán ảnh clipboard, giao theo nhóm lớp hoặc đưa vào kho tổng hợp.
          </p>
        </div>

        {/* Chế độ tạo đề */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold w-full md:w-auto">
          <button
            onClick={() => setCreationMode('manual')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              creationMode === 'manual' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit2 size={15} />
            <span>Tự Tạo Đề Thủ Công</span>
          </button>
          <button
            onClick={() => setCreationMode('ai_pdf')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              creationMode === 'ai_pdf' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileUp size={15} />
            <span>Tải Lên File PDF AI</span>
          </button>
        </div>
      </div>

      {/* Thông báo xuất bản thành công */}
      {publishSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={18} />
          <span>{publishSuccessMessage}</span>
        </div>
      )}

      {/* Thông báo lỗi validation */}
      {manualValidationErrors.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle size={16} />
            <span>Vui lòng kiểm tra lại cấu hình đề thi:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2">
            {manualValidationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: TỰ TẠO ĐỀ THI THỦ CÔNG                                            */}
      {/* ========================================================================= */}
      {creationMode === 'manual' && (
        <div className="space-y-6">
          {/* Metadata & Advanced Exam Settings Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <SlidersHorizontal size={18} className="text-blue-600" />
                <span>Cấu Hình Đề Thi & Quản Lý Phân Phối</span>
              </div>
              <span className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full">
                Tổng Điểm: {dynamicTotalPoints.toFixed(2)} điểm
              </span>
            </div>

            {/* Hàng 1: Tên đề, khối lớp, năm học, thời lượng */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
              <div className="md:col-span-6 space-y-1">
                <label className="font-bold text-slate-700">Tên Đề Thi *</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Nhập tên đề thi..."
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 font-semibold focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="font-bold text-slate-700">Khối Lớp</label>
                <select
                  value={manualGrade}
                  onChange={(e) => setManualGrade(Number(e.target.value) as any)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-semibold bg-white focus:border-blue-600 focus:outline-none"
                >
                  <option value={12}>Lớp 12</option>
                  <option value={11}>Lớp 11</option>
                  <option value={10}>Lớp 10</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="font-bold text-slate-700">Thời Lượng</label>
                <select
                  value={manualDuration}
                  onChange={(e) => setManualDuration(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-semibold bg-white focus:border-blue-600 focus:outline-none"
                >
                  <option value={45}>45 phút</option>
                  <option value={60}>60 phút</option>
                  <option value={90}>90 phút (BGD)</option>
                  <option value={120}>120 phút</option>
                </select>
              </div>

              {/* 1. GIỚI HẠN SỐ LƯỢT LÀM BÀI */}
              <div className="md:col-span-2 space-y-1">
                <label className="font-bold text-slate-700">Số Lượt Làm Bài</label>
                <select
                  value={manualMaxAttempts}
                  onChange={(e) => setManualMaxAttempts(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-semibold bg-white focus:border-blue-600 focus:outline-none"
                >
                  <option value={0}>Không giới hạn</option>
                  <option value={1}>1 lượt (Thi thật)</option>
                  <option value={2}>2 lượt</option>
                  <option value={3}>3 lượt</option>
                </select>
              </div>
            </div>

            {/* Hàng 2: 2. THỜI GIAN MỞ VÀ ĐÓNG ĐỀ THI */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={manualHasTimeWindow}
                    onChange={(e) => setManualHasTimeWindow(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <Calendar size={15} className="text-blue-600" />
                  <span>Kích hoạt khung thời gian mở và đóng đề thi</span>
                </label>
                {manualHasTimeWindow && (
                  <span className="text-[11px] text-slate-500">
                    Học sinh chỉ được vào phòng thi trong khoảng thời gian này
                  </span>
                )}
              </div>

              {manualHasTimeWindow && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Thời Gian Mở Đề:</label>
                    <input
                      type="datetime-local"
                      value={manualOpenTime}
                      onChange={(e) => setManualOpenTime(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Thời Gian Đóng Đề:</label>
                    <input
                      type="datetime-local"
                      value={manualCloseTime}
                      onChange={(e) => setManualCloseTime(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Hàng 3: 3. GIAO ĐỀ CHO NHÓM LỚP HOẶC CHO ĐỀ VÀO KHO TỔNG HỢP */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3 text-xs">
              <span className="font-bold text-blue-900 block">Hình thức phân phối đề thi:</span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setManualDistributionType('classroom')}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    manualDistributionType === 'classroom'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <Users size={14} />
                  <span>Giao Cho Nhóm Lớp Cụ Thể</span>
                </button>

                <button
                  type="button"
                  onClick={() => setManualDistributionType('repository')}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    manualDistributionType === 'repository'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <BookOpen size={14} />
                  <span>Kho Đề Thi Tổng Hợp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setManualDistributionType('both')}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    manualDistributionType === 'both'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <Sparkles size={14} />
                  <span>Cả Lớp & Kho Tổng Hợp</span>
                </button>
              </div>

              {/* Danh sách nhóm lớp được giao */}
              {manualDistributionType !== 'repository' && (
                <div className="pt-2 border-t border-blue-200/60 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Đánh dấu các nhóm lớp nhận đề thi này:
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    {classrooms.map((cls) => (
                      <label
                        key={cls.id}
                        className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={manualTargetClassIds.includes(cls.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setManualTargetClassIds((prev) => [...prev, cls.id]);
                            } else {
                              setManualTargetClassIds((prev) => prev.filter((id) => id !== cls.id));
                            }
                          }}
                          className="rounded text-blue-600"
                        />
                        <span>{cls.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({cls.code})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Bar: Chỉ hiển thị 3 phần (Phần 4 tự luận đã xóa) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Tổng Câu Hỏi</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
                {manualQuestions.length}
              </span>
              <span className="text-[11px] text-blue-600 font-bold">
                {dynamicTotalPoints.toFixed(2)} điểm
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center shadow-xs">
              <span className="text-[11px] text-blue-700 font-semibold block uppercase">Phần 1: MCQ (4 chọn 1)</span>
              <span className="text-2xl font-black text-blue-900 font-mono mt-0.5 block">
                {partCounts.part1}
              </span>
              <span className="text-[10px] text-blue-600 font-bold">Chuẩn BGD</span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-center shadow-xs">
              <span className="text-[11px] text-purple-700 font-semibold block uppercase">Phần 2: Đúng / Sai</span>
              <span className="text-2xl font-black text-purple-900 font-mono mt-0.5 block">
                {partCounts.part2}
              </span>
              <span className="text-[10px] text-purple-600 font-bold">4 ý độc lập</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center shadow-xs">
              <span className="text-[11px] text-amber-700 font-semibold block uppercase">Phần 3: Trả Lời Ngắn</span>
              <span className="text-2xl font-black text-amber-900 font-mono mt-0.5 block">
                {partCounts.part3}
              </span>
              <span className="text-[10px] text-amber-600 font-bold">≤ 4 ký tự</span>
            </div>
          </div>

          {/* Quick Action Strip (Bỏ Phần 4 Tự Luận) */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Thêm câu hỏi:</span>
              <button
                onClick={() => handleOpenAddQuestion('part_1_mcq')}
                className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>+ Phần 1 (MCQ)</span>
              </button>
              <button
                onClick={() => handleOpenAddQuestion('part_2_true_false')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>+ Phần 2 (Đúng/Sai)</span>
              </button>
              <button
                onClick={() => handleOpenAddQuestion('part_3_short_answer')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs border border-amber-200 flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>+ Phần 3 (Trả lời ngắn)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoNormalizePoints}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
              >
                Chuẩn Hóa Điểm Bộ GD
              </button>

              <button
                onClick={handleRequestPublishExam}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 size={16} />
                <span>Xuất Bản Đề Thi ({dynamicTotalPoints.toFixed(2)}đ)</span>
              </button>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            {manualQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs text-xs relative"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        q.part === 'part_1_mcq'
                          ? 'bg-blue-100 text-blue-700'
                          : q.part === 'part_2_true_false'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {q.part === 'part_1_mcq'
                        ? 'Phần 1: Trắc Nghiệm'
                        : q.part === 'part_2_true_false'
                        ? 'Phần 2: Đúng / Sai'
                        : 'Phần 3: Trả Lời Ngắn'}
                    </span>
                    <span className="text-slate-400 font-mono">({q.points} điểm)</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditQuestion(q)}
                      title="Sửa câu hỏi"
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() =>
                        setQuestionToDelete({ id: q.id, questionNumber: idx + 1, prompt: q.prompt })
                      }
                      title="Xóa câu hỏi"
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <p className="font-bold text-slate-900 text-sm">{q.prompt}</p>

                {/* Công thức LaTeX nếu có */}
                {q.latex && (
                  <div className="p-3 bg-slate-50 rounded-xl overflow-x-auto">
                    <MathView latex={q.latex} />
                  </div>
                )}

                {/* File ảnh đính kèm nếu có */}
                {q.imageAttachment && (
                  <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
                    <img
                      src={q.imageAttachment}
                      alt="Ảnh đính kèm đề bài"
                      className="max-h-48 rounded-xl object-contain bg-white"
                    />
                  </div>
                )}

                {/* Tên file PDF đính kèm nếu có */}
                {q.pdfAttachmentName && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-xs">
                    <Paperclip size={13} />
                    <span>Tài liệu đính kèm: {q.pdfAttachmentName}</span>
                  </div>
                )}

                {/* Render Options for Part 1 */}
                {q.part === 'part_1_mcq' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt) => (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                          opt.key === q.correctAnswer
                            ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-md bg-white border border-slate-300 flex items-center justify-center font-bold text-[10px]">
                          {opt.key}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Render Items for Part 2 */}
                {q.part === 'part_2_true_false' && (
                  <div className="space-y-1.5 pt-1">
                    {q.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-700">{item.subKey})</span>
                          <span>{item.text}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.isCorrect ? 'ĐÚNG' : 'SAI'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Render Answer for Part 3 */}
                {q.part === 'part_3_short_answer' && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                    <span className="font-bold text-amber-900">Đáp án ngắn:</span>
                    <span className="font-mono font-black text-amber-800 text-sm bg-white px-3 py-1 rounded-lg border border-amber-300">
                      {q.correctAnswer}
                    </span>
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    <span className="font-bold text-slate-700">Lời giải chi tiết: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: TẢI FILE PDF & AI BÓC TÁCH                                        */}
      {/* ========================================================================= */}
      {creationMode === 'ai_pdf' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-xs text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <FileUp size={32} />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">
            Tải Lên Tệp PDF Đề Thi Toán THPT Chuẩn Bộ GD&ĐT
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hệ thống ứng dụng Gemini Vision và bộ xác thực Zod Schema để tự động phân rã đề thi thành 3 phần chuẩn hóa.
          </p>
          <button
            onClick={() => {
              setCreationMode('manual');
              setPublishSuccessMessage('Đã chuyển sang trình tạo đề chuẩn BGD 2025!');
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
          >
            Sử Dụng Trình Soạn Đề Thủ Công
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL THÊM / SỬA CÂU HỎI (HỖ TRỢ DÁN ẢNH CLIPBOARD & FILE PDF)            */}
      {/* ========================================================================= */}
      {showQuestionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onPaste={handlePasteImageFromClipboard}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingQuestionId ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới Vào Đề Thi'}
              </h3>
              <button onClick={() => setShowQuestionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Chọn Loại Câu Hỏi (ĐÃ LOẠI BỎ PHẦN 4 TỰ LUẬN) */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">Chọn cấu trúc phần thi:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setModalPart('part_1_mcq')}
                  className={`p-2.5 rounded-xl border font-bold text-xs transition-all ${
                    modalPart === 'part_1_mcq'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Phần 1: MCQ (0.25đ)
                </button>
                <button
                  type="button"
                  onClick={() => setModalPart('part_2_true_false')}
                  className={`p-2.5 rounded-xl border font-bold text-xs transition-all ${
                    modalPart === 'part_2_true_false'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Phần 2: Đúng / Sai (1.0đ)
                </button>
                <button
                  type="button"
                  onClick={() => setModalPart('part_3_short_answer')}
                  className={`p-2.5 rounded-xl border font-bold text-xs transition-all ${
                    modalPart === 'part_3_short_answer'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Phần 3: Trả Lời Ngắn (0.5đ)
                </button>
              </div>
            </div>

            {/* Điểm số */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">Điểm số cho câu hỏi này:</label>
              <input
                type="number"
                step="0.05"
                value={modalPoints}
                onChange={(e) => setModalPoints(parseFloat(e.target.value) || 0.25)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono font-bold"
              />
            </div>

            {/* Nội dung đề bài & Hỗ trợ Dán ảnh clipboard */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Nội dung câu hỏi (Prompt) *</label>
                <span className="text-[11px] text-blue-600 font-semibold">
                  Mẹo: Nhấn Ctrl+V để dán ảnh chụp màn hình trực tiếp!
                </span>
              </div>
              <textarea
                rows={3}
                value={modalPrompt}
                onChange={(e) => setModalPrompt(e.target.value)}
                onPaste={handlePasteImageFromClipboard}
                placeholder="Nhập nội dung đề bài... Bạn có thể nhấn Ctrl+V để dán ảnh bài toán đã chụp."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:outline-none"
              />
            </div>

            {/* ĐÍNH KÈM / DÁN FILE ẢNH & FILE PDF */}
            <div className="space-y-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block">Đính kèm ảnh minh họa hoặc file tài liệu:</span>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold flex items-center gap-1.5"
                >
                  <ImageIcon size={14} className="text-blue-600" />
                  <span>Tải Ảnh Lên (PNG/JPG)</span>
                </button>

                <input
                  type="file"
                  ref={pdfInputRef}
                  onChange={handlePdfFileChange}
                  accept=".pdf"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold flex items-center gap-1.5"
                >
                  <Paperclip size={14} className="text-amber-600" />
                  <span>Đính Kèm File PDF</span>
                </button>

                {/* Preset hình học mẫu */}
                <button
                  type="button"
                  onClick={() =>
                    setModalImageAttachment(
                      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80'
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold flex items-center gap-1.5"
                >
                  <Compass size={14} />
                  <span>Lấy Hình 3D Oxyz Mẫu</span>
                </button>
              </div>

              {/* Preview ảnh đính kèm */}
              {modalImageAttachment && (
                <div className="relative inline-block mt-2">
                  <img
                    src={modalImageAttachment}
                    alt="Preview ảnh đính kèm"
                    className="max-h-36 rounded-xl border border-slate-200 object-contain bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setModalImageAttachment(null)}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-600 text-white shadow-xs"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {modalPdfName && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 mt-2">
                  <div className="flex items-center gap-2">
                    <Paperclip size={14} className="text-amber-600" />
                    <span className="font-semibold text-slate-800">{modalPdfName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalPdfName(null)}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Công thức LaTeX */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">Công thức LaTeX (Tùy chọn)</label>
              <input
                type="text"
                value={modalLatex}
                onChange={(e) => setModalLatex(e.target.value)}
                placeholder="VD: f'(x) = 3x^2 - 6x"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            {/* Form riêng theo từng phần */}
            {modalPart === 'part_1_mcq' && (
              <div className="space-y-2 p-3 rounded-2xl bg-blue-50/50 border border-blue-200 text-xs">
                <span className="font-bold text-blue-900 block">4 Phương án (A, B, C, D):</span>
                {[
                  { key: 'A', val: modalOptA, set: setModalOptA },
                  { key: 'B', val: modalOptB, set: setModalOptB },
                  { key: 'C', val: modalOptC, set: setModalOptC },
                  { key: 'D', val: modalOptD, set: setModalOptD },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalCorrectMcq(item.key as any)}
                      className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                        modalCorrectMcq === item.key
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700'
                      }`}
                    >
                      {item.key}
                    </button>
                    <input
                      type="text"
                      value={item.val}
                      onChange={(e) => item.set(e.target.value)}
                      placeholder={`Phương án ${item.key}`}
                      className="flex-1 h-9 px-3 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                ))}
              </div>
            )}

            {modalPart === 'part_2_true_false' && (
              <div className="space-y-2 p-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-xs">
                <span className="font-bold text-purple-900 block">4 Mệnh đề Đúng / Sai (a, b, c, d):</span>
                {[
                  { key: 'a', st: modalTfA, set: setModalTfA },
                  { key: 'b', st: modalTfB, set: setModalTfB },
                  { key: 'c', st: modalTfC, set: setModalTfC },
                  { key: 'd', st: modalTfD, set: setModalTfD },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-2">
                    <span className="font-bold text-purple-800 w-4">{item.key})</span>
                    <input
                      type="text"
                      value={item.st.text}
                      onChange={(e) => item.set({ ...item.st, text: e.target.value })}
                      placeholder={`Mệnh đề ${item.key}`}
                      className="flex-1 h-9 px-3 rounded-xl border border-slate-300 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => item.set({ ...item.st, isCorrect: !item.st.isCorrect })}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                        item.st.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {item.st.isCorrect ? 'ĐÚNG' : 'SAI'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {modalPart === 'part_3_short_answer' && (
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700">Đáp án ngắn (Tối đa 4 ký tự) *</label>
                <input
                  type="text"
                  maxLength={4}
                  value={modalShortAnswer}
                  onChange={(e) => setModalShortAnswer(e.target.value.trim())}
                  placeholder="VD: 4 hoặc 1/2 hoặc -3.5"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>
            )}

            {/* Lời giải chi tiết */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">Lời giải chi tiết</label>
              <textarea
                rows={2}
                value={modalExplanation}
                onChange={(e) => setModalExplanation(e.target.value)}
                placeholder="Hướng dẫn giải cho học sinh sau khi nộp bài..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveQuestion}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                Lưu Câu Hỏi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA CÂU HỎI */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900">Xóa Câu Hỏi Này?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Bạn có chắc chắn muốn xóa câu hỏi số {questionToDelete.questionNumber} khỏi đề thi không?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setQuestionToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmDeleteQuestion}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL XÁC NHẬN XUẤT BẢN ĐỀ THI                                            */}
      {/* ========================================================================= */}
      {showPublishConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900">Xác Nhận Xuất Bản Đề Thi</h4>
                <p className="text-xs text-slate-500">
                  Vui lòng kiểm tra lại cấu hình đề thi trước khi chính thức áp dụng:
                </p>
              </div>
            </div>

            {/* Bảng tóm tắt thông số đề thi */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-200/70">
                <span className="text-slate-500 font-semibold">Tên đề thi:</span>
                <span className="font-extrabold text-slate-900 text-right">{manualTitle}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-semibold">Khối lớp & Thời gian:</span>
                <span className="font-bold text-slate-800">
                  Khối {manualGrade} · {manualDuration} phút ({manualYear})
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-semibold">Số lượng câu hỏi:</span>
                <span className="font-bold text-slate-800">
                  {manualQuestions.length} câu (P1: {partCounts.part1}, P2: {partCounts.part2}, P3: {partCounts.part3})
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-semibold">Tổng điểm bài thi:</span>
                <span className="font-mono font-black text-blue-700 text-sm">
                  {dynamicTotalPoints.toFixed(2)} điểm
                </span>
              </div>

              <div className="flex items-start justify-between gap-2 pt-2 border-t border-slate-200/70">
                <span className="text-slate-500 font-semibold">Phạm vi giao đề:</span>
                <span className="font-bold text-indigo-700 text-right">
                  {manualDistributionType === 'classroom'
                    ? `Chỉ định ${manualTargetClassIds.length} nhóm lớp: ${classrooms
                        .filter((c) => manualTargetClassIds.includes(c.id))
                        .map((c) => c.name)
                        .join(', ')}`
                    : manualDistributionType === 'repository'
                    ? 'Kho đề thi tổng hợp toàn trường'
                    : `Cả lớp (${classrooms
                        .filter((c) => manualTargetClassIds.includes(c.id))
                        .map((c) => c.name)
                        .join(', ')}) & Kho tổng hợp`}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-semibold">Giới hạn số lượt làm:</span>
                <span className="font-bold text-amber-700">
                  {manualMaxAttempts > 0 ? `Tối đa ${manualMaxAttempts} lượt thi` : 'Không giới hạn lượt làm'}
                </span>
              </div>

              {manualHasTimeWindow && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 font-semibold">Thời hạn mở/đóng:</span>
                  <span className="font-bold text-rose-700 text-right">
                    {manualOpenTime ? `Mở: ${manualOpenTime}` : ''}
                    {manualCloseTime ? ` · Đóng: ${manualCloseTime}` : ''}
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-[11px] leading-relaxed">
              ℹ️ <strong>Thông báo:</strong> Sau khi xác nhận, đề thi sẽ ngay lập tức được xuất bản và hiển thị trong danh sách đề thi của học sinh theo đúng phạm vi đã cài đặt. Thầy/Cô có thể quản lý hoặc gỡ đề bất cứ lúc nào.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPublishConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmPublishExam}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={16} />
                <span>Xác Nhận & Xuất Bản</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
