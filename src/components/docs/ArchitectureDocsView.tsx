import React, { useState } from 'react';
import {
  CLEAN_ARCHITECTURE_DIRECTORY_TREE,
  ARCHITECTURE_EXPLANATION,
} from '../../lib/cleanArchitectureGuide';
import {
  RN_SCREEN_1_HOME,
  RN_SCREEN_2_SCANNER,
  RN_SCREEN_3_SOCRATIC_CHAT,
  RN_SCREEN_4_EXAM,
  RN_SCREEN_5_TEACHER_UPLOAD,
} from '../../lib/rnCodeSamples';
import { PDF_PARSER_SYSTEM_PROMPT } from '../../lib/pdfParserSchema';
import { Code2, Database, Layers, Copy, Check, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

export const ArchitectureDocsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'architecture' | 'database' | 'scoring' | 'zod' | 'rn_code'>('architecture');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedRnScreen, setSelectedRnScreen] = useState<number>(1);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const DDL_SNIPPET = `-- DDL PostgreSQL / Supabase Schema rút gọn
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE exam_part_type AS ENUM ('part_1_mcq', 'part_2_true_false', 'part_3_short_answer', 'part_4_essay');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  tier TEXT NOT NULL DEFAULT 'free',
  xp INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 1,
  daily_scan_count INTEGER NOT NULL DEFAULT 0,
  max_daily_scans INTEGER NOT NULL DEFAULT 10,
  grade SMALLINT NOT NULL DEFAULT 12,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  grade SMALLINT NOT NULL,
  duration_minutes INTEGER DEFAULT 90,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  part exam_part_type NOT NULL,
  question_number INT NOT NULL,
  prompt TEXT NOT NULL,
  latex TEXT,
  options JSONB,
  true_false_items JSONB,
  correct_answer TEXT NOT NULL,
  points NUMERIC(3,2) NOT NULL
);

CREATE TABLE cheat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id),
  student_id UUID REFERENCES profiles(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  infraction_number SMALLINT NOT NULL,
  event_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  action_taken TEXT NOT NULL
);`;

  const SCORING_CODE_SNIPPET = `// Thuật toán chấm điểm Phần II: Đúng/Sai 4 ý lũy tiến chuẩn BGD 2025
export function gradePart2TrueFalse(
  studentAnswers: Record<'a' | 'b' | 'c' | 'd', boolean>,
  correctAnswers: Record<'a' | 'b' | 'c' | 'd', boolean>
): { correctCount: number; earnedPoints: number } {
  let correctCount = 0;
  for (const k of ['a', 'b', 'c', 'd'] as const) {
    if (studentAnswers[k] === correctAnswers[k]) correctCount++;
  }

  // Bảng điểm lũy tiến Bộ Giáo dục & Đào tạo:
  // Đúng 1 ý: 0.10đ | Đúng 2 ý: 0.25đ | Đúng 3 ý: 0.50đ | Đúng 4 ý: 1.00đ
  let earnedPoints = 0.0;
  switch (correctCount) {
    case 1: earnedPoints = 0.1; break;
    case 2: earnedPoints = 0.25; break;
    case 3: earnedPoints = 0.5; break;
    case 4: earnedPoints = 1.0; break;
    default: earnedPoints = 0.0;
  }

  return { correctCount, earnedPoints };
}

// Chuẩn hóa phân số và số thập phân tự động (VD: '1/2' == '0.5' == '0,5')
export function isAnswerEquivalent(student: string, correct: string): boolean {
  const normS = student.trim().toLowerCase().replace(/,/g, '.');
  const normC = correct.trim().toLowerCase().replace(/,/g, '.');
  if (normS === normC) return true;

  const numS = parseToFloat(normS);
  const numC = parseToFloat(normC);
  if (numS !== null && numC !== null) {
    return Math.abs(numS - numC) < 1e-4; // So sánh sai số epsilon
  }
  return false;
}`;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Title Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Tài Liệu Kỹ Thuật & Kiến Trúc Dự Án
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Trung Tâm Kiến Trúc Math&NBK
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
            Toàn bộ sơ đồ kiến trúc Clean Architecture, DDL PostgreSQL Supabase, Zod Validation Schema và mã nguồn React Native TypeScript 5 màn hình.
          </p>
        </div>

        {/* Navigation Sections */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          {[
            { id: 'architecture', label: 'Clean Architecture' },
            { id: 'database', label: 'PostgreSQL DDL' },
            { id: 'scoring', label: 'Thuật Toán Chấm Điểm' },
            { id: 'zod', label: 'Zod & AI Parser' },
            { id: 'rn_code', label: 'Mã Nguồn React Native' },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeSection === sec.id
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: CLEAN ARCHITECTURE & SYSTEM DIAGRAM */}
      {activeSection === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <Layers size={20} className="text-indigo-600" />
                <span>Cấu Trúc Thư Mục Clean Architecture (React Native)</span>
              </div>
              <button
                onClick={() => handleCopy(CLEAN_ARCHITECTURE_DIRECTORY_TREE, 'arch_tree')}
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                {copiedKey === 'arch_tree' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedKey === 'arch_tree' ? 'Đã sao chép' : 'Sao chép cấu trúc'}</span>
              </button>
            </div>

            <div className="bg-slate-950 text-slate-200 font-mono text-xs p-5 rounded-2xl overflow-x-auto">
              <pre>{CLEAN_ARCHITECTURE_DIRECTORY_TREE}</pre>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 text-xs text-slate-700 space-y-2">
              <h4 className="font-bold text-indigo-900 text-sm">Nguyên Tắc Thiết Kế:</h4>
              <p>• <strong>Domain Layer (Core)</strong>: Hoàn toàn độc lập với UI và framework React Native, chứa Use Cases (ScanProblem, GradeExam, TrackAntiCheat) và Entities.</p>
              <p>• <strong>Data Layer</strong>: Quản lý Supabase Client, Server Proxy Gemini API, và bộ đệm 3 tầng (Client Memory, Local Storage MMKV, và Redis Cache).</p>
              <p>• <strong>Presentation Layer</strong>: Chứa các màn hình NativeWind (Tailwind CSS) và các custom hooks (useAntiCheatTracker, useCountdownTimer).</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: POSTGRESQL SUPABASE DDL */}
      {activeSection === 'database' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
              <Database size={20} className="text-indigo-600" />
              <span>DDL Schema PostgreSQL / Supabase & RLS Policies (8 Bảng)</span>
            </div>
            <button
              onClick={() => handleCopy(DDL_SNIPPET, 'ddl_sql')}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === 'ddl_sql' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedKey === 'ddl_sql' ? 'Đã sao chép' : 'Sao chép SQL'}</span>
            </button>
          </div>

          <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-5 rounded-2xl overflow-x-auto max-h-[500px]">
            <pre>{DDL_SNIPPET}</pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">1. Phân quyền RBAC</span>
              <p className="text-slate-500">Student chỉ đọc bài của mình; Teacher quản lý đề; Admin toàn quyền.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">2. Định dạng câu hỏi JSONB</span>
              <p className="text-slate-500">Linh hoạt lưu trữ 4 lựa chọn (Phần I) hoặc 4 mệnh đề Đúng/Sai (Phần II).</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">3. Kiểm toán Cheat Logs</span>
              <p className="text-slate-500">Ghi nhận mốc thời gian, loại sự kiện và số lần vi phạm của học sinh.</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SCORING ENGINE */}
      {activeSection === 'scoring' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
              <Code2 size={20} className="text-indigo-600" />
              <span>Thuật Toán Chấm Điểm Lũy Tiến BGD & Chuẩn Hóa Số Học</span>
            </div>
            <button
              onClick={() => handleCopy(SCORING_CODE_SNIPPET, 'scoring_code')}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === 'scoring_code' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedKey === 'scoring_code' ? 'Đã sao chép' : 'Sao chép mã'}</span>
            </button>
          </div>

          <div className="bg-slate-950 text-blue-300 font-mono text-xs p-5 rounded-2xl overflow-x-auto">
            <pre>{SCORING_CODE_SNIPPET}</pre>
          </div>
        </div>
      )}

      {/* SECTION 4: ZOD & PROMPT SYSTEM */}
      {activeSection === 'zod' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
              <FileCode size={20} className="text-indigo-600" />
              <span>Prompt System Bóc Tách Đề Thi PDF Cho Gemini AI</span>
            </div>
            <button
              onClick={() => handleCopy(PDF_PARSER_SYSTEM_PROMPT, 'prompt_code')}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === 'prompt_code' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedKey === 'prompt_code' ? 'Đã sao chép' : 'Sao chép Prompt'}</span>
            </button>
          </div>

          <div className="bg-slate-900 text-amber-200 font-mono text-xs p-5 rounded-2xl overflow-x-auto">
            <pre>{PDF_PARSER_SYSTEM_PROMPT}</pre>
          </div>
        </div>
      )}

      {/* SECTION 5: REACT NATIVE CODE SAMPLES (5 SCREENS) */}
      {activeSection === 'rn_code' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Mã Nguồn React Native (TypeScript + NativeWind) 5 Màn Hình
              </h3>
              <p className="text-xs text-slate-500">Mã nguồn nguyên bản sẵn sàng đưa vào dự án Expo CLI</p>
            </div>

            {/* Screen tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {[
                { id: 1, label: '1. HomeScreen' },
                { id: 2, label: '2. Scanner' },
                { id: 3, label: '3. SocraticChat' },
                { id: 4, label: '4. ExamEngine' },
                { id: 5, label: '5. TeacherUpload' },
              ].map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => setSelectedRnScreen(sc.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedRnScreen === sc.id ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="relative">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => {
                  const code =
                    selectedRnScreen === 1
                      ? RN_SCREEN_1_HOME
                      : selectedRnScreen === 2
                      ? RN_SCREEN_2_SCANNER
                      : selectedRnScreen === 3
                      ? RN_SCREEN_3_SOCRATIC_CHAT
                      : selectedRnScreen === 4
                      ? RN_SCREEN_4_EXAM
                      : RN_SCREEN_5_TEACHER_UPLOAD;
                  handleCopy(code, `rn_screen_${selectedRnScreen}`);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
              >
                {copiedKey === `rn_screen_${selectedRnScreen}` ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <Copy size={14} />
                )}
                <span>
                  {copiedKey === `rn_screen_${selectedRnScreen}` ? 'Đã sao chép' : 'Sao chép mã màn hình này'}
                </span>
              </button>
            </div>

            <div className="bg-slate-950 text-slate-200 font-mono text-xs p-6 pt-12 rounded-2xl overflow-x-auto max-h-[550px]">
              <pre>
                {selectedRnScreen === 1 && RN_SCREEN_1_HOME}
                {selectedRnScreen === 2 && RN_SCREEN_2_SCANNER}
                {selectedRnScreen === 3 && RN_SCREEN_3_SOCRATIC_CHAT}
                {selectedRnScreen === 4 && RN_SCREEN_4_EXAM}
                {selectedRnScreen === 5 && RN_SCREEN_5_TEACHER_UPLOAD}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
