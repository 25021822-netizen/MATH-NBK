/**
 * Math&NBK - Ứng Dụng Học Toán THPT Thông Minh
 * Bản Quyền: Math&NBK Education Platform
 */

import React, { useState } from 'react';
import { UserRole, AccountTier, CheatLog, Exam, Classroom, StudentExamSubmission } from './types/math';
import {
  INITIAL_USER_PROFILE,
  SAMPLE_CHEAT_LOGS,
  SAMPLE_EXAM_BGD,
  SAMPLE_CLASSROOMS,
  SAMPLE_SUBMISSIONS,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { AIMathStudioView } from './components/student/AIMathStudioView';
import { ExamEngineView } from './components/student/ExamEngineView';
import { StudentHistoryView } from './components/student/StudentHistoryView';
import { UserProfileView } from './components/student/UserProfileView';
import { ClassroomManagerView } from './components/classroom/ClassroomManagerView';
import { TeacherPortalView } from './components/teacher/TeacherPortalView';
import { TeacherGradebookView } from './components/teacher/TeacherGradebookView';
import { GeometryCanvasView } from './components/geometry/GeometryCanvasView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import {
  BookOpen,
  Camera,
  MessageSquare,
  Award,
  Users,
  FileCheck,
  BarChart3,
  FileText,
  Sparkles,
  Compass,
  User,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('ask_ai');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [userProfile, setUserProfile] = useState(INITIAL_USER_PROFILE);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [cheatLogs, setCheatLogs] = useState<CheatLog[]>(SAMPLE_CHEAT_LOGS);
  const [examsList, setExamsList] = useState<Exam[]>([SAMPLE_EXAM_BGD]);
  const [activeExamId, setActiveExamId] = useState<string>(SAMPLE_EXAM_BGD.id);

  // Nhóm lớp & Kết quả bài nộp của học sinh
  const [classrooms, setClassrooms] = useState<Classroom[]>(SAMPLE_CLASSROOMS);
  const [submissions, setSubmissions] = useState<StudentExamSubmission[]>(SAMPLE_SUBMISSIONS);

  const handleToggleTier = () => {
    setUserProfile((prev) => ({
      ...prev,
      tier: prev.tier === 'free' ? 'premium' : 'free',
      maxDailyScans: prev.tier === 'free' ? 9999 : 10,
    }));
  };

  const handleIncrementScan = () => {
    setUserProfile((prev) => ({
      ...prev,
      dailyScanCount: prev.dailyScanCount + 1,
    }));
  };

  const handleRecordCheatLog = (log: CheatLog) => {
    setCheatLogs((prev) => [log, ...prev]);
  };

  const handlePublishExam = (newExam: Exam) => {
    setExamsList((prev) => {
      const filtered = prev.filter((e) => e.id !== newExam.id);
      return [newExam, ...filtered];
    });
    setActiveExamId(newExam.id);
  };

  // Xử lý nộp bài thi của học sinh: tự động ghi nhận vào submissions & cộng XP
  const handleAddSubmission = (submission: StudentExamSubmission) => {
    setSubmissions((prev) => [submission, ...prev]);
    setUserProfile((prev) => ({
      ...prev,
      xp: prev.xp + Math.round(submission.score * 15),
      streakDays: prev.streakDays + 1,
    }));
  };

  // Nội dung màn hình theo tab hiện tại và vai trò người dùng
  const renderCurrentView = () => {
    // 1. Hồ Sơ Người Dùng (Học sinh, Giáo viên, Quản trị)
    if (currentTab === 'profile') {
      return (
        <UserProfileView
          userProfile={userProfile}
          onUpdateProfile={setUserProfile}
          classrooms={classrooms}
          submissions={submissions}
          onNavigateToClassroom={() => setCurrentTab('classroom')}
          onToggleTier={handleToggleTier}
        />
      );
    }

    // 2. Vẽ Hình 2D & 3D (Học sinh và Giáo viên)
    if (currentTab === 'geometry') {
      return <GeometryCanvasView />;
    }

    // 3. Quản trị viên (Super Admin)
    if (userRole === 'admin') {
      return <AdminDashboardView cheatLogs={cheatLogs} />;
    }

    // 4. Giáo viên
    if (userRole === 'teacher') {
      if (currentTab === 'classroom') {
        return (
          <ClassroomManagerView
            userRole={userRole}
            currentUserId="usr_teacher_01"
            currentUserName="ThS. Trần Văn Minh"
            classrooms={classrooms}
            onUpdateClassrooms={setClassrooms}
            examsList={examsList}
            onUpdateExamsList={setExamsList}
            onSelectExamToTake={(examId) => {
              setActiveExamId(examId);
              setCurrentTab('exam');
            }}
            onViewClassGradebook={() => {
              setCurrentTab('teacher_gradebook');
            }}
          />
        );
      }

      if (currentTab === 'teacher_gradebook') {
        return (
          <TeacherGradebookView
            classrooms={classrooms}
            submissions={submissions}
            examsList={examsList}
            onSelectClassroom={() => {
              setCurrentTab('classroom');
            }}
            onPreviewExam={(examId) => {
              setActiveExamId(examId);
              setCurrentTab('exam');
            }}
          />
        );
      }

      if (currentTab === 'exam') {
        return (
          <ExamEngineView
            onRecordCheatLog={handleRecordCheatLog}
            examsList={examsList}
            activeExamId={activeExamId}
            onSelectExamId={setActiveExamId}
            submissions={submissions}
          />
        );
      }

      if (currentTab === 'ask_ai' || currentTab === 'scanner' || currentTab === 'tutor') {
        return (
          <AIMathStudioView
            dailyScanCount={userProfile.dailyScanCount}
            maxDailyScans={userProfile.maxDailyScans}
            tier={userProfile.tier}
            onIncrementScan={handleIncrementScan}
            onUpgradeTier={handleToggleTier}
            onStartExam={() => setCurrentTab('exam')}
          />
        );
      }

      // Default for teacher: Teacher Portal (Tạo đề thi thủ công & Tải PDF)
      return (
        <TeacherPortalView
          classrooms={classrooms}
          onPublishExam={handlePublishExam}
          onPreviewExam={(newExam) => {
            handlePublishExam(newExam);
            setCurrentTab('exam');
          }}
        />
      );
    }

    // 5. Học sinh
    switch (currentTab) {
      case 'classroom':
        return (
          <ClassroomManagerView
            userRole={userRole}
            currentUserId={userProfile.id}
            currentUserName={userProfile.name}
            classrooms={classrooms}
            onUpdateClassrooms={setClassrooms}
            examsList={examsList}
            onUpdateExamsList={setExamsList}
            onSelectExamToTake={(examId) => {
              setActiveExamId(examId);
              setCurrentTab('exam');
            }}
          />
        );
      case 'student_history':
        return (
          <StudentHistoryView
            currentStudentId={userProfile.id}
            submissions={submissions}
            examsList={examsList}
            classrooms={classrooms}
            onRetakeExam={(examId) => {
              setActiveExamId(examId);
              setCurrentTab('exam');
            }}
            onOpenExamHub={() => setCurrentTab('exam')}
          />
        );
      case 'exam':
        return (
          <ExamEngineView
            onRecordCheatLog={handleRecordCheatLog}
            examsList={examsList}
            activeExamId={activeExamId}
            onSelectExamId={setActiveExamId}
            onSubmitExam={handleAddSubmission}
            onViewHistory={() => setCurrentTab('student_history')}
            studentProfile={{ id: userProfile.id, name: userProfile.name, email: userProfile.email }}
            defaultClassId="cls_12a1"
            submissions={submissions}
          />
        );
      case 'ask_ai':
      case 'scanner':
      case 'tutor':
      default:
        // Gộp Quét bài tập AI và Gia sư Socratic thành 1 mục mang tên "Hỏi AI"
        return (
          <AIMathStudioView
            dailyScanCount={userProfile.dailyScanCount}
            maxDailyScans={userProfile.maxDailyScans}
            tier={userProfile.tier}
            onIncrementScan={handleIncrementScan}
            onUpgradeTier={handleToggleTier}
            onStartExam={() => setCurrentTab('exam')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Top Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={userRole}
        onSelectRole={(newRole) => {
          setUserRole(newRole);
          if (newRole === 'student') setCurrentTab('ask_ai');
          else if (newRole === 'teacher') setCurrentTab('classroom');
          else setCurrentTab('admin_dashboard');
        }}
        tier={userProfile.tier}
        onToggleTier={handleToggleTier}
        streakDays={userProfile.streakDays}
        xp={userProfile.xp}
        deviceMode={deviceMode}
        onSelectDeviceMode={setDeviceMode}
      />

      {/* Main Content Area (With optional Smartphone/Tablet device frames) */}
      <main className="flex-1 flex justify-center py-4 sm:py-8 px-2 sm:px-4">
        {deviceMode === 'desktop' ? (
          <div className="w-full">{renderCurrentView()}</div>
        ) : deviceMode === 'tablet' ? (
          // Tablet Frame (iPad Style 768px)
          <div className="w-full max-w-[820px] bg-white rounded-[40px] border-[12px] border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <div className="h-6 bg-slate-800 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-700" />
            </div>
            <div className="flex-1 overflow-y-auto">{renderCurrentView()}</div>
          </div>
        ) : (
          // Smartphone Frame (iPhone Style 414px)
          <div className="w-full max-w-[420px] bg-white rounded-[48px] border-[14px] border-slate-900 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[88vh]">
            {/* Dynamic Island / Notch */}
            <div className="h-8 bg-slate-900 flex items-center justify-center relative">
              <div className="w-24 h-4 bg-black rounded-full" />
            </div>

            {/* Scrollable Screen Content */}
            <div className="flex-1 overflow-y-auto pb-16">{renderCurrentView()}</div>

            {/* Mobile Bottom Tab Bar */}
            <div className="h-16 bg-white/95 border-t border-slate-200 flex items-center justify-around px-2 relative z-20">
              {userRole === 'teacher' ? (
                <>
                  <button
                    onClick={() => setCurrentTab('classroom')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'classroom' ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <Users size={18} />
                    <span className="text-[10px]">Nhóm Lớp</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('teacher_gradebook')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'teacher_gradebook' ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <BarChart3 size={18} />
                    <span className="text-[10px]">Bảng Điểm</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('teacher_portal')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'teacher_portal' ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <FileText size={18} />
                    <span className="text-[10px]">Tạo Đề</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('exam')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'exam' ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <Award size={18} />
                    <span className="text-[10px]">Phòng Thi</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('geometry')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'geometry' ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <Compass size={18} />
                    <span className="text-[10px]">Vẽ Hình</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentTab('ask_ai')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'ask_ai' || currentTab === 'scanner' || currentTab === 'tutor'
                        ? 'text-blue-600 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    <Sparkles size={18} />
                    <span className="text-[10px]">Hỏi AI</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('classroom')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'classroom' ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <Users size={18} />
                    <span className="text-[10px]">Nhóm lớp</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('student_history')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'student_history' ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <FileCheck size={18} />
                    <span className="text-[10px]">Bài đã làm</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('exam')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'exam' ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <Award size={18} />
                    <span className="text-[10px]">Thi BGD</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('geometry')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'geometry' ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <Compass size={18} />
                    <span className="text-[10px]">Vẽ Hình</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Math&NBK Platform. Hệ thống Giáo dục Toán học THPT Chuẩn Quốc Gia.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Phiên bản 2.6 (GDPT 2018)</span>
            <span>·</span>
            <span>Học & Thi Trắc Nghiệm Thông Minh</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
