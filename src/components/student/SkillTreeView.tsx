import React, { useState } from 'react';
import { SkillNode } from '../../types/math';
import { SAMPLE_SKILL_TREES } from '../../data/mockData';
import { Award, CheckCircle2, Lock, Star, Trophy, Flame, Play, ChevronRight, Sparkles, X } from 'lucide-react';

interface SkillTreeViewProps {
  onStartExam: () => void;
  onOpenScanner: () => void;
  onOpenTutor: () => void;
  userXp: number;
  streakDays: number;
}

export const SkillTreeView: React.FC<SkillTreeViewProps> = ({
  onStartExam,
  onOpenScanner,
  onOpenTutor,
  userXp,
  streakDays,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<10 | 11 | 12>(12);
  const [activeNode, setActiveNode] = useState<SkillNode | null>(null);
  const [showLessonModal, setShowLessonModal] = useState<boolean>(false);
  const [lessonProgress, setLessonProgress] = useState<number>(0);

  const nodes = SAMPLE_SKILL_TREES[selectedGrade];

  const handleNodeClick = (node: SkillNode) => {
    if (node.isLocked) return;
    setActiveNode(node);
    setLessonProgress(node.completedSteps);
    setShowLessonModal(true);
  };

  const handleCompleteStep = () => {
    if (!activeNode) return;
    const next = Math.min(lessonProgress + 1, activeNode.totalSteps);
    setLessonProgress(next);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Banner with Motivational Goal */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-semibold">
              <Sparkles size={14} className="text-amber-400" />
              <span>Chương trình Giáo Dục Phổ Thông 2018</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bản Đồ Kỹ Năng Toán Học THPT
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Chinh phục từng đảo kiến thức theo cấu trúc phân nhánh Duolingo. Hoàn thành bài học để tích lũy XP, duy trì chuỗi Streak và mở khóa đề thi chuẩn BGD.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
            <button
              onClick={onStartExam}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Trophy size={18} className="text-amber-500" />
              <span>Làm Đề Thi Thử</span>
            </button>
            <button
              onClick={onOpenScanner}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/20"
            >
              <span>Quét Bài Toán</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-32 -top-12 w-48 h-48 rounded-full bg-indigo-500/20 pointer-events-none" />
      </div>

      {/* Grade Selector & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200">
        {/* Grade tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {([10, 11, 12] as const).map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                selectedGrade === grade
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Lớp {grade}
            </button>
          ))}
        </div>

        {/* Quick Progress Summary */}
        <div className="flex items-center gap-6 text-xs text-slate-500 w-full sm:w-auto justify-end px-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Đã hoàn thành</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600" />
            <span>Đang học</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-300" />
            <span>Khóa</span>
          </div>
        </div>
      </div>

      {/* Duolingo Style Skill Tree Pathway */}
      <div className="relative py-12 flex flex-col items-center">
        {/* Connecting Line */}
        <div className="absolute top-8 bottom-8 w-1 bg-gradient-to-b from-blue-300 via-indigo-200 to-slate-200 -z-0 rounded-full" />

        <div className="w-full max-w-md space-y-12 relative z-10">
          {nodes.map((node, index) => {
            const isCompleted = node.completedSteps === node.totalSteps;
            const isInProgress = !node.isLocked && !isCompleted;
            // Tính độ lệch uốn lượn S-Curve
            const offsetMultiplier = Math.sin(index * 1.5);
            const offsetX = offsetMultiplier * 60;

            return (
              <div
                key={node.id}
                style={{ transform: `translateX(${offsetX}px)` }}
                className="flex flex-col items-center group"
              >
                {/* Node Circle Button */}
                <button
                  onClick={() => handleNodeClick(node)}
                  disabled={node.isLocked}
                  className={`relative w-24 h-24 rounded-3xl flex flex-col items-center justify-center transition-all transform group-hover:scale-105 active:scale-95 shadow-md ${
                    node.isLocked
                      ? 'bg-slate-200 text-slate-400 border-4 border-slate-300 cursor-not-allowed'
                      : isCompleted
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white border-4 border-emerald-400'
                      : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white border-4 border-blue-400'
                  }`}
                >
                  {node.isLocked ? (
                    <Lock size={28} className="text-slate-400" />
                  ) : isCompleted ? (
                    <CheckCircle2 size={36} className="text-white" />
                  ) : (
                    <Award size={36} className="text-amber-300" />
                  )}

                  {/* Level Number Pill */}
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white text-slate-900 border-2 border-slate-200 flex items-center justify-center font-extrabold text-xs shadow-xs">
                    {node.level}
                  </span>

                  {/* Progress Ring Indicator */}
                  {!node.isLocked && !isCompleted && (
                    <span className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-blue-900 text-white text-[10px] font-bold">
                      {node.completedSteps}/{node.totalSteps}
                    </span>
                  )}
                </button>

                {/* Node Information Card */}
                <div
                  onClick={() => handleNodeClick(node)}
                  className={`mt-3 px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-xs max-w-xs text-center cursor-pointer transition-colors ${
                    node.isLocked ? 'opacity-70' : 'hover:border-blue-400'
                  }`}
                >
                  <h4 className="font-bold text-sm text-slate-900">{node.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{node.description}</p>
                  <div className="mt-1.5 flex items-center justify-center gap-2 text-[11px] font-semibold">
                    <span className="text-amber-600">+{node.xpReward} XP</span>
                    <span className="text-slate-300">·</span>
                    <span className={node.isLocked ? 'text-slate-400' : 'text-blue-600'}>
                      {node.isLocked ? 'Chưa mở' : isCompleted ? 'Đã thành thạo' : 'Luyện tập ngay'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Lesson Modal */}
      {showLessonModal && activeNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Lớp {selectedGrade} · Cấp độ {activeNode.level}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">{activeNode.title}</h3>
              </div>
              <button
                onClick={() => setShowLessonModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">{activeNode.description}</p>

            {/* Step Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Tiến độ bài học</span>
                <span className="text-blue-600">
                  {lessonProgress} / {activeNode.totalSteps} bài tập
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${(lessonProgress / activeNode.totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Quick Practice Question inside Modal */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Bài tập thực hành mẫu</span>
                <span className="text-amber-600">+{activeNode.xpReward} XP</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                Cho hàm số f(x) có đạo hàm f'(x) = x - 2. Hàm số đồng biến trên khoảng nào?
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={handleCompleteStep}
                  className="p-2.5 rounded-xl border border-slate-300 hover:border-blue-600 hover:bg-blue-50 font-medium text-left"
                >
                  A. (-∞; 2)
                </button>
                <button
                  onClick={handleCompleteStep}
                  className="p-2.5 rounded-xl border border-blue-600 bg-blue-50 font-bold text-blue-700 text-left"
                >
                  B. (2; +∞) ✓
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowLessonModal(false);
                  onOpenTutor();
                }}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50"
              >
                Hỏi Gia Sư Socratic
              </button>
              <button
                onClick={() => {
                  handleCompleteStep();
                  if (lessonProgress + 1 >= activeNode.totalSteps) {
                    setShowLessonModal(false);
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2"
              >
                <Play size={16} />
                <span>{lessonProgress + 1 >= activeNode.totalSteps ? 'Hoàn thành bài' : 'Làm câu tiếp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
