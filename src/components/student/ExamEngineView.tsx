import React, { useState, useEffect } from 'react';
import { Exam, Question, CheatLog, StudentExamSubmission } from '../../types/math';
import { SAMPLE_EXAM_BGD } from '../../data/mockData';
import { gradePart2TrueFalse, validatePart3ShortAnswerFormat, isAnswerEquivalent } from '../../lib/scoringEngine';
import { MathView } from '../MathView';
import {
  Clock,
  ShieldAlert,
  AlertTriangle,
  Save,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  Send,
  FileCheck,
  History,
  Calendar,
  Lock,
  BookOpen,
  Users,
  Paperclip,
  ZoomIn,
  X,
  Sparkles,
} from 'lucide-react';

interface ExamEngineViewProps {
  onRecordCheatLog: (log: CheatLog) => void;
  examsList?: Exam[];
  activeExamId?: string;
  onSelectExamId?: (id: string) => void;
  onSubmitExam?: (submission: StudentExamSubmission) => void;
  onViewHistory?: () => void;
  studentProfile?: { id: string; name: string; email: string };
  defaultClassId?: string;
  submissions?: StudentExamSubmission[];
}

export const ExamEngineView: React.FC<ExamEngineViewProps> = ({
  onRecordCheatLog,
  examsList = [SAMPLE_EXAM_BGD],
  activeExamId,
  onSelectExamId,
  onSubmitExam,
  onViewHistory,
  studentProfile,
  defaultClassId = 'cls_12a1',
  submissions = [],
}) => {
  const currentExam = examsList.find((e) => e.id === activeExamId) || examsList[0] || SAMPLE_EXAM_BGD;
  const [exam, setExam] = useState<Exam>(currentExam);
  const [timeLeft, setTimeLeft] = useState<number>(currentExam.durationMinutes * 60);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [infractionCount, setInfractionCount] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isDisqualified, setIsDisqualified] = useState<boolean>(false);
  const [scoreReport, setScoreReport] = useState<any | null>(null);
  const [lastAutoSaved, setLastAutoSaved] = useState<string>('');

  // Bộ lọc danh mục đề thi (Giao theo lớp / Kho đề tổng hợp)
  const [examFilterType, setExamFilterType] = useState<'all' | 'classroom' | 'repository'>('all');

  // Modal xem phóng to ảnh đính kèm câu hỏi
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Số lượt làm bài đã thực hiện của học sinh đối với đề thi này
  const studentId = studentProfile?.id || 'usr_student_01';
  const examSubmissions = submissions.filter((s) => s.examId === exam.id && s.studentId === studentId);
  const currentAttemptCount = examSubmissions.length;
  const maxAttemptsAllowed = exam.maxAttempts && exam.maxAttempts > 0 ? exam.maxAttempts : 0;
  const isMaxAttemptsReached = maxAttemptsAllowed > 0 && currentAttemptCount >= maxAttemptsAllowed;

  // Kiểm tra thời gian mở / đóng đề thi
  const currentTime = new Date();
  const isOpenStarted = !exam.openTime || new Date(exam.openTime) <= currentTime;
  const isCloseTimePassed = exam.closeTime ? new Date(exam.closeTime) < currentTime : false;
  const isExamTimeActive = isOpenStarted && !isCloseTimePassed;

  // Cập nhật khi chọn đề thi khác
  useEffect(() => {
    if (currentExam.id !== exam.id) {
      setExam(currentExam);
      setTimeLeft(currentExam.durationMinutes * 60);
      setAnswers({});
      setIsSubmitted(false);
      setIsDisqualified(false);
      setInfractionCount(0);
      setScoreReport(null);
    }
  }, [currentExam]);

  // 1. Khởi tạo & nạp bản nháp từ LocalStorage (Auto-Save Restore)
  useEffect(() => {
    try {
      const draft = localStorage.getItem(`math_draft_${exam.id}`);
      if (draft && !isMaxAttemptsReached && isExamTimeActive) {
        setAnswers(JSON.parse(draft));
        setLastAutoSaved('Đã khôi phục bản nháp trước đó');
      }
    } catch (e) {
      // ignore
    }
  }, [exam.id, isMaxAttemptsReached, isExamTimeActive]);

  // 2. Bộ đếm ngược thời gian làm bài
  useEffect(() => {
    if (isSubmitted || isDisqualified || isMaxAttemptsReached || !isExamTimeActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam('Hết giờ làm bài!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted, isDisqualified, isMaxAttemptsReached, isExamTimeActive]);

  // 3. Tự động lưu bản nháp mỗi 10 giây vào LocalStorage
  useEffect(() => {
    if (isSubmitted || isDisqualified || isMaxAttemptsReached || !isExamTimeActive) return;

    const saveTimer = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        localStorage.setItem(`math_draft_${exam.id}`, JSON.stringify(answers));
        setLastAutoSaved(`Đã lưu nháp lúc ${new Date().toLocaleTimeString('vi-VN')}`);
      }
    }, 10000);

    return () => clearInterval(saveTimer);
  }, [answers, exam.id, isSubmitted, isDisqualified, isMaxAttemptsReached, isExamTimeActive]);

  // 4. Cơ chế chống gian lận đa tầng: Bắt sự kiện rời màn hình / đổi tab
  useEffect(() => {
    if (isSubmitted || isDisqualified || isMaxAttemptsReached || !isExamTimeActive) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        registerInfraction('Chuyển tab trình duyệt hoặc ẩn cửa sổ làm bài');
      }
    };

    const handleWindowBlur = () => {
      registerInfraction('Mất tiêu điểm màn hình bài thi (Alt+Tab hoặc bấm ra ngoài)');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [infractionCount, isSubmitted, isDisqualified, isMaxAttemptsReached, isExamTimeActive]);

  const registerInfraction = (reason: string) => {
    const nextCount = infractionCount + 1;
    setInfractionCount(nextCount);

    const newLog: CheatLog = {
      id: `cl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      examId: exam.id,
      examTitle: exam.title,
      studentId: studentId,
      studentName: studentProfile?.name || 'Nguyễn Văn An (12A1)',
      timestamp: new Date().toISOString(),
      infractionNumber: Math.min(nextCount, 3),
      event: 'window_unfocus',
      reason,
      actionTaken:
        nextCount === 1 ? 'warning_1' : nextCount === 2 ? 'warning_2' : 'auto_submitted_disqualified',
    };

    onRecordCheatLog(newLog);

    if (nextCount === 1) {
      setWarningMessage('Cảnh báo lần 1: Hệ thống phát hiện bạn vừa rời khỏi màn hình bài thi. Hãy tập trung làm bài!');
      setShowWarningModal(true);
    } else if (nextCount === 2) {
      setWarningMessage(
        'Cảnh báo nghiêm trọng lần 2: Bạn đã rời màn hình 2 lần! Nếu tái phạm lần 3, bài thi sẽ bị đình chỉ và nộp tự động ngay lập tức.'
      );
      setShowWarningModal(true);
    } else if (nextCount >= 3) {
      setIsDisqualified(true);
      setShowWarningModal(false);
      handleSubmitExam('Đình chỉ bài thi: Vi phạm quy chế thi quá 3 lần!');
    }
  };

  // 5. Chấm điểm bài thi tự động (CHỈ 3 PHẦN: MCQ, Đúng/Sai, Trả lời ngắn - KHÔNG CÓ TỰ LUẬN)
  // Tổng điểm bài thi dựa hoàn toàn trên tổng điểm từng câu hỏi của bài
  const handleSubmitExam = (disqualifyReason?: string) => {
    let part1Score = 0;
    let part2Score = 0;
    let part3Score = 0;

    let part1Max = 0;
    let part2Max = 0;
    let part3Max = 0;

    const details: Record<string, any> = {};

    exam.questions.forEach((q) => {
      if (q.part === 'part_1_mcq') {
        const qPoints = q.points || 0.25;
        part1Max += qPoints;
        const studentAns = answers[q.id];
        const isCorrect = studentAns === q.correctAnswer;
        const earned = isCorrect ? qPoints : 0;
        part1Score += earned;
        details[q.id] = { isCorrect, earned, maxPoints: qPoints, studentAns, correctAnswer: q.correctAnswer };
      } else if (q.part === 'part_2_true_false') {
        const qPoints = q.points || 1.0;
        part2Max += qPoints;
        const studentTF = {
          a: answers[`${q.id}_a`],
          b: answers[`${q.id}_b`],
          c: answers[`${q.id}_c`],
          d: answers[`${q.id}_d`],
        };
        const correctTF = {
          a: q.items.find((i) => i.subKey === 'a')?.isCorrect || false,
          b: q.items.find((i) => i.subKey === 'b')?.isCorrect || false,
          c: q.items.find((i) => i.subKey === 'c')?.isCorrect || false,
          d: q.items.find((i) => i.subKey === 'd')?.isCorrect || false,
        };
        const rawResult = gradePart2TrueFalse(studentTF, correctTF);
        // Tỷ lệ điểm theo cấu hình q.points của giáo viên
        const scaledEarned = Number(((rawResult.earnedPoints / 1.0) * qPoints).toFixed(2));
        part2Score += scaledEarned;
        details[q.id] = { ...rawResult, earned: scaledEarned, maxPoints: qPoints, studentTF, correctTF };
      } else if (q.part === 'part_3_short_answer') {
        const qPoints = q.points || 0.5;
        part3Max += qPoints;
        const rawAns = answers[q.id] || '';
        const validation = validatePart3ShortAnswerFormat(rawAns);
        const isCorrect = validation.isValidFormat && isAnswerEquivalent(validation.sanitized, q.correctAnswer);
        const earned = isCorrect ? qPoints : 0;
        part3Score += earned;
        details[q.id] = { isCorrect, earned, maxPoints: qPoints, studentAns: rawAns, correctAnswer: q.correctAnswer };
      }
    });

    const totalCalculated = Number((part1Score + part2Score + part3Score).toFixed(2));
    const examTotalPoints = Number((part1Max + part2Max + part3Max).toFixed(2)) || exam.totalPoints || 10;

    setScoreReport({
      totalScore: totalCalculated,
      examTotalPoints,
      part1Score: Number(part1Score.toFixed(2)),
      part1Max: Number(part1Max.toFixed(2)),
      part2Score: Number(part2Score.toFixed(2)),
      part2Max: Number(part2Max.toFixed(2)),
      part3Score: Number(part3Score.toFixed(2)),
      part3Max: Number(part3Max.toFixed(2)),
      details,
      disqualifyReason,
    });

    const timeSpent = exam.durationMinutes * 60 - timeLeft;

    if (onSubmitExam) {
      const submission: StudentExamSubmission = {
        id: `sub_${Date.now()}`,
        examId: exam.id,
        examTitle: exam.title,
        studentId: studentProfile?.id || 'usr_student_01',
        studentName: studentProfile?.name || 'Nguyễn Văn An',
        studentEmail: studentProfile?.email || 'an.nguyen@thpt-nbk.edu.vn',
        classId: defaultClassId,
        submittedAt: new Date().toISOString(),
        score: totalCalculated,
        partScores: {
          part1: Number(part1Score.toFixed(2)),
          part2: Number(part2Score.toFixed(2)),
          part3: Number(part3Score.toFixed(2)),
        },
        answers,
        infractionCount,
        isDisqualified: !!disqualifyReason,
        timeSpentSeconds: timeSpent > 0 ? timeSpent : 60,
      };
      onSubmitExam(submission);
    }

    setIsSubmitted(true);
    localStorage.removeItem(`math_draft_${exam.id}`);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return isoString;
    }
  };

  // Lọc danh sách đề thi theo phân loại
  const filteredExamsList = examsList.filter((e) => {
    if (examFilterType === 'classroom') {
      return e.distributionType === 'classroom' || e.distributionType === 'both';
    }
    if (examFilterType === 'repository') {
      return e.distributionType === 'repository' || e.distributionType === 'both' || !e.distributionType;
    }
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Countdown & Anti-Cheat Sticky Bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Exam Title & Year & Selector */}
        <div className="flex-1 min-w-[240px]">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
              Đề Thi Toán THPT · {exam.durationMinutes} Phút · {exam.totalPoints} Điểm
            </span>

            {/* Phân loại: Giao theo lớp hay Kho tổng hợp */}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                exam.distributionType === 'classroom'
                  ? 'bg-blue-100 text-blue-800'
                  : exam.distributionType === 'repository'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              {exam.distributionType === 'classroom' ? (
                <>
                  <Users size={11} />
                  <span>Giao Theo Nhóm Lớp</span>
                </>
              ) : exam.distributionType === 'repository' ? (
                <>
                  <BookOpen size={11} />
                  <span>Kho Đề Thi Tổng Hợp</span>
                </>
              ) : (
                <>
                  <Sparkles size={11} />
                  <span>Cả Lớp & Kho Tổng Hợp</span>
                </>
              )}
            </span>

            {/* Giới hạn số lượt làm bài badge */}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
              Lượt thi: {currentAttemptCount}/{maxAttemptsAllowed > 0 ? maxAttemptsAllowed : 'Không giới hạn'}
            </span>
          </div>

          {/* Chọn đề thi khác trong kho */}
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">{exam.title}</h2>
            {examsList.length > 1 && (
              <select
                value={exam.id}
                onChange={(e) => {
                  if (onSelectExamId) onSelectExamId(e.target.value);
                  const chosen = examsList.find((ex) => ex.id === e.target.value);
                  if (chosen) setExam(chosen);
                }}
                className="text-xs bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-700 max-w-[200px]"
              >
                {filteredExamsList.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.totalPoints}đ)
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Status Indicators & Submission Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Countdown Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700">
            <Clock size={16} />
            <span className="font-mono font-bold text-base tabular-nums">{formatTimer(timeLeft)}</span>
          </div>

          {/* Anti-Cheat Infraction Indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-bold ${
              infractionCount === 0
                ? 'bg-slate-100 text-slate-600 border-slate-200'
                : infractionCount === 1
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-red-50 text-red-700 border-red-300 animate-pulse'
            }`}
          >
            <ShieldAlert size={15} />
            <span>Vi phạm: {infractionCount}/3</span>
          </div>

          {/* Submit Button */}
          {!isSubmitted && isExamTimeActive && !isMaxAttemptsReached && (
            <button
              onClick={() => handleSubmitExam()}
              className="px-5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
            >
              Nộp Bài Thi
            </button>
          )}
        </div>
      </div>

      {/* CẢNH BÁO: ĐÃ ĐẠT GIỚI HẠN SỐ LƯỢT LÀM BÀI */}
      {isMaxAttemptsReached && !isSubmitted && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Lock size={18} className="text-amber-600" />
            <span>Đã đạt giới hạn số lượt làm bài thi!</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Đề thi này được giáo viên cấu hình giới hạn tối đa <strong>{maxAttemptsAllowed} lượt</strong>. Bạn đã hoàn thành{' '}
            <strong>{currentAttemptCount}/{maxAttemptsAllowed} lượt</strong>. Bạn không thể làm lại đề thi này.
          </p>
          <div className="pt-2 flex gap-2">
            {onViewHistory && (
              <button
                onClick={onViewHistory}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
              >
                <History size={14} />
                <span>Xem Kết Quả Bài Thi Đã Làm</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* CẢNH BÁO: NGOÀI THỜI GIAN MỞ / ĐÓNG ĐỀ THI */}
      {!isExamTimeActive && (
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-300 text-slate-800 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Calendar size={18} className="text-blue-600" />
            <span>
              {!isOpenStarted
                ? `Đề thi chưa mở (Mở lúc: ${formatDateTime(exam.openTime)})`
                : `Đề thi đã đóng (Hết hạn lúc: ${formatDateTime(exam.closeTime)})`}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {!isOpenStarted
              ? 'Phòng thi trực tuyến hiện chưa mở. Vui lòng quay lại đúng khung giờ đã được giáo viên thông báo.'
              : 'Thời hạn làm bài của đề thi này đã kết thúc. Bạn chỉ có thể xem lại tài liệu và lịch sử làm bài trước đó.'}
          </p>
        </div>
      )}

      {/* Auto-Save Draft Status Pill */}
      {lastAutoSaved && !isSubmitted && isExamTimeActive && !isMaxAttemptsReached && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-4">
          <span className="flex items-center gap-1.5">
            <Save size={13} className="text-emerald-600" />
            <span>{lastAutoSaved}</span>
          </span>
          <span className="text-slate-400">Tự động sao lưu vào bộ nhớ cục bộ chống mất điện/mất mạng</span>
        </div>
      )}

      {/* Score Report (When Submitted) */}
      {isSubmitted && scoreReport && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Award size={24} className="text-amber-500" />
                <h3 className="text-2xl font-black text-slate-900">Báo Cáo Kết Quả Bài Thi</h3>
              </div>
              {scoreReport.disqualifyReason ? (
                <p className="text-xs text-red-600 font-bold mt-1">{scoreReport.disqualifyReason}</p>
              ) : (
                <p className="text-xs text-emerald-600 font-bold mt-1">
                  Đã nộp bài hợp lệ · Tuân thủ quy chế thi trực tuyến THPT 2025
                </p>
              )}
            </div>

            {/* Total Score Badge - Tính toán hoàn toàn dựa trên tổng điểm của bài */}
            <div className="text-center bg-blue-50 border border-blue-200 px-6 py-3 rounded-2xl">
              <span className="text-xs font-bold text-blue-600 block uppercase tracking-wider">Tổng Điểm Đạt Được</span>
              <span className="text-3xl font-black text-blue-900 font-mono tabular-nums">
                {scoreReport.totalScore} / {scoreReport.examTotalPoints} điểm
              </span>
            </div>
          </div>

          {/* Part Scores Breakdown (CHỈ 3 PHẦN THI TRẮC NGHIỆM CHUẨN BGD) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
              <span className="text-xs font-bold text-blue-700 block">Phần I: Trắc Nghiệm 4 Lựa Chọn</span>
              <span className="text-xl font-black text-blue-900 font-mono mt-0.5 block">
                {scoreReport.part1Score} / {scoreReport.part1Max} điểm
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
              <span className="text-xs font-bold text-purple-700 block">Phần II: Đúng / Sai 4 Ý</span>
              <span className="text-xl font-black text-purple-900 font-mono mt-0.5 block">
                {scoreReport.part2Score} / {scoreReport.part2Max} điểm
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-xs font-bold text-amber-700 block">Phần III: Trả Lời Ngắn</span>
              <span className="text-xl font-black text-amber-900 font-mono mt-0.5 block">
                {scoreReport.part3Score} / {scoreReport.part3Max} điểm
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            {!isMaxAttemptsReached && (
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setIsDisqualified(false);
                  setInfractionCount(0);
                  setTimeLeft(exam.durationMinutes * 60);
                  setAnswers({});
                }}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw size={15} />
                <span>Làm Lại Đề Thi Này</span>
              </button>
            )}
            {onViewHistory && (
              <button
                onClick={onViewHistory}
                className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <History size={15} />
                <span>Xem Tổng Hợp Bài Đã Làm</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Danh Sách Các Câu Hỏi (CHỈ 3 PHẦN - KHÔNG CÓ TỰ LUẬN) */}
      <div className="space-y-8">
        {/* PHẦN 1: TRẮC NGHIỆM 4 PHƯƠNG ÁN */}
        {exam.questions.some((q) => q.part === 'part_1_mcq') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-extrabold text-xs">Phần I</span>
                <h3 className="font-extrabold text-base text-slate-900">
                  Câu Hỏi Trắc Nghiệm Nhiều Lựa Chọn (4 Chọn 1)
                </h3>
              </div>
              <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-full">
                Tổng:{' '}
                {exam.questions
                  .filter((q) => q.part === 'part_1_mcq')
                  .reduce((sum, q) => sum + (q.points || 0), 0)
                  .toFixed(2)}
                đ
              </span>
            </div>

            {exam.questions
              .filter((q) => q.part === 'part_1_mcq')
              .map((q) => {
                const result = scoreReport?.details[q.id];
                return (
                  <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-blue-600">Câu {q.questionNumber}:</span>
                        <p className="text-sm font-semibold text-slate-900">{q.prompt}</p>
                        {q.latex && <MathView math={q.latex} block />}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">({q.points}đ)</span>
                        {isSubmitted && result && (
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              result.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {result.isCorrect ? `+${q.points}đ` : '0đ'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ảnh đính kèm câu hỏi nếu có */}
                    {q.imageAttachment && (
                      <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
                        <div className="relative group cursor-pointer" onClick={() => setZoomedImage(q.imageAttachment!)}>
                          <img
                            src={q.imageAttachment}
                            alt="Hình vẽ đính kèm đề bài"
                            className="max-h-52 rounded-xl object-contain bg-white"
                          />
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center text-white text-xs font-bold transition-opacity">
                            <ZoomIn size={16} className="mr-1" /> Phóng to hình ảnh
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tài liệu PDF đính kèm nếu có */}
                    {q.pdfAttachmentName && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-xs">
                        <Paperclip size={13} />
                        <span>Tài liệu đính kèm: {q.pdfAttachmentName}</span>
                      </div>
                    )}

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {q.options.map((opt) => {
                        const isSelected = answers[q.id] === opt.key;
                        const isCorrect = q.correctAnswer === opt.key;

                        let borderClass = 'border-slate-200 hover:border-slate-300';
                        if (isSelected) borderClass = 'border-blue-600 bg-blue-50/60 font-bold';

                        if (isSubmitted) {
                          if (isCorrect) borderClass = 'border-emerald-500 bg-emerald-50 font-bold';
                          else if (isSelected) borderClass = 'border-rose-400 bg-rose-50';
                        }

                        return (
                          <button
                            key={opt.key}
                            type="button"
                            disabled={isSubmitted || isMaxAttemptsReached || !isExamTimeActive}
                            onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.key }))}
                            className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${borderClass}`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {opt.key}
                            </span>
                            <div className="text-xs sm:text-sm text-slate-800">
                              <span>{opt.text}</span>
                              {opt.latex && <MathView math={opt.latex} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {isSubmitted && q.explanation && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                        <span className="font-bold text-slate-900 block">Lời giải chi tiết:</span>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* PHẦN 2: TRẮC NGHIỆM ĐÚNG / SAI 4 Ý */}
        {exam.questions.some((q) => q.part === 'part_2_true_false') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-extrabold text-xs">Phần II</span>
                <h3 className="font-extrabold text-base text-slate-900">
                  Câu Hỏi Trắc Nghiệm Đúng / Sai (Mỗi câu gồm 4 ý độc lập)
                </h3>
              </div>
              <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2.5 py-1 rounded-full">
                Tổng:{' '}
                {exam.questions
                  .filter((q) => q.part === 'part_2_true_false')
                  .reduce((sum, q) => sum + (q.points || 0), 0)
                  .toFixed(2)}
                đ
              </span>
            </div>

            {exam.questions
              .filter((q) => q.part === 'part_2_true_false')
              .map((q) => {
                const result = scoreReport?.details[q.id];
                return (
                  <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-purple-600">Câu {q.questionNumber}:</span>
                        <p className="text-sm font-semibold text-slate-900">{q.prompt}</p>
                        {q.latex && <MathView math={q.latex} block />}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">({q.points}đ)</span>
                        {isSubmitted && result && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800">
                            +{result.earned}đ ({result.correctCount}/4 ý)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ảnh đính kèm */}
                    {q.imageAttachment && (
                      <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
                        <div className="relative group cursor-pointer" onClick={() => setZoomedImage(q.imageAttachment!)}>
                          <img
                            src={q.imageAttachment}
                            alt="Hình vẽ đính kèm đề bài"
                            className="max-h-52 rounded-xl object-contain bg-white"
                          />
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center text-white text-xs font-bold transition-opacity">
                            <ZoomIn size={16} className="mr-1" /> Phóng to hình ảnh
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bảng 4 ý a, b, c, d */}
                    <div className="space-y-2 pt-2">
                      {q.items.map((item) => {
                        const answerKey = `${q.id}_${item.subKey}`;
                        const currentVal = answers[answerKey];

                        return (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                          >
                            <div className="text-xs sm:text-sm text-slate-800 flex-1">
                              <span className="font-bold text-purple-700 mr-2">{item.subKey})</span>
                              <span>{item.text}</span>
                              {item.latex && <MathView math={item.latex} />}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                disabled={isSubmitted || isMaxAttemptsReached || !isExamTimeActive}
                                onClick={() => setAnswers((prev) => ({ ...prev, [answerKey]: true }))}
                                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                  currentVal === true
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                ĐÚNG
                              </button>
                              <button
                                type="button"
                                disabled={isSubmitted || isMaxAttemptsReached || !isExamTimeActive}
                                onClick={() => setAnswers((prev) => ({ ...prev, [answerKey]: false }))}
                                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                  currentVal === false
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                SAI
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {isSubmitted && q.explanation && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                        <span className="font-bold text-slate-900 block">Lời giải chi tiết:</span>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* PHẦN 3: CÂU TRẢ LỜI NGẮN (≤ 4 KÝ TỰ) */}
        {exam.questions.some((q) => q.part === 'part_3_short_answer') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-extrabold text-xs">Phần III</span>
                <h3 className="font-extrabold text-base text-slate-900">
                  Câu Hỏi Trả Lời Ngắn (Điền kết quả tối đa 4 ký tự)
                </h3>
              </div>
              <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-full">
                Tổng:{' '}
                {exam.questions
                  .filter((q) => q.part === 'part_3_short_answer')
                  .reduce((sum, q) => sum + (q.points || 0), 0)
                  .toFixed(2)}
                đ
              </span>
            </div>

            {exam.questions
              .filter((q) => q.part === 'part_3_short_answer')
              .map((q) => {
                const result = scoreReport?.details[q.id];
                return (
                  <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-amber-600">Câu {q.questionNumber}:</span>
                        <p className="text-sm font-semibold text-slate-900">{q.prompt}</p>
                        {q.latex && <MathView math={q.latex} block />}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">({q.points}đ)</span>
                        {isSubmitted && result && (
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              result.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {result.isCorrect ? `+${q.points}đ` : '0đ'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ảnh đính kèm */}
                    {q.imageAttachment && (
                      <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
                        <div className="relative group cursor-pointer" onClick={() => setZoomedImage(q.imageAttachment!)}>
                          <img
                            src={q.imageAttachment}
                            alt="Hình vẽ đính kèm đề bài"
                            className="max-h-52 rounded-xl object-contain bg-white"
                          />
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center text-white text-xs font-bold transition-opacity">
                            <ZoomIn size={16} className="mr-1" /> Phóng to hình ảnh
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tài liệu đính kèm */}
                    {q.pdfAttachmentName && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-xs">
                        <Paperclip size={13} />
                        <span>Tài liệu đính kèm: {q.pdfAttachmentName}</span>
                      </div>
                    )}

                    {/* Input trả lời ngắn */}
                    <div className="pt-2">
                      <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                        Đáp án của bạn (Tối đa 4 ký tự: số, dấu âm, dấu phẩy, phân số):
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        disabled={isSubmitted || isMaxAttemptsReached || !isExamTimeActive}
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="VD: 4, -0.5, 2/3"
                        className="w-full sm:w-64 h-11 px-4 rounded-xl border border-slate-300 font-mono font-bold text-base focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {isSubmitted && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                        <span className="font-bold text-amber-700 block">
                          Đáp án chuẩn: <span className="font-mono">{q.correctAnswer}</span>
                        </span>
                        {q.explanation && <p>{q.explanation}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Modal Phóng To Hình Ảnh Đính Kèm */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white p-3 rounded-3xl shadow-2xl animate-in zoom-in-95">
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors"
            >
              <X size={18} />
            </button>
            <img src={zoomedImage} alt="Hình vẽ phóng to" className="max-h-[85vh] w-auto rounded-2xl object-contain" />
          </div>
        </div>
      )}

      {/* Anti-Cheat Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border-2 border-red-500 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-lg font-black text-slate-900">CẢNH BÁO VI PHẠM QUY CHẾ</h4>
              <p className="text-xs font-bold text-red-600">Số lần vi phạm: {infractionCount}/3</p>
            </div>
            <p className="text-sm text-slate-600 text-center leading-relaxed">{warningMessage}</p>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Tôi Đã Hiểu Và Quay Lại Làm Bài
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
