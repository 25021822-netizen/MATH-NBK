import React, { useState } from 'react';
import { Classroom, Exam, Question } from '../../types/math';
import { ParsedExamSchema } from '../../lib/pdfParserSchema';
import { calculateExamTotalPoints } from '../../lib/scoringEngine';
import { SAMPLE_EXAM_BGD } from '../../data/mockData';
import { MathView } from '../MathView';
import {
  FileUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Eye,
  Code2,
  PlusCircle,
  Check,
  RefreshCw,
  Plus,
  Image as ImageIcon,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  HelpCircle,
  Save,
  BookOpen,
  X,
  SlidersHorizontal,
} from 'lucide-react';

interface TeacherPortalViewProps {
  classrooms?: Classroom[];
  teacherName?: string;
  onPublishExam?: (newExam: Exam, targetClassIds?: string[]) => void;
  onPreviewExam?: (exam: Exam, targetClassIds?: string[]) => void;
}

export const TeacherPortalView: React.FC<TeacherPortalViewProps> = ({
  classrooms = [],
  teacherName,
  onPublishExam,
  onPreviewExam,
}) => {
  // Chế độ tạo đề: 'manual' (Tự tạo thủ công) hoặc 'ai_pdf' (Tải lên PDF & AI Parser)
  const [creationMode, setCreationMode] = useState<'manual' | 'ai_pdf'>('manual');

  // ================= STATE DÀNH CHO TẠO ĐỀ THỦ CÔNG (MANUAL BUILDER) =================
  const [manualTitle, setManualTitle] = useState('Đề Kiểm Tra Đánh Giá Năng Lực Toán 12 - THPT NBK');
  const [manualGrade, setManualGrade] = useState<10 | 11 | 12>(12);
  const [manualYear, setManualYear] = useState<number>(2025);
  const [manualDuration, setManualDuration] = useState<number>(90);
  const [manualAvailableFrom, setManualAvailableFrom] = useState('');
  const [manualSubmissionDeadline, setManualSubmissionDeadline] = useState('');
  const [manualMaxAttempts, setManualMaxAttempts] = useState(1);
  const [manualCreatedBy, setManualCreatedBy] = useState(teacherName || 'ThS. Trần Văn Minh - Tổ Toán THPT');
  
  // Danh sách câu hỏi trong đề thi đang soạn
  const [manualQuestions, setManualQuestions] = useState<Question[]>(SAMPLE_EXAM_BGD.questions);

  // Modal thêm/sửa câu hỏi
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form state cho câu hỏi đang tạo/sửa
  const [modalPart, setModalPart] = useState<'part_1_mcq' | 'part_2_true_false' | 'part_3_short_answer'>('part_1_mcq');
  const [modalPrompt, setModalPrompt] = useState('');
  const [modalImageUrl, setModalImageUrl] = useState<string>();
  const [modalImageAlignment, setModalImageAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [modalImageError, setModalImageError] = useState('');
  const [modalLatex, setModalLatex] = useState('');
  const [modalExplanation, setModalExplanation] = useState('');
  const [modalPoints, setModalPoints] = useState<number>(0.25);

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

  // State xác nhận xóa câu hỏi và làm trống đề thi (in-app modal thay vì confirm native)
  const [questionToDelete, setQuestionToDelete] = useState<{ id: string; questionNumber: number; prompt: string } | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState<boolean>(false);

  // ================= STATE DÀNH CHO AI PDF PARSER =================
  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseStatus, setParseStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [zodValidationErrors, setZodValidationErrors] = useState<string[]>([]);
  const [parsedExamData, setParsedExamData] = useState<any | null>(null);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [isAiPublished, setIsAiPublished] = useState<boolean>(false);
  const [targetClassIds, setTargetClassIds] = useState<string[]>([]);

  const toggleTargetClass = (classId: string) => {
    setTargetClassIds((current) =>
      current.includes(classId) ? current.filter((id) => id !== classId) : [...current, classId],
    );
  };

  const handleQuestionImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setModalImageError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setModalImageError('Vui lòng chọn tệp hình ảnh.');
      event.target.value = '';
      return;
    }
    if (file.size > 1024 * 1024) {
      setModalImageError('Ảnh câu hỏi không được vượt quá 1 MB để đảm bảo lưu ổn định.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setModalImageError('Không thể đọc ảnh đã chọn.');
        return;
      }
      setModalImageUrl(reader.result);
    };
    reader.onerror = () => setModalImageError('Đọc ảnh thất bại. Vui lòng thử lại.');
    reader.readAsDataURL(file);
  };

  // Mở modal để tạo câu hỏi mới
  const handleOpenAddQuestion = (partType: 'part_1_mcq' | 'part_2_true_false' | 'part_3_short_answer' = 'part_1_mcq') => {
    setEditingQuestionId(null);
    setModalPart(partType);
    setModalPrompt('');
    setModalImageUrl(undefined);
    setModalImageAlignment('center');
    setModalImageError('');
    setModalLatex('');
    setModalExplanation('');
    
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

  // Mở modal để chỉnh sửa câu hỏi hiện có
  const handleOpenEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setModalPart(q.part);
    setModalPrompt(q.prompt);
    setModalImageUrl(q.imageUrl);
    setModalImageAlignment(q.imageAlignment || 'center');
    setModalImageError('');
    setModalLatex(q.latex || '');
    setModalExplanation(q.explanation || '');
    setModalPoints(q.points);

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

  // Lưu câu hỏi từ modal vào danh sách
  const handleSaveQuestion = () => {
    if (!modalPrompt.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
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
        imageUrl: modalImageUrl,
        imageAlignment: modalImageAlignment,
        options: [
          { key: 'A', text: modalOptA || 'Phương án A' },
          { key: 'B', text: modalOptB || 'Phương án B' },
          { key: 'C', text: modalOptC || 'Phương án C' },
          { key: 'D', text: modalOptD || 'Phương án D' },
        ],
        correctAnswer: modalCorrectMcq,
        explanation: modalExplanation,
        points: modalPoints || 0.25,
      };
    } else if (modalPart === 'part_2_true_false') {
      newQuestion = {
        id: editingQuestionId || `q_${Date.now()}`,
        part: 'part_2_true_false',
        questionNumber,
        prompt: modalPrompt,
        latex: modalLatex || undefined,
        imageUrl: modalImageUrl,
        imageAlignment: modalImageAlignment,
        items: [
          { id: `tf_a_${Date.now()}`, subKey: 'a', text: modalTfA.text || 'Mệnh đề a', isCorrect: modalTfA.isCorrect },
          { id: `tf_b_${Date.now()}`, subKey: 'b', text: modalTfB.text || 'Mệnh đề b', isCorrect: modalTfB.isCorrect },
          { id: `tf_c_${Date.now()}`, subKey: 'c', text: modalTfC.text || 'Mệnh đề c', isCorrect: modalTfC.isCorrect },
          { id: `tf_d_${Date.now()}`, subKey: 'd', text: modalTfD.text || 'Mệnh đề d', isCorrect: modalTfD.isCorrect },
        ],
        explanation: modalExplanation,
        points: modalPoints || 1.0,
      };
    } else if (modalPart === 'part_3_short_answer') {
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
        imageUrl: modalImageUrl,
        imageAlignment: modalImageAlignment,
        correctAnswer: sanitized || '0',
        explanation: modalExplanation,
        points: modalPoints || 0.5,
      };
    }

    if (editingQuestionId) {
      setManualQuestions((prev) => prev.map((q) => (q.id === editingQuestionId ? newQuestion : q)));
    } else {
      setManualQuestions((prev) => [...prev, newQuestion]);
    }

    setShowQuestionModal(false);
  };

  // Yêu cầu xóa câu hỏi (Mở in-app confirmation modal)
  const handleRequestDeleteQuestion = (q: Question) => {
    setQuestionToDelete({ id: q.id, questionNumber: q.questionNumber, prompt: q.prompt });
  };

  // Xác nhận xóa câu hỏi được chọn
  const handleConfirmDeleteQuestion = () => {
    if (!questionToDelete) return;
    const qNum = questionToDelete.questionNumber;
    const updated = manualQuestions.filter((q) => q.id !== questionToDelete.id);
    // Đánh số lại câu hỏi tuần tự từ 1 đến N
    const renumbered = updated.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    setManualQuestions(renumbered);
    setQuestionToDelete(null);
    setPublishSuccessMessage(`Đã xóa thành công câu hỏi số ${qNum} khỏi đề thi.`);
    setTimeout(() => setPublishSuccessMessage(null), 3500);
  };

  // Xác nhận làm trống toàn bộ câu hỏi
  const handleConfirmClearAllQuestions = () => {
    setManualQuestions([]);
    setShowClearAllModal(false);
    setPublishSuccessMessage('Đã làm trống toàn bộ danh sách câu hỏi trong đề thi!');
    setTimeout(() => setPublishSuccessMessage(null), 3500);
  };

  // Di chuyển thứ tự câu hỏi
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === manualQuestions.length - 1)) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const items = [...manualQuestions];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);

    // Đánh số lại
    const renumbered = items.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    setManualQuestions(renumbered);
  };

  // Kiểm tra tính hợp lệ bằng Zod Schema và Xuất bản đề thi thủ công
  const handlePublishManualExam = () => {
    setManualValidationErrors([]);

    const examPayload = {
      metadata: {
        title: manualTitle.trim() || 'Đề Thi Toán Mới',
        grade: manualGrade,
        year: manualYear,
        durationMinutes: manualDuration,
        availableFrom: manualAvailableFrom ? new Date(manualAvailableFrom).toISOString() : undefined,
        submissionDeadline: manualSubmissionDeadline ? new Date(manualSubmissionDeadline).toISOString() : undefined,
        maxAttempts: manualMaxAttempts,
        totalPoints: totalEarnedPoints,
      },
      questions: manualQuestions,
    };

    if (manualAvailableFrom && manualSubmissionDeadline && manualSubmissionDeadline <= manualAvailableFrom) {
      setManualValidationErrors(['Hạn nộp bài phải sau thời điểm bắt đầu được phép làm bài.']);
      return;
    }

    const zodCheck = ParsedExamSchema.safeParse(examPayload);

    if (!zodCheck.success) {
      const errs = zodCheck.error.issues.map((e: any) => `${e.path?.join('.') || 'root'}: ${e.message}`);
      setManualValidationErrors(errs);
      return;
    }

    // Tạo object Exam hoàn chỉnh
    const newExam: Exam = {
      id: `exam_manual_${Date.now()}`,
      title: manualTitle,
      grade: manualGrade,
      year: manualYear,
      durationMinutes: manualDuration,
      availableFrom: manualAvailableFrom ? new Date(manualAvailableFrom).toISOString() : undefined,
      submissionDeadline: manualSubmissionDeadline ? new Date(manualSubmissionDeadline).toISOString() : undefined,
      maxAttempts: manualMaxAttempts,
      totalPoints: totalEarnedPoints,
      status: 'approved',
      createdBy: manualCreatedBy,
      createdAt: new Date().toISOString(),
      questions: manualQuestions,
    };

    if (onPublishExam) {
      onPublishExam(newExam, targetClassIds);
    }

    setPublishSuccessMessage(`Đã xuất bản "${manualTitle}" với ${manualQuestions.length} câu hỏi${targetClassIds.length ? ` và giao cho ${targetClassIds.length} nhóm lớp` : ' vào kho đề thi chung'}.`);
    setTimeout(() => setPublishSuccessMessage(null), 5000);
  };

  const handlePublishParsedExam = () => {
    if (!parsedExamData || !onPublishExam) return;
    if (manualAvailableFrom && manualSubmissionDeadline && manualSubmissionDeadline <= manualAvailableFrom) {
      setManualValidationErrors(['Hạn nộp bài phải sau thời điểm bắt đầu được phép làm bài.']);
      return;
    }
    const scheduledExam: Exam = {
      ...parsedExamData,
      totalPoints: calculateExamTotalPoints(parsedExamData.questions),
      availableFrom: manualAvailableFrom ? new Date(manualAvailableFrom).toISOString() : undefined,
      submissionDeadline: manualSubmissionDeadline ? new Date(manualSubmissionDeadline).toISOString() : undefined,
      maxAttempts: manualMaxAttempts,
    };
    onPublishExam(scheduledExam, targetClassIds);
    setIsAiPublished(true);
    setPublishSuccessMessage(`Đã xuất bản đề PDF mẫu${targetClassIds.length ? ` và giao cho ${targetClassIds.length} nhóm lớp` : ' vào kho đề thi chung'}.`);
    setTimeout(() => setPublishSuccessMessage(null), 5000);
  };

  // Thêm nhanh câu hỏi mẫu theo chuyên đề
  const handleAddSamplePreset = (type: 'derivative' | 'integral' | 'oxyz') => {
    let preset: Question;
    const qNum = manualQuestions.length + 1;

    if (type === 'derivative') {
      preset = {
        id: `q_${Date.now()}`,
        part: 'part_1_mcq',
        questionNumber: qNum,
        prompt: 'Cho hàm số y = x³ - 3x² + 2. Tọa độ điểm cực tiểu của đồ thị hàm số là:',
        latex: 'y = x^3 - 3x^2 + 2',
        options: [
          { key: 'A', text: '(2; -2)' },
          { key: 'B', text: '(0; 2)' },
          { key: 'C', text: '(-2; 2)' },
          { key: 'D', text: '(2; 2)' },
        ],
        correctAnswer: 'A',
        explanation: 'y\' = 3x² - 6x = 0 ⇔ x = 0 hoặc x = 2. y\'\'(2) = 6 > 0 nên x = 2 là điểm cực tiểu, y(2) = -2.',
        points: 0.25,
      };
    } else if (type === 'integral') {
      preset = {
        id: `q_${Date.now()}`,
        part: 'part_3_short_answer',
        questionNumber: qNum,
        prompt: 'Tính tích phân I = ∫_0^1 (2x + 1) dx:',
        latex: 'I = \\int_0^1 (2x + 1) \\, dx',
        correctAnswer: '2',
        explanation: 'I = [x² + x]_0^1 = (1 + 1) - 0 = 2.',
        points: 0.5,
      };
    } else if (type === 'oxyz') {
      preset = {
        id: `q_${Date.now()}`,
        part: 'part_2_true_false',
        questionNumber: qNum,
        prompt: 'Trong không gian Oxyz, cho mặt cầu (S): (x-1)² + (y+2)² + z² = 9 và mặt phẳng (P): 2x - y + 2z + 1 = 0. Xét các khẳng định:',
        latex: '(S): (x-1)^2 + (y+2)^2 + z^2 = 9',
        items: [
          { id: `tf_a_${Date.now()}`, subKey: 'a', text: 'Mặt cầu (S) có tâm I(1; -2; 0) và bán kính R = 3.', isCorrect: true },
          { id: `tf_b_${Date.now()}`, subKey: 'b', text: 'Khoảng cách từ tâm I đến (P) bằng 2.', isCorrect: false },
          { id: `tf_c_${Date.now()}`, subKey: 'c', text: 'Mặt phẳng (P) cắt mặt cầu (S) theo giao tuyến là đường tròn.', isCorrect: true },
          { id: `tf_d_${Date.now()}`, subKey: 'd', text: 'Bán kính đường tròn giao tuyến bằng √5.', isCorrect: true },
        ],
        explanation: 'd(I, P) = |2(1) - (-2) + 2(0) + 1| / √(4+1+4) = 5/3 < 3 nên cắt mặt cầu.',
        points: 1.0,
      };
    }

    setManualQuestions((prev) => [...prev, preset]);
  };

  // Tính tổng điểm tích lũy của đề thi
  const totalEarnedPoints = calculateExamTotalPoints(manualQuestions);
  const partCounts = {
    part1: manualQuestions.filter((q) => q.part === 'part_1_mcq').length,
    part2: manualQuestions.filter((q) => q.part === 'part_2_true_false').length,
    part3: manualQuestions.filter((q) => q.part === 'part_3_short_answer').length,
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
            Cổng Soạn Thảo & Quản Lý Đề Thi Giáo Viên
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Biên Soạn Đề Thi Chuẩn Bộ GD&ĐT
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
            Tự do tạo đề thi thủ công với ba dạng câu hỏi linh hoạt hoặc tải file PDF để AI tự động trích xuất.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold shrink-0">
          <button
            onClick={() => setCreationMode('manual')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              creationMode === 'manual'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 size={15} />
            <span>Tự Tạo Đề Thủ Công</span>
          </button>
          <button
            onClick={() => setCreationMode('ai_pdf')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              creationMode === 'ai_pdf'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileUp size={15} />
            <span>Tải File PDF & AI Parser</span>
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 sm:p-5">
        <h2 className="text-sm font-extrabold text-indigo-950">Giao đề cho nhóm lớp</h2>
        <p className="mt-1 text-xs text-indigo-800">Chọn lớp nhận đề ngay khi xuất bản. Nếu không chọn lớp, đề chỉ được lưu vào kho đề chung.</p>
        {classrooms.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {classrooms.map((room) => (
              <label key={room.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                <input type="checkbox" checked={targetClassIds.includes(room.id)} onChange={() => toggleTargetClass(room.id)} className="accent-indigo-600" />
                {room.name}
              </label>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs font-semibold text-amber-800">Bạn chưa có nhóm lớp do mình quản lý.</p>
        )}
      </section>

      {/* Success Notification */}
      {publishSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{publishSuccessMessage}</span>
          </div>
          {onPreviewExam && (
            <button
              onClick={() => {
                const newExam: Exam = {
                  id: `exam_manual_${Date.now()}`,
                  title: manualTitle,
                  grade: manualGrade,
                  year: manualYear,
                  durationMinutes: manualDuration,
                  availableFrom: manualAvailableFrom ? new Date(manualAvailableFrom).toISOString() : undefined,
                  submissionDeadline: manualSubmissionDeadline ? new Date(manualSubmissionDeadline).toISOString() : undefined,
                  maxAttempts: manualMaxAttempts,
                  totalPoints: totalEarnedPoints,
                  status: 'approved',
                  createdBy: manualCreatedBy,
                  createdAt: new Date().toISOString(),
                  questions: manualQuestions,
                };
                onPreviewExam(newExam, targetClassIds);
              }}
              className="px-3 py-1 bg-white text-emerald-700 rounded-lg border border-emerald-300 hover:bg-emerald-100 text-xs font-bold"
            >
              Vào Thi Thử Ngay
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: TỰ TẠO ĐỀ THI THỦ CÔNG (MANUAL EXAM BUILDER)                       */}
      {/* ========================================================================= */}
      {creationMode === 'manual' && (
        <div className="space-y-6">
          {/* Metadata Configuration Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <SlidersHorizontal size={18} className="text-blue-600" />
                <span>Thông Số & Cấu Hình Đề Thi</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">Định dạng chuẩn BGD 2025</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Tiêu đề */}
              <div className="md:col-span-8 space-y-1">
                <label className="text-xs font-bold text-slate-700">Tên Đề Thi</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Nhập tên đề thi khảo sát hoặc kiểm tra..."
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Khối lớp */}
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-slate-700">Khối Lớp</label>
                <select
                  value={manualGrade}
                  onChange={(e) => setManualGrade(Number(e.target.value) as 10 | 11 | 12)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value={12}>Lớp 12 (Tốt nghiệp THPT)</option>
                  <option value={11}>Lớp 11 (Chương trình mới)</option>
                  <option value={10}>Lớp 10 (Chương trình mới)</option>
                </select>
              </div>

              {/* Năm học */}
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-slate-700">Năm Học</label>
                <input
                  type="number"
                  value={manualYear}
                  onChange={(e) => setManualYear(parseInt(e.target.value) || 2025)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Thời gian làm bài */}
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-slate-700">Thời Gian Làm Bài</label>
                <select
                  value={manualDuration}
                  onChange={(e) => setManualDuration(parseInt(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value={45}>45 phút (Kiểm tra 1 tiết)</option>
                  <option value={60}>60 phút (Giữa kỳ)</option>
                  <option value={90}>90 phút (Học kỳ / THPT QG)</option>
                  <option value={120}>120 phút (Đánh giá năng lực)</option>
                </select>
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-slate-700">Bắt đầu được phép làm bài</label>
                <input type="datetime-local" value={manualAvailableFrom} onChange={(event) => setManualAvailableFrom(event.target.value)} className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm" />
                <span className="text-[10px] text-slate-500">Để trống nếu mở bài ngay sau khi giao.</span>
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-slate-700">Hạn cuối nộp bài</label>
                <input type="datetime-local" value={manualSubmissionDeadline} onChange={(event) => setManualSubmissionDeadline(event.target.value)} min={manualAvailableFrom || undefined} className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm" />
                <span className="text-[10px] text-slate-500">Để trống nếu không đặt hạn chung.</span>
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-slate-700">Số lượt làm tối đa</label>
                <input type="number" min={1} max={99} step={1} value={manualMaxAttempts} onChange={(event) => setManualMaxAttempts(Math.max(1, Math.min(99, Number(event.target.value) || 1)))} className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm" />
              </div>

              {/* Giáo viên biên soạn */}
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-slate-700">Giáo Viên Soạn Thảo</label>
                <input
                  type="text"
                  value={manualCreatedBy}
                  onChange={(e) => setManualCreatedBy(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Quick Statistics Bar & Quick Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold block">Tổng Số Câu</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
                {manualQuestions.length}
              </span>
              <span className="text-[10px] text-blue-600 font-bold">{totalEarnedPoints.toFixed(2)} điểm tối đa</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center shadow-xs">
              <span className="text-[11px] text-blue-700 font-semibold block">Phần I (MCQ)</span>
              <span className="text-2xl font-black text-blue-900 font-mono mt-0.5 block">
                {partCounts.part1}
              </span>
              <span className="text-[10px] text-blue-600 font-bold">4 lựa chọn</span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-center shadow-xs">
              <span className="text-[11px] text-purple-700 font-semibold block">Phần II (Đúng/Sai)</span>
              <span className="text-2xl font-black text-purple-900 font-mono mt-0.5 block">
                {partCounts.part2}
              </span>
              <span className="text-[10px] text-purple-600 font-bold">4 ý độc lập</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center shadow-xs">
              <span className="text-[11px] text-amber-700 font-semibold block">Phần III (Ngắn)</span>
              <span className="text-2xl font-black text-amber-900 font-mono mt-0.5 block">
                {partCounts.part3}
              </span>
              <span className="text-[10px] text-amber-600 font-bold">≤ 4 ký tự</span>
            </div>
          </div>

          {/* Quick Action Strip */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            {/* Add question buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Thêm câu hỏi:</span>
              <button
                onClick={() => handleOpenAddQuestion('part_1_mcq')}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>+ Phần 1 (MCQ)</span>
              </button>
              <button
                onClick={() => handleOpenAddQuestion('part_2_true_false')}
                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>+ Phần 2 (Đúng/Sai)</span>
              </button>
              <button
                onClick={() => handleOpenAddQuestion('part_3_short_answer')}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs border border-amber-200 flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>+ Phần 3 (Trả lời ngắn)</span>
              </button>
            </div>

            {/* Publish & Presets */}
            <div className="flex items-center gap-2">
              {/* Presets dropdown */}
              <div className="relative group">
                <button className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 flex items-center gap-1">
                  <Sparkles size={13} className="text-amber-500" />
                  <span>+ Mẫu Chuyên Đề</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-lg border border-slate-200 p-2 space-y-1 hidden group-hover:block z-30">
                  <button
                    onClick={() => handleAddSamplePreset('derivative')}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl"
                  >
                    + Cực trị & Đạo hàm
                  </button>
                  <button
                    onClick={() => handleAddSamplePreset('integral')}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl"
                  >
                    + Tích phân xác định
                  </button>
                  <button
                    onClick={() => handleAddSamplePreset('oxyz')}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl"
                  >
                    + Hình học Oxyz
                  </button>
                </div>
              </div>

              {/* Nút Làm trống toàn bộ câu hỏi (với in-app confirmation modal) */}
              {manualQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearAllModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center gap-1.5 transition-colors"
                  title="Xóa toàn bộ câu hỏi trong đề để soạn lại từ đầu"
                >
                  <Trash2 size={13} />
                  <span>Làm Trống Đề</span>
                </button>
              )}

              {/* Publish Button */}
              <button
                onClick={handlePublishManualExam}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all"
              >
                <Save size={15} />
                <span>Xuất Bản Đề Thi</span>
              </button>
            </div>
          </div>

          {/* Validation Errors Box */}
          {manualValidationErrors.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-700">
                <AlertCircle size={16} />
                <span>Cảnh báo Zod Schema Validation:</span>
              </div>
              <ul className="list-disc pl-5 font-mono text-[11px] space-y-0.5">
                {manualValidationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* List of Questions */}
          <div className="space-y-4">
            {manualQuestions.map((q, index) => (
              <div
                key={q.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs hover:border-slate-300 transition-all"
              >
                {/* Header Row: Question number, Part badge, Reorder, Edit, Delete */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {q.questionNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        q.part === 'part_1_mcq'
                          ? 'bg-blue-100 text-blue-700'
                          : q.part === 'part_2_true_false'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {q.part === 'part_1_mcq'
                        ? 'Phần I: Trắc nghiệm 4 lựa chọn'
                        : q.part === 'part_2_true_false'
                        ? 'Phần II: Đúng/Sai 4 ý'
                        : 'Phần III: Trả lời ngắn'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Điểm: {q.points}đ</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveQuestion(index, 'up')}
                      disabled={index === 0}
                      title="Chuyển lên"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      onClick={() => handleMoveQuestion(index, 'down')}
                      disabled={index === manualQuestions.length - 1}
                      title="Chuyển xuống"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      onClick={() => handleOpenEditQuestion(q)}
                      title="Chỉnh sửa câu hỏi"
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestDeleteQuestion(q);
                      }}
                      title={`Xóa câu hỏi số ${q.questionNumber}`}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Prompt & LaTeX */}
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">{q.prompt}</p>
                  {q.imageUrl && <img src={q.imageUrl} alt={`Hình minh họa câu ${q.questionNumber}`} className={`block max-h-80 rounded-xl border border-slate-200 object-contain ${q.imageAlignment === 'left' ? 'mr-auto' : q.imageAlignment === 'right' ? 'ml-auto' : 'mx-auto'}`} />}
                  {q.latex && (
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <MathView math={q.latex} block />
                    </div>
                  )}
                </div>

                {/* Part-Specific Content Preview */}
                {q.part === 'part_1_mcq' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt) => (
                      <div
                        key={opt.key}
                        className={`p-3 rounded-2xl border flex items-center justify-between ${
                          opt.key === q.correctAnswer
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>
                          <strong className="mr-2">{opt.key}.</strong>
                          {opt.text}
                        </span>
                        {opt.key === q.correctAnswer && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">
                            Đáp án đúng
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {q.part === 'part_2_true_false' && (
                  <div className="space-y-2 text-xs">
                    {q.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <div className="flex-1 pr-4">
                          <strong className="text-purple-600 mr-2">{item.subKey})</strong>
                          <span>{item.text}</span>
                          {item.latex && <MathView math={item.latex} className="ml-2" />}
                        </div>
                        <span
                          className={`font-extrabold text-[10px] px-2.5 py-1 rounded-lg uppercase ${
                            item.isCorrect
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {item.isCorrect ? 'ĐÚNG' : 'SAI'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {q.part === 'part_3_short_answer' && (
                  <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs flex items-center justify-between">
                    <span className="text-slate-600 font-semibold">Đáp án ngắn (Tối đa 4 ký tự):</span>
                    <span className="font-mono font-black text-amber-900 text-sm bg-white px-3 py-1 rounded-xl border border-amber-300">
                      {q.correctAnswer}
                    </span>
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="text-xs text-slate-500 pt-1">
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
      {/* MODE 2: TẢI FILE PDF & AI BÓC TÁCH (AI PDF PARSER)                         */}
      {/* ========================================================================= */}
      {creationMode === 'ai_pdf' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-xs">
            <div
              onClick={() => {
                setFileName('De_Thi_Thu_Toan_Chuyen_2025.pdf');
                setIsParsing(true);
                setTimeout(() => {
                  setParsedExamData(SAMPLE_EXAM_BGD);
                  setParseStatus('success');
                  setIsParsing(false);
                }, 1800);
              }}
              className="border-2 border-dashed border-blue-400 bg-blue-50/40 hover:bg-blue-50 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-3">
                <FileUp size={32} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                {fileName || 'Chọn hoặc kéo thả tệp PDF Đề thi Toán'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Hỗ trợ định dạng PDF chuẩn BGD. AI tự động bóc tách các dạng câu hỏi được hỗ trợ và kiểm tra tính toàn vẹn qua Zod Schema.
              </p>
              <button
                disabled={isParsing}
                className="mt-4 px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-2"
              >
                {isParsing ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
                <span>{isParsing ? 'AI đang bóc tách nội dung...' : 'Bóc Tách Với Đề PDF Mẫu'}</span>
              </button>
            </div>

            {/* Status Alert */}
            {parseStatus === 'success' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>Cấu trúc đề thi hợp lệ theo Zod Schema</span>
                </div>
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="px-3 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-700 font-mono text-[11px] hover:bg-emerald-100 flex items-center gap-1.5"
                >
                  <Code2 size={13} />
                  <span>{showRawJson ? 'Ẩn mã JSON' : 'Xem JSON Schema'}</span>
                </button>
              </div>
            )}

            {parseStatus === 'success' && parsedExamData && (
              <button
                type="button"
                disabled={isAiPublished}
                onClick={handlePublishParsedExam}
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAiPublished ? 'Đề đã xuất bản' : 'Xuất bản và giao đề đã bóc tách'}
              </button>
            )}

            {/* Raw JSON viewer */}
            {showRawJson && parsedExamData && (
              <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-80">
                <pre>{JSON.stringify(parsedExamData, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL THÊM / SỬA CÂU HỎI THỦ CÔNG                                          */}
      {/* ========================================================================= */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  {editingQuestionId ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới Vào Đề Thi'}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Định Dạng Chuẩn Bộ Giáo Dục & Đào Tạo
                </h3>
              </div>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Step 1: Chọn Phần thi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Phần Câu Hỏi (Bộ GD&ĐT)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'part_1_mcq', label: 'Phần I: MCQ', points: 0.25 },
                  { id: 'part_2_true_false', label: 'Phần II: Đúng/Sai', points: 1.0 },
                  { id: 'part_3_short_answer', label: 'Phần III: Ngắn', points: 0.5 },
                ].map((pt) => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => {
                      setModalPart(pt.id as 'part_1_mcq' | 'part_2_true_false' | 'part_3_short_answer');
                      setModalPoints(pt.points);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all ${
                      modalPart === pt.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Nội dung câu hỏi (Prompt) & LaTeX */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nội Dung Đề Bài (Prompt)</label>
                <textarea
                  rows={3}
                  value={modalPrompt}
                  onChange={(e) => setModalPrompt(e.target.value)}
                  placeholder="Ví dụ: Cho hàm số y = f(x) có bảng biến thiên... Tìm số điểm cực trị của hàm số:"
                  className="w-full p-3 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600 text-slate-900"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100">
                    <ImageIcon size={15} />
                    {modalImageUrl ? 'Đổi ảnh câu hỏi' : 'Chèn ảnh câu hỏi'}
                    <input type="file" accept="image/*" onChange={handleQuestionImageChange} className="sr-only" />
                  </label>
                  <span className="text-[11px] text-slate-500">PNG, JPG hoặc WebP · tối đa 1 MB</span>
                  {modalImageUrl && (
                    <button
                      type="button"
                      onClick={() => setModalImageUrl(undefined)}
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>
                {modalImageError && <p role="alert" className="text-xs font-semibold text-rose-700">{modalImageError}</p>}
                {modalImageUrl && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">Căn ảnh:</span>
                      {(['left', 'center', 'right'] as const).map((alignment) => (
                        <button
                          key={alignment}
                          type="button"
                          aria-pressed={modalImageAlignment === alignment}
                          onClick={() => setModalImageAlignment(alignment)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${modalImageAlignment === alignment ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-600'}`}
                        >
                          {alignment === 'left' ? 'Trái' : alignment === 'center' ? 'Giữa' : 'Phải'}
                        </button>
                      ))}
                    </div>
                    <img src={modalImageUrl} alt="Xem trước ảnh câu hỏi" className={`mt-2 block max-h-64 rounded-xl border border-slate-200 object-contain ${modalImageAlignment === 'left' ? 'mr-auto' : modalImageAlignment === 'right' ? 'ml-auto' : 'mx-auto'}`} />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Công Thức Toán Học LaTeX (Tùy chọn)</span>
                  <span className="text-[10px] text-blue-600 font-mono">KaTeX Live Preview</span>
                </label>
                <input
                  type="text"
                  value={modalLatex}
                  onChange={(e) => setModalLatex(e.target.value)}
                  placeholder="Ví dụ: f'(x) = x(x-1)^2 hoặc \int_0^1 x \sin(x) dx"
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:border-blue-600 text-slate-900"
                />
                {modalLatex && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs">
                    <MathView math={modalLatex} block />
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Các phương án / Mệnh đề theo từng phần */}
            {modalPart === 'part_1_mcq' && (
              <div className="space-y-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
                <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                  <span>4 Phương Án Lựa Chọn (A, B, C, D)</span>
                  <span>Chọn đáp án đúng</span>
                </div>
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
                      className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center transition-all ${
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
                      placeholder={`Nội dung phương án ${item.key}`}
                      className="flex-1 h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                ))}
              </div>
            )}

            {modalPart === 'part_2_true_false' && (
              <div className="space-y-3 p-4 rounded-2xl bg-purple-50/50 border border-purple-200">
                <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                  <span>4 Mệnh Đề Độc Lập (a, b, c, d)</span>
                  <span>Đánh dấu Đúng / Sai</span>
                </div>
                {[
                  { key: 'a', state: modalTfA, set: setModalTfA },
                  { key: 'b', state: modalTfB, set: setModalTfB },
                  { key: 'c', state: modalTfC, set: setModalTfC },
                  { key: 'd', state: modalTfD, set: setModalTfD },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-2">
                    <span className="font-bold text-xs text-purple-700 w-5">{item.key})</span>
                    <input
                      type="text"
                      value={item.state.text}
                      onChange={(e) => item.set({ ...item.state, text: e.target.value })}
                      placeholder={`Nội dung mệnh đề ${item.key}`}
                      className="flex-1 h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-purple-600"
                    />
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => item.set({ ...item.state, isCorrect: true })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          item.state.isCorrect
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-700'
                        }`}
                      >
                        Đúng
                      </button>
                      <button
                        type="button"
                        onClick={() => item.set({ ...item.state, isCorrect: false })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          !item.state.isCorrect
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-700'
                        }`}
                      >
                        Sai
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {modalPart === 'part_3_short_answer' && (
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
                <label className="text-xs font-bold text-amber-900 block">
                  Đáp Án Ngắn (Tối đa 4 ký tự/chữ số: [0-9], '-', ',', '.', '/')
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={modalShortAnswer}
                  onChange={(e) => setModalShortAnswer(e.target.value)}
                  placeholder="Ví dụ: 4 hoặc -2/3 hoặc 3,14"
                  className="w-full sm:w-64 h-11 px-4 rounded-xl border border-slate-300 font-mono font-bold text-base bg-white focus:outline-none focus:border-amber-600"
                />
                <span className="text-[11px] text-slate-500 block">
                  Độ dài hiện tại: {modalShortAnswer.length}/4 ký tự
                </span>
              </div>
            )}

            {/* Step 4: Lời giải chi tiết & Điểm */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-9 space-y-1">
                <label className="text-xs font-bold text-slate-700">Lời Giải Chi Tiết / Hướng Dẫn Chấm</label>
                <textarea
                  rows={2}
                  value={modalExplanation}
                  onChange={(e) => setModalExplanation(e.target.value)}
                  placeholder="Giải thích ngắn gọn các bước để học sinh xem lại sau khi nộp bài..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600 text-slate-900"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-xs font-bold text-slate-700">Điểm Câu Hỏi</label>
                <input
                  type="number"
                  step={0.05}
                  value={modalPoints}
                  onChange={(e) => setModalPoints(parseFloat(e.target.value) || 0.25)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="flex-1 py-3 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveQuestion}
                className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={16} />
                <span>{editingQuestionId ? 'Cập Nhật Câu Hỏi' : 'Lưu Vào Đề Thi'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: XÁC NHẬN XÓA 1 CÂU HỎI (IN-APP MODAL THAY CHO WINDOW.CONFIRM)     */}
      {/* ========================================================================= */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="text-base font-extrabold text-slate-900">
                Xác Nhận Xóa Câu Hỏi Số {questionToDelete.questionNumber}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2 px-2">
                &ldquo;{questionToDelete.prompt}&rdquo;
              </p>
              <p className="text-[11px] text-rose-600 font-semibold">
                Thao tác này sẽ gỡ bỏ câu hỏi và tự động đánh số lại các câu còn lại.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setQuestionToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteQuestion}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: XÁC NHẬN LÀM TRỐNG TOÀN BỘ CÂU HỎI                                */}
      {/* ========================================================================= */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="text-base font-extrabold text-slate-900">
                Làm Trống Toàn Bộ Đề Thi?
              </h4>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa toàn bộ <strong>{manualQuestions.length} câu hỏi</strong> đang có trong đề để soạn lại từ đầu không?
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Giữ Lại
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAllQuestions}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Xác Nhận Làm Trống
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
