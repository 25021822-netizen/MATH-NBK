import React from 'react';
import { UserRole, AccountTier } from '../types/math';
import { BookOpen, Flame, Zap, Smartphone, Monitor, Tablet, Sparkles, UserCheck, Users, Compass, User } from 'lucide-react';

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
  onOpenFriendsModal?: () => void;
  friendsCount?: number;
  pendingRequestsCount?: number;
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
  onOpenFriendsModal,
  friendsCount = 0,
  pendingRequestsCount = 0,
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
              if (userRole === 'teacher') onSelectTab('classroom');
              else if (userRole === 'admin') onSelectTab('admin_dashboard');
              else onSelectTab('ask_ai');
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
        <nav className="hidden md:flex items-center gap-4 lg:gap-5 text-sm font-medium text-slate-600">
          {userRole === 'student' && (
            <>
              <button
                onClick={() => onSelectTab('ask_ai')}
                className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1.5 ${
                  currentTab === 'ask_ai' || currentTab === 'scanner' || currentTab === 'tutor'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                <Sparkles size={15} className="text-blue-600" />
                <span>Hỏi AI</span>
              </button>
              <button
                onClick={() => onSelectTab('classroom')}
                className={`whitespace-nowrap transition-colors py-1 ${
                  currentTab === 'classroom'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                Nhóm Lớp
              </button>
              <button
                onClick={() => onSelectTab('student_history')}
                className={`whitespace-nowrap transition-colors py-1 ${
                  currentTab === 'student_history'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                Bài Đã Làm
              </button>
              <button
                onClick={() => onSelectTab('geometry')}
                className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1 ${
                  currentTab === 'geometry'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                <Compass size={14} />
                <span>Vẽ Hình 2D/3D</span>
              </button>
              <button
                onClick={() => onSelectTab('profile')}
                className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1 ${
                  currentTab === 'profile'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                <User size={14} />
                <span>Hồ Sơ</span>
              </button>
            </>
          )}

          {userRole === 'teacher' && (
            <>
              <button
                onClick={() => onSelectTab('classroom')}
                className={`whitespace-nowrap transition-colors py-1 ${
                  currentTab === 'classroom'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                Quản Lý Nhóm Lớp
              </button>
              <button
                onClick={() => onSelectTab('teacher_gradebook')}
                className={`whitespace-nowrap transition-colors py-1 ${
                  currentTab === 'teacher_gradebook'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                Tổng Hợp Điểm Thi
              </button>
              <button
                onClick={() => onSelectTab('teacher_portal')}
                className={`whitespace-nowrap transition-colors py-1 ${
                  currentTab === 'teacher_portal'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                Tạo Đề Thi & Tải PDF
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
              <button
                onClick={() => onSelectTab('geometry')}
                className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1 ${
                  currentTab === 'geometry'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                <Compass size={14} />
                <span>Vẽ Hình 2D/3D</span>
              </button>
              <button
                onClick={() => onSelectTab('ask_ai')}
                className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1 ${
                  currentTab === 'ask_ai' || currentTab === 'scanner' || currentTab === 'tutor'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                <Sparkles size={14} className="text-blue-600" />
                <span>Hỏi AI</span>
              </button>
              <button
                onClick={() => onSelectTab('profile')}
                className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1 ${
                  currentTab === 'profile'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                <User size={14} />
                <span>Hồ Sơ</span>
              </button>
            </>
          )}

          {userRole === 'admin' && (
            <>
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
              <button
                onClick={() => onSelectTab('profile')}
                className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1 ${
                  currentTab === 'profile'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                <User size={14} />
                <span>Hồ Sơ</span>
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action & Context Controls */}
        <div className="flex items-center gap-3 shrink-0">
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

          {/* Friends Network Button (GV-GV, HS-HS, GV-HS) */}
          {onOpenFriendsModal && (
            <button
              onClick={onOpenFriendsModal}
              title="Mạng lưới kết bạn qua ID (GV-GV, HS-HS, GV-HS)"
              className="relative px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs"
            >
              <UserCheck size={15} />
              <span className="hidden sm:inline">Bạn Bè</span>
              {friendsCount > 0 && (
                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {friendsCount}
                </span>
              )}
              {pendingRequestsCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute -top-1 -right-1 animate-pulse" />
              )}
            </button>
          )}

          {/* Role Switcher Pill */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['student', 'teacher', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  onSelectRole(r);
                  if (r === 'student') onSelectTab('ask_ai');
                  if (r === 'teacher') onSelectTab('classroom');
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
