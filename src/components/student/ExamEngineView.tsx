import React, { useState, useEffect, useRef } from 'react';
import { Exam, Question, CheatLog } from '../../types/math';
import { SAMPLE_EXAM_BGD } from '../../data/mockData';
import { gradePart2TrueFalse, validatePart3ShortAnswerFormat, isAnswerEquivalent } from '../../lib/scoringEngine';
import { MathView } from '../MathView';
import { Clock, ShieldAlert, AlertTriangle, Save, CheckCircle2, XCircle, Award, RotateCcw, Send, FileCheck } from 'lucide-react';

interface ExamEngineViewProps {
  onRecordCheatLog: (log: CheatLog) => void;
}

export const ExamEngineView: React.FC<ExamEngineViewProps> = ({ onRecordCheatLog }) => {
  const [exam, setExam] = useState<Exam>(SAMPLE_EXAM_BGD);
  const [timeLeft, setTimeLeft] = useState<number>(90 * 60); // 90 phút (5400 giây)
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [infractionCount, setInfractionCount] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isDisqualified, setIsDisqualified] = useState<boolean>(false);
  const [scoreReport, setScoreReport] = useState<any | null>(null);
  const [lastAutoSaved, setLastAutoSaved] = useState<string>('');

  // 1. Khởi tạo & nạp bản nháp từ LocalStorage (Auto-Save Restore)
  useEffect(() => {
    try {
      const draft = localStorage.getItem(`math_draft_${exam.id}`);
      if (draft) {
        setAnswers(JSON.parse(draft));
        setLastAutoSaved('Đã khôi phục bản nháp trước đó');
      }
    } catch (e) {
      // ignore
    }
  }, [exam.id]);

  // 2. Bộ đếm ngược thời gian làm bài
  useEffect(() => {
    if (isSubmitted || isDisqualified) return;

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
  }, [isSubmitted, isDisqualified]);

  // 3. Tự động lưu bản nháp mỗi 10 giây vào LocalStorage
  useEffect(() => {
    if (isSubmitted || isDisqualified) return;

    const saveTimer = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        localStorage.setItem(`math_draft_${exam.id}`, JSON.stringify(answers));
        setLastAutoSaved(`Đã lưu nháp lúc ${new Date().toLocaleTimeString('vi-VN')}`);
      }
    }, 10000);

    return () => clearInterval(saveTimer);
  }, [answers, exam.id, isSubmitted, isDisqualified]);

  // 4. Cơ chế chống gian lận đa tầng: Bắt sự kiện rời màn hình / đổi tab
  useEffect(() => {
    if (isSubmitted || isDisqualified) return;

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
  }, [infractionCount, isSubmitted, isDisqualified]);

  const registerInfraction = (reason: string) => {
    const nextCount = infractionCount + 1;
    setInfractionCount(nextCount);

    const newLog: CheatLog = {
      id: `cl_${Date.now()}`,
      examId: exam.id,
      examTitle: exam.title,
      studentId: 'usr_student_01',
      studentName: 'Nguyễn Văn An (12A1)',
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
      setWarningMessage('Cảnh báo nghiêm trọng lần 2: Bạn đã rời màn hình 2 lần! Nếu tái phạm lần 3, bài thi sẽ bị đình chỉ và nộp tự động ngay lập tức.');
      setShowWarningModal(true);
    } else if (nextCount >= 3) {
      setIsDisqualified(true);
      setShowWarningModal(false);
      handleSubmitExam('Đình chỉ bài thi: Vi phạm quy chế thi quá 3 lần!');
    }
  };

  // 5. Chấm điểm bài thi tự động chuẩn BGD 2025
  const handleSubmitExam = (disqualifyReason?: string) => {
    let totalScore = 0;
    let part1Score = 0;
    let part2Score = 0;
    let part3Score = 0;
    let part4Score = 0;

    const details: Record<string, any> = {};

    exam.questions.forEach((q) => {
      if (q.part === 'part_1_mcq') {
        const studentAns = answers[q.id];
        const isCorrect = studentAns === q.correctAnswer;
        const earned = isCorrect ? q.points : 0;
        part1Score += earned;
        details[q.id] = { isCorrect, earned, studentAns, correctAnswer: q.correctAnswer };
      } else if (q.part === 'part_2_true_false') {
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
        const result = gradePart2TrueFalse(studentTF, correctTF);
        part2Score += result.earnedPoints;
        details[q.id] = { ...result, studentTF, correctTF };
      } else if (q.part === 'part_3_short_answer') {
        const rawAns = answers[q.id] || '';
        const validation = validatePart3ShortAnswerFormat(rawAns);
        const isCorrect = validation.isValidFormat && isAnswerEquivalent(validation.sanitized, q.correctAnswer);
        const earned = isCorrect ? q.points : 0;
        part3Score += earned;
        details[q.id] = { isCorrect, earned, studentAns: rawAns, correctAnswer: q.correctAnswer };
      } else if (q.part === 'part_4_essay') {
        const rawAns = answers[q.id] || '';
        const isCorrect = isAnswerEquivalent(rawAns, q.correctAnswer, q.acceptedVariants);
        const earned = isCorrect ? q.points : 0;
        part4Score += earned;
        details[q.id] = { isCorrect, earned, studentAns: rawAns, correctAnswer: q.correctAnswer };
      }
    });

    totalScore = part1Score + part2Score + part3Score + part4Score;

    setScoreReport({
      totalScore: totalScore.toFixed(2),
      part1Score: part1Score.toFixed(2),
      part2Score: part2Score.toFixed(2),
      part3Score: part3Score.toFixed(2),
      part4Score: part4Score.toFixed(2),
      details,
      disqualifyReason,
    });

    setIsSubmitted(true);
    localStorage.removeItem(`math_draft_${exam.id}`);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Countdown & Anti-Cheat Sticky Bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Exam Title & Year */}
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 block">
            Đề Thi Chuẩn BGD 2025 · Thời Gian: {exam.durationMinutes} Phút
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">{exam.title}</h2>
        </div>

        {/* Status Indicators & Submission Action */}
        <div className="flex items-center gap-4">
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
          {!isSubmitted && (
            <button
              onClick={() => handleSubmitExam()}
              className="px-5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
            >
              Nộp Bài Thi
            </button>
          )}
        </div>
      </div>

      {/* Auto-Save Draft Status Pill */}
      {lastAutoSaved && !isSubmitted && (
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
                <p className="text-xs text-red-600 font-bold mt-1">
                  {scoreReport.disqualifyReason}
                </p>
              ) : (
                <p className="text-xs text-emerald-600 font-bold mt-1">
                  Đã nộp bài hợp lệ · Tuân thủ quy chế thi trực tuyến
                </p>
              )}
            </div>

            {/* Total Score Badge */}
            <div className="text-center bg-blue-50 border border-blue-200 px-6 py-3 rounded-2xl">
              <span className="text-xs font-bold text-blue-600 block uppercase tracking-wider">Tổng Điểm</span>
              <span className="text-3xl font-black text-blue-900 font-mono tabular-nums">
                {scoreReport.totalScore} / 10.0
              </span>
            </div>
          </div>

          {/* Part Scores Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">Phần I (MCQ)</span>
              <span className="text-lg font-bold text-slate-900">{scoreReport.part1Score} / 0.50</span>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
              <span className="text-xs text-purple-700 block">Phần II (Đúng/Sai)</span>
              <span className="text-lg font-bold text-purple-900">{scoreReport.part2Score} / 1.00</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-xs text-amber-700 block">Phần III (Trả lời ngắn)</span>
              <span className="text-lg font-bold text-amber-900">{scoreReport.part3Score} / 1.00</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-700 block">Phần IV (Tự luận/Số)</span>
              <span className="text-lg font-bold text-emerald-900">{scoreReport.part4Score} / 0.50</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setIsDisqualified(false);
              setInfractionCount(0);
              setTimeLeft(90 * 60);
              setAnswers({});
            }}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw size={15} />
            <span>Làm Lại Đề Thi Này</span>
          </button>
        </div>
      )}

      {/* Questions Form */}
      <div className="space-y-8">
        {/* PHẦN 1: TRẮC NGHIỆM 4 PHƯƠNG ÁN */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-extrabold text-xs">Phần I</span>
            <h3 className="font-extrabold text-base text-slate-900">
              Câu Hỏi Trắc Nghiệm 4 Lựa Chọn (Mỗi câu trả lời đúng được 0.25 điểm)
            </h3>
          </div>

          {exam.questions
            .filter((q) => q.part === 'part_1_mcq')
            .map((q) => {
              const result = scoreReport?.details[q.id];
              return (
                <div
                  key={q.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-blue-600">Câu {q.questionNumber}:</span>
                      <p className="text-sm font-semibold text-slate-900">{q.prompt}</p>
                      {q.latex && <MathView math={q.latex} block />}
                    </div>

                    {isSubmitted && result && (
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          result.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {result.isCorrect ? '+0.25 điểm' : '0 điểm'}
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {q.options.map((opt) => {
                      const isSelected = answers[q.id] === opt.key;
                      const isCorrect = q.correctAnswer === opt.key;

                      let borderClass = 'border-slate-200 hover:border-slate-300';
                      if (isSelected) borderClass = 'border-blue-600 bg-blue-50/60 font-bold';
                      if (isSubmitted) {
                        if (isCorrect) borderClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                        else if (isSelected && !isCorrect) borderClass = 'border-red-500 bg-red-50 text-red-900';
                      }

                      return (
                        <button
                          key={opt.key}
                          disabled={isSubmitted}
                          onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.key }))}
                          className={`p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center gap-3 ${borderClass}`}
                        >
                          <span className="w-6 h-6 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                            {opt.key}
                          </span>
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {isSubmitted && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                      <span className="font-bold text-blue-700 block">Lời giải chi tiết:</span>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* PHẦN 2: TRẮC NGHIỆM ĐÚNG/SAI 4 Ý ĐỘC LẬP (LŨY TIẾN 0.1 -> 0.25 -> 0.5 -> 1.0) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-extrabold text-xs">Phần II</span>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Câu Hỏi Trắc Nghiệm Đúng/Sai (Tối đa 1.0 điểm / câu)
              </h3>
              <p className="text-xs text-slate-500">
                Quy tắc tính điểm lũy tiến BGD: Đúng 1 ý = 0.1đ · Đúng 2 ý = 0.25đ · Đúng 3 ý = 0.5đ · Đúng cả 4 ý = 1.0đ
              </p>
            </div>
          </div>

          {exam.questions
            .filter((q) => q.part === 'part_2_true_false')
            .map((q) => {
              const result = scoreReport?.details[q.id];
              return (
                <div
                  key={q.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-purple-600">Câu {q.questionNumber}:</span>
                      <p className="text-sm font-semibold text-slate-900">{q.prompt}</p>
                      {q.latex && <MathView math={q.latex} block />}
                    </div>

                    {isSubmitted && result && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800">
                        Đúng {result.correctCount}/4 ý (+{result.earnedPoints}đ)
                      </span>
                    )}
                  </div>

                  {/* 4 True/False Items a, b, c, d */}
                  <div className="space-y-3 pt-2">
                    {q.items.map((item) => {
                      const answerKey = `${q.id}_${item.subKey}`;
                      const currentVal = answers[answerKey];
                      const isItemCorrect = isSubmitted && result?.details[item.subKey];

                      return (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="text-xs text-slate-800 flex-1">
                            <span className="font-bold mr-2 text-purple-600">{item.subKey})</span>
                            <span>{item.text}</span>
                            {item.latex && <MathView math={item.latex} className="ml-2" />}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              disabled={isSubmitted}
                              onClick={() => setAnswers((prev) => ({ ...prev, [answerKey]: true }))}
                              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                currentVal === true
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-white border border-slate-300 text-slate-700 hover:border-slate-400'
                              }`}
                            >
                              Đúng
                            </button>
                            <button
                              disabled={isSubmitted}
                              onClick={() => setAnswers((prev) => ({ ...prev, [answerKey]: false }))}
                              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                currentVal === false
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-white border border-slate-300 text-slate-700 hover:border-slate-400'
                              }`}
                            >
                              Sai
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {isSubmitted && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                      <span className="font-bold text-purple-700 block">Lời giải chi tiết:</span>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* PHẦN 3: CÂU TRẢ LỜI NGẮN (TỐI ĐA 4 KÝ TỰ) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-extrabold text-xs">Phần III</span>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Câu Hỏi Trắc Nghiệm Trả Lời Ngắn (Mỗi câu 0.5 điểm)
              </h3>
              <p className="text-xs text-slate-500">
                Quy chế BGD: Thí sinh điền tối đa 4 ký tự/chữ số (chỉ bao gồm [0-9], '-', ',', '.', '/')
              </p>
            </div>
          </div>

          {exam.questions
            .filter((q) => q.part === 'part_3_short_answer')
            .map((q) => {
              const result = scoreReport?.details[q.id];
              return (
                <div
                  key={q.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-amber-600">Câu {q.questionNumber}:</span>
                      <p className="text-sm font-semibold text-slate-900">{q.prompt}</p>
                      {q.latex && <MathView math={q.latex} block />}
                    </div>

                    {isSubmitted && result && (
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          result.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {result.isCorrect ? '+0.5 điểm' : '0 điểm'}
                      </span>
                    )}
                  </div>

                  {/* Short answer input */}
                  <div className="pt-2">
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                      Đáp án của bạn (Tối đa 4 ký tự):
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      disabled={isSubmitted}
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
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* PHẦN 4: TỰ LUẬN NGẮN / SỐ HỌC (CHUẨN HÓA TỰ ĐỘNG) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-xs">Phần IV</span>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Câu Hỏi Số Học / Phân Số Chuẩn Hóa Tự Động (0.5 điểm)
              </h3>
              <p className="text-xs text-slate-500">
                Hệ thống tự động quy đổi tương đương giữa phân số (10/21) và số thập phân (0.476).
              </p>
            </div>
          </div>

          {exam.questions
            .filter((q) => q.part === 'part_4_essay')
            .map((q) => {
              const result = scoreReport?.details[q.id];
              return (
                <div
                  key={q.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-emerald-600">Câu {q.questionNumber}:</span>
                      <p className="text-sm font-semibold text-slate-900">{q.prompt}</p>
                      {q.latex && <MathView math={q.latex} block />}
                    </div>

                    {isSubmitted && result && (
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          result.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {result.isCorrect ? '+0.5 điểm' : '0 điểm'}
                      </span>
                    )}
                  </div>

                  <div className="pt-2">
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                      Đáp án của bạn (Nhập dạng phân số a/b hoặc số thập phân):
                    </label>
                    <input
                      type="text"
                      disabled={isSubmitted}
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="VD: 10/21 hoặc 0.476"
                      className="w-full sm:w-64 h-11 px-4 rounded-xl border border-slate-300 font-mono font-bold text-base focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {isSubmitted && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                      <span className="font-bold text-emerald-700 block">
                        Đáp án chuẩn: <span className="font-mono">{q.correctAnswer}</span> (hoặc tương đương)
                      </span>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

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
