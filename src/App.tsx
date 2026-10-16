/**
 * Math&NBK - Ứng Dụng Học Toán THPT Thông Minh
 * Bản Quyền: Math&NBK Education Platform
 */

import React, { useEffect, useState } from 'react';
import { UserRole, AccountTier, CheatLog, Exam, Classroom, StudentExamSubmission, ClassroomLesson, UserProfile } from './types/math';
import {
  INITIAL_USER_PROFILE,
  SAMPLE_CHEAT_LOGS,
  SAMPLE_EXAM_BGD,
  SAMPLE_CLASSROOMS,
  SAMPLE_SUBMISSIONS,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { SkillTreeView } from './components/student/SkillTreeView';
import { MathAssistantView } from './components/student/MathAssistantView';
import { ExamEngineView } from './components/student/ExamEngineView';
import { StudentHistoryView } from './components/student/StudentHistoryView';
import { ClassroomManagerView } from './components/classroom/ClassroomManagerView';
import { TeacherPortalView } from './components/teacher/TeacherPortalView';
import { TeacherGradebookView } from './components/teacher/TeacherGradebookView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { ArchitectureDocsView } from './components/docs/ArchitectureDocsView';
import { ProfileView } from './components/ProfileView';
import { GraphStudioView } from './components/GraphStudioView';
import { ClassLessonsView } from './components/ClassLessonsView';
import {
  BookOpen,
  Sparkles,
  Award,
  Users,
  FileCheck,
  BarChart3,
  FileText,
} from 'lucide-react';

function readStoredValue<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch (error) {
    console.error(`Không thể đọc dữ liệu "${key}" đã lưu trên trình duyệt.`, error);
    return fallback;
  }
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('classroom');
  const [assistantInitialMode, setAssistantInitialMode] = useState<'scanner' | 'tutor'>('scanner');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => readStoredValue('mathnbk.studentProfile', INITIAL_USER_PROFILE));
  const [teacherProfile, setTeacherProfile] = useState<UserProfile>(() => readStoredValue('mathnbk.teacherProfile', {
    ...INITIAL_USER_PROFILE,
    id: 'usr_teacher_01',
    name: 'ThS. Trần Văn Minh',
    email: 'minh.tran@thpt-nbk.edu.vn',
    role: 'teacher',
    grade: 12,
    subject: 'Toán THPT',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TeacherMinh',
  }));
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [cheatLogs, setCheatLogs] = useState<CheatLog[]>(SAMPLE_CHEAT_LOGS);
  const [examsList, setExamsList] = useState<Exam[]>(() => readStoredValue('mathnbk.exams', [SAMPLE_EXAM_BGD]));
  const [activeExamId, setActiveExamId] = useState<string>(SAMPLE_EXAM_BGD.id);

  // Nhóm lớp & Kết quả bài nộp của học sinh
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => readStoredValue('mathnbk.classrooms', SAMPLE_CLASSROOMS));
  const [submissions, setSubmissions] = useState<StudentExamSubmission[]>(() => readStoredValue('mathnbk.submissions', SAMPLE_SUBMISSIONS));
  const [lessons, setLessons] = useState<ClassroomLesson[]>(() => readStoredValue('mathnbk.lessons', []));
  const [lessonClassId, setLessonClassId] = useState<string | undefined>();

  useEffect(() => {
    try {
      localStorage.setItem('mathnbk.studentProfile', JSON.stringify(userProfile));
    } catch (error) {
      console.error('Không thể lưu hồ sơ học sinh trên trình duyệt.', error);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('mathnbk.teacherProfile', JSON.stringify(teacherProfile));
    } catch (error) {
      console.error('Không thể lưu hồ sơ giáo viên trên trình duyệt.', error);
    }
  }, [teacherProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('mathnbk.classrooms', JSON.stringify(classrooms));
      localStorage.setItem('mathnbk.exams', JSON.stringify(examsList));
      localStorage.setItem('mathnbk.lessons', JSON.stringify(lessons));
      localStorage.setItem('mathnbk.submissions', JSON.stringify(submissions));
    } catch (error) {
      console.error('Không thể lưu dữ liệu nhóm lớp, đề thi, bài học hoặc kết quả thi trên trình duyệt.', error);
    }
  }, [classrooms, examsList, lessons, submissions]);

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

  const openAssistant = (mode: 'scanner' | 'tutor') => {
    setAssistantInitialMode(mode);
    setCurrentTab('assistant');
  };

  const handleRecordCheatLog = (log: CheatLog) => {
    setCheatLogs((prev) => [log, ...prev]);
  };

  const handlePublishExam = (newExam: Exam, targetClassIds: string[] = []) => {
    setExamsList((prev) => {
      const filtered = prev.filter((e) => e.id !== newExam.id);
      return [newExam, ...filtered];
    });
    if (targetClassIds.length > 0) {
      setClassrooms((prev) => prev.map((room) => targetClassIds.includes(room.id)
        ? { ...room, assignedExamIds: room.assignedExamIds.includes(newExam.id) ? room.assignedExamIds : [...room.assignedExamIds, newExam.id] }
        : room));
    }
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
    if (currentTab === 'architecture_docs') {
      return <ArchitectureDocsView />;
    }

    if (userRole === 'admin') {
      return <AdminDashboardView cheatLogs={cheatLogs} />;
    }

    if (userRole === 'teacher') {
      if (currentTab === 'profile') {
        return <ProfileView profile={teacherProfile} userRole="teacher" onSave={setTeacherProfile} />;
      }
      if (currentTab === 'graph_studio') return <GraphStudioView />;
      if (currentTab === 'class_lessons') {
        return (
          <ClassLessonsView
            classrooms={classrooms}
            lessons={lessons}
            userRole="teacher"
            userId={teacherProfile.id}
            userName={teacherProfile.name}
            initialClassId={lessonClassId}
            onAddLesson={(lesson) => setLessons((prev) => [lesson, ...prev])}
          />
        );
      }
      if (currentTab === 'classroom') {
        return (
          <ClassroomManagerView
            userRole={userRole}
            currentUserId={teacherProfile.id}
            currentUserName={teacherProfile.name}
            currentUserAvatar={teacherProfile.avatar}
            classrooms={classrooms}
            lessons={lessons}
            onUpdateClassrooms={setClassrooms}
            examsList={examsList}
            onSelectExamToTake={(examId) => {
              setActiveExamId(examId);
              setCurrentTab('exam');
            }}
            onViewClassGradebook={() => {
              setCurrentTab('teacher_gradebook');
            }}
            onCreateLessonForClass={(classId) => {
              setLessonClassId(classId);
              setCurrentTab('class_lessons');
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
          />
        );
      }

      // Default for teacher: Teacher Portal (Tạo đề thi thủ công & Tải PDF)
      return (
        <TeacherPortalView
          classrooms={classrooms.filter((room) => room.teacherId === teacherProfile.id)}
          teacherName={teacherProfile.name}
          onPublishExam={handlePublishExam}
          onPreviewExam={(newExam, targetClassIds) => {
            handlePublishExam(newExam, targetClassIds);
            setCurrentTab('exam');
          }}
        />
      );
    }

    // Role: Student
    if (currentTab === 'profile') {
      return <ProfileView profile={userProfile} userRole="student" onSave={setUserProfile} />;
    }
    if (currentTab === 'graph_studio') return <GraphStudioView />;
    if (currentTab === 'class_lessons') {
      return (
        <ClassLessonsView
          classrooms={classrooms}
          lessons={lessons}
          userRole="student"
          userId={userProfile.id}
          userName={userProfile.name}
          onAddLesson={(lesson) => setLessons((prev) => [lesson, ...prev])}
        />
      );
    }
    switch (currentTab) {
      case 'home':
        return (
          <SkillTreeView
            onStartExam={() => setCurrentTab('exam')}
            onOpenScanner={() => openAssistant('scanner')}
            onOpenTutor={() => openAssistant('tutor')}
            userXp={userProfile.xp}
            streakDays={userProfile.streakDays}
            userRole={userRole}
            studentGrade={userProfile.grade}
          />
        );
      case 'classroom':
        return (
          <ClassroomManagerView
            userRole={userRole}
            currentUserId={userProfile.id}
            currentUserName={userProfile.name}
            currentUserAvatar={userProfile.avatar}
            classrooms={classrooms}
            lessons={lessons}
            onUpdateClassrooms={setClassrooms}
            examsList={examsList}
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
      case 'assistant':
      case 'scanner':
      case 'tutor':
        return (
          <MathAssistantView
            dailyScanCount={userProfile.dailyScanCount}
            maxDailyScans={userProfile.maxDailyScans}
            tier={userProfile.tier}
            onIncrementScan={handleIncrementScan}
            onUpgradeTier={handleToggleTier}
            initialMode={currentTab === 'tutor' ? 'tutor' : currentTab === 'scanner' ? 'scanner' : assistantInitialMode}
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
            submissions={submissions}
            defaultClassId="cls_12a1"
          />
        );
      default:
        return (
          <SkillTreeView
            onStartExam={() => setCurrentTab('exam')}
            onOpenScanner={() => openAssistant('scanner')}
            onOpenTutor={() => openAssistant('tutor')}
            userXp={userProfile.xp}
            streakDays={userProfile.streakDays}
            userRole={userRole}
            studentGrade={userProfile.grade}
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
          if (newRole === 'student') setCurrentTab('classroom');
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
                    onClick={() => setCurrentTab('class_lessons')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'class_lessons' ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <BookOpen size={18} />
                    <span className="text-[10px]">Bài học</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('graph_studio')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'graph_studio' ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <BarChart3 size={18} />
                    <span className="text-[10px]">Đồ thị</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('profile')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'profile' ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <Users size={18} />
                    <span className="text-[10px]">Hồ sơ</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentTab('class_lessons')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'class_lessons' ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <BookOpen size={18} />
                    <span className="text-[10px]">Bài học</span>
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
                    onClick={() => setCurrentTab('assistant')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'assistant' || currentTab === 'scanner' || currentTab === 'tutor'
                        ? 'text-blue-600 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    <Sparkles size={18} />
                    <span className="text-[10px]">Trợ lý AI</span>
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
                    onClick={() => setCurrentTab('class_lessons')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'class_lessons' ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <BookOpen size={18} />
                    <span className="text-[10px]">Bài học</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('graph_studio')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'graph_studio' ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <BarChart3 size={18} />
                    <span className="text-[10px]">Đồ thị</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('profile')}
                    className={`flex flex-col items-center gap-0.5 ${
                      currentTab === 'profile' ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <Users size={18} />
                    <span className="text-[10px]">Hồ sơ</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Math&NBK Platform. Hệ thống Giáo dục Toán học THPT Chuẩn Quốc Gia.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Phiên bản 2.6 (GDPT 2018)</span>
            {userRole === 'admin' && (
              <>
                <span>·</span>
                <button
                  onClick={() => setCurrentTab('architecture_docs')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Tài Liệu Kỹ Thuật Clean Architecture
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
