/**
 * Math&NBK - Ứng Dụng Học Toán THPT Thông Minh
 * Bản Quyền: Math&NBK Education Platform
 */

import React, { useState } from 'react';
import { UserRole, AccountTier, CheatLog } from './types/math';
import { INITIAL_USER_PROFILE, SAMPLE_CHEAT_LOGS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { SkillTreeView } from './components/student/SkillTreeView';
import { CameraScannerView } from './components/student/CameraScannerView';
import { SocraticTutorView } from './components/student/SocraticTutorView';
import { ExamEngineView } from './components/student/ExamEngineView';
import { TeacherPortalView } from './components/teacher/TeacherPortalView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { ArchitectureDocsView } from './components/docs/ArchitectureDocsView';
import { BookOpen, Camera, MessageSquare, Award, FileUp, ShieldCheck, Smartphone } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [userProfile, setUserProfile] = useState(INITIAL_USER_PROFILE);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [cheatLogs, setCheatLogs] = useState<CheatLog[]>(SAMPLE_CHEAT_LOGS);

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

  // Nội dung màn hình theo tab hiện tại
  const renderCurrentView = () => {
    if (currentTab === 'architecture_docs') {
      return <ArchitectureDocsView />;
    }

    if (userRole === 'admin') {
      return <AdminDashboardView cheatLogs={cheatLogs} />;
    }

    if (userRole === 'teacher') {
      if (currentTab === 'exam') {
        return <ExamEngineView onRecordCheatLog={handleRecordCheatLog} />;
      }
      return <TeacherPortalView />;
    }

    // Role: Student
    switch (currentTab) {
      case 'home':
        return (
          <SkillTreeView
            onStartExam={() => setCurrentTab('exam')}
            onOpenScanner={() => setCurrentTab('scanner')}
            onOpenTutor={() => setCurrentTab('tutor')}
            userXp={userProfile.xp}
            streakDays={userProfile.streakDays}
          />
        );
      case 'scanner':
        return (
          <CameraScannerView
            dailyScanCount={userProfile.dailyScanCount}
            maxDailyScans={userProfile.maxDailyScans}
            tier={userProfile.tier}
            onIncrementScan={handleIncrementScan}
            onUpgradeTier={handleToggleTier}
          />
        );
      case 'tutor':
        return <SocraticTutorView />;
      case 'exam':
        return <ExamEngineView onRecordCheatLog={handleRecordCheatLog} />;
      default:
        return (
          <SkillTreeView
            onStartExam={() => setCurrentTab('exam')}
            onOpenScanner={() => setCurrentTab('scanner')}
            onOpenTutor={() => setCurrentTab('tutor')}
            userXp={userProfile.xp}
            streakDays={userProfile.streakDays}
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
        onSelectRole={setUserRole}
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
              <button
                onClick={() => setCurrentTab('home')}
                className={`flex flex-col items-center gap-0.5 ${
                  currentTab === 'home' ? 'text-blue-600 font-bold' : 'text-slate-400'
                }`}
              >
                <BookOpen size={18} />
                <span className="text-[10px]">Lộ trình</span>
              </button>
              <button
                onClick={() => setCurrentTab('scanner')}
                className={`flex flex-col items-center gap-0.5 ${
                  currentTab === 'scanner' ? 'text-blue-600 font-bold' : 'text-slate-400'
                }`}
              >
                <Camera size={18} />
                <span className="text-[10px]">Quét AI</span>
              </button>
              <button
                onClick={() => setCurrentTab('tutor')}
                className={`flex flex-col items-center gap-0.5 ${
                  currentTab === 'tutor' ? 'text-blue-600 font-bold' : 'text-slate-400'
                }`}
              >
                <MessageSquare size={18} />
                <span className="text-[10px]">Gia sư</span>
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
            </div>
          </div>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Math&NBK Platform. Hệ thống Giáo dục Toán học THPT Chuẩn Quốc Gia.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Phiên bản 2.5 (GDPT 2018)</span>
            <span>·</span>
            <button
              onClick={() => setCurrentTab('architecture_docs')}
              className="hover:text-blue-600 transition-colors"
            >
              Tài Liệu Kỹ Thuật Clean Architecture
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
