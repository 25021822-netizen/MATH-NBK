import React from 'react';
import { UserRole, AccountTier } from '../types/math';
import { BookOpen, Flame, Zap, Smartphone, Monitor, Tablet, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  tier: AccountTier;
  onToggleTier: () => void;
  streakDays: number;
  xp: number;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  onSelectDeviceMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  onSelectRole,
  tier,
  onToggleTier,
  streakDays,
  xp,
  deviceMode,
  onSelectDeviceMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('home');
            }}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen size={22} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                Math<span className="text-blue-600">&</span>NBK
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Toán THPT Thế Hệ Mới
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Navigation Links (Single-line, whitespace-nowrap) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {userRole === 'student' && (
            <>
              <button
                onClick={() => onSelectTab('home')}
                className={`whitespace-nowrap transition-colors py-1 ${
                  currentTab === 'home'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                Lộ Trình Học
              </button>
              <button
                onClick={() => onSelectTab('scanner')}
                className={`whitespace-nowrap transition-colors py-1 ${
                  currentTab === 'scanner'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                Quét Bài Tập AI
              </button>
              <button
                onClick={() => onSelectTab('tutor')}
                className={`whitespace-nowrap transition-colors py-1 ${
                  currentTab === 'tutor'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                Gia Sư Socratic
              </button>
              <button
                onClick={() => onSelectTab('exam')}
                className={`whitespace-nowrap transition-colors py-1 ${
                  currentTab === 'exam'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                Thi Thử BGD
              </button>
            </>
          )}

          {userRole === 'teacher' && (
            <>
              <button
                onClick={() => onSelectTab('teacher_portal')}
                className={`whitespace-nowrap transition-colors py-1 ${
                  currentTab === 'teacher_portal'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                Tải Đề Thi PDF & AI Parser
              </button>
              <button
                onClick={() => onSelectTab('exam')}
                className={`whitespace-nowrap transition-colors py-1 ${
                  currentTab === 'exam'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                Xem Trước Phòng Thi
              </button>
            </>
          )}

          {userRole === 'admin' && (
            <button
              onClick={() => onSelectTab('admin_dashboard')}
              className={`whitespace-nowrap transition-colors py-1 ${
                currentTab === 'admin_dashboard'
                  ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                  : 'hover:text-slate-900'
              }`}
            >
              Trung Tâm Quản Trị & Token AI
            </button>
          )}

          <button
            onClick={() => onSelectTab('architecture_docs')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'architecture_docs'
                ? 'text-indigo-600 font-bold border-b-2 border-indigo-600'
                : 'hover:text-slate-900 text-slate-500'
            }`}
          >
            Kiến Trúc & Mã Nguồn React Native
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & Context Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Streak & XP for Students */}
          {userRole === 'student' && (
            <div className="hidden lg:flex items-center gap-3 text-xs font-bold tabular-nums">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-lg text-amber-700 border border-amber-200">
                <Flame size={16} className="text-amber-600 fill-amber-500" />
                <span>{streakDays} ngày</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-lg text-blue-700 border border-blue-200">
                <Zap size={16} className="text-blue-600 fill-blue-500" />
                <span>{xp} XP</span>
              </div>
            </div>
          )}

          {/* Device viewport frame switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onSelectDeviceMode('desktop')}
              title="Giao diện Màn hình rộng"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                deviceMode === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Monitor size={15} />
            </button>
            <button
              onClick={() => onSelectDeviceMode('tablet')}
              title="Khung Tablet (iPad)"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                deviceMode === 'tablet' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Tablet size={15} />
            </button>
            <button
              onClick={() => onSelectDeviceMode('mobile')}
              title="Khung Smartphone (iPhone)"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                deviceMode === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Smartphone size={15} />
            </button>
          </div>

          {/* Role Switcher Pill */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['student', 'teacher', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  onSelectRole(r);
                  if (r === 'student') onSelectTab('home');
                  if (r === 'teacher') onSelectTab('teacher_portal');
                  if (r === 'admin') onSelectTab('admin_dashboard');
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-all whitespace-nowrap ${
                  userRole === r
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'student' ? 'Học sinh' : r === 'teacher' ? 'Giáo viên' : 'Quản trị'}
              </button>
            ))}
          </div>

          {/* Tier Badge / Upgrade Button */}
          <button
            onClick={onToggleTier}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
              tier === 'premium'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Sparkles size={14} />
            <span>{tier === 'premium' ? 'Gói Pro' : 'Nâng cấp Pro'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
