import React, { useState } from 'react';
import { UserProfile, Classroom, StudentExamSubmission } from '../../types/math';
import {
  User,
  Mail,
  Phone,
  School,
  GraduationCap,
  Award,
  Flame,
  Zap,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  Shield,
  Clock,
  BookOpen,
  Users,
  Edit3,
  Save,
  BarChart3,
  Camera,
  Share2,
} from 'lucide-react';

interface UserProfileViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  classrooms: Classroom[];
  submissions: StudentExamSubmission[];
  onOpenFriendsModal?: () => void;
  onNavigateToClassroom?: () => void;
  onToggleTier?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  userProfile,
  onUpdateProfile,
  classrooms,
  submissions,
  onOpenFriendsModal,
  onNavigateToClassroom,
  onToggleTier,
}) => {
  const isTeacher = userProfile.role === 'teacher';
  const isAdmin = userProfile.role === 'admin';

  // Form edit states
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone || '0912 345 678');
  const [schoolName, setSchoolName] = useState(userProfile.schoolName || 'THPT Chuyên Nguyễn Bỉnh Khiêm');
  const [grade, setGrade] = useState<10 | 11 | 12>(userProfile.grade);
  const [subject, setSubject] = useState(userProfile.subject || (isTeacher ? 'Tổ Toán - Tin THPT' : 'Toán Học'));
  const [bio, setBio] = useState(
    userProfile.bio ||
      (isTeacher
        ? 'Giáo viên phụ trách bồi dưỡng chuyên đề Toán Giải tích và Hình học không gian THPT.'
        : 'Học sinh lớp 12 chuyên Toán, định hướng ôn luyện kỳ thi Tốt nghiệp THPT 2025.')
  );
  const [avatarUrl, setAvatarUrl] = useState(
    userProfile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userProfile.name)}`
  );

  const [hasCopiedId, setHasCopiedId] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Thống kê cá nhân
  const mySubmissions = submissions.filter((s) => s.studentId === userProfile.id);
  const avgScore =
    mySubmissions.length > 0
      ? (mySubmissions.reduce((acc, cur) => acc + cur.score, 0) / mySubmissions.length).toFixed(2)
      : '0.00';

  const myClassrooms = classrooms.filter((c) =>
    isTeacher ? c.teacherId === userProfile.id : c.studentIds.includes(userProfile.id)
  );

  const handleCopyId = () => {
    navigator.clipboard.writeText(userProfile.id);
    setHasCopiedId(true);
    setTimeout(() => setHasCopiedId(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...userProfile,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      schoolName: schoolName.trim(),
      grade: grade,
      subject: subject.trim(),
      bio: bio.trim(),
      avatar: avatarUrl.trim(),
    };

    onUpdateProfile(updated);
    setSaveSuccessMessage('Thông tin hồ sơ đã được lưu và cập nhật thành công!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const PRESET_AVATARS = [
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'MathStudent')}`,
    'https://api.dicebear.com/7.x/bottts/svg?seed=TeacherMinh',
    'https://api.dicebear.com/7.x/bottts/svg?seed=AnNguyen',
    'https://api.dicebear.com/7.x/bottts/svg?seed=ThuyDung',
    'https://api.dicebear.com/7.x/bottts/svg?seed=KhanhLinh',
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Profile Card Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with role ring */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-1 shadow-xl overflow-hidden">
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover rounded-2xl bg-blue-50" />
            </div>
            <span
              className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-xs ${
                isTeacher
                  ? 'bg-purple-500 text-white'
                  : isAdmin
                  ? 'bg-rose-500 text-white'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {isTeacher ? 'Giáo viên' : isAdmin ? 'Quản trị' : `Lớp ${grade}`}
            </span>
          </div>

          {/* User Basic Info */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{name}</h1>
              {userProfile.tier === 'premium' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-xs font-black uppercase flex items-center gap-1 shadow-xs">
                  <Sparkles size={12} />
                  <span>Pro</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
                  Free
                </span>
              )}
            </div>

            <p className="text-blue-100 text-xs sm:text-sm font-medium">{schoolName}</p>

            {/* Electronic ID Pill with Copy button */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono font-bold mt-1">
              <span className="text-blue-200">ID:</span>
              <span className="text-white">{userProfile.id}</span>
              <button
                onClick={handleCopyId}
                title="Sao chép ID để kết bạn"
                className="hover:text-blue-300 transition-colors pl-1"
              >
                {hasCopiedId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            {onOpenFriendsModal && (
              <button
                onClick={onOpenFriendsModal}
                className="px-4 py-2.5 rounded-2xl bg-white text-blue-900 font-bold text-xs shadow-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Users size={16} className="text-blue-600" />
                <span>Mạng Lưới Bạn Bè</span>
              </button>
            )}
            {onToggleTier && userProfile.tier === 'free' && (
              <button
                onClick={onToggleTier}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-xs hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles size={16} />
                <span>Nâng Cấp Gói Pro</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={18} />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isTeacher ? (
          <>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Lớp Giảng Dạy</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                {myClassrooms.length}
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">Nhóm lớp hoạt động</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Tổng Học Sinh</span>
              <span className="text-2xl font-black text-indigo-600 font-mono mt-1 block">
                {myClassrooms.reduce((acc, c) => acc + c.studentIds.length, 0)}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">Đang theo học</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Chuỗi Giảng Dạy</span>
              <span className="text-2xl font-black text-amber-500 font-mono mt-1 block">
                {userProfile.streakDays} ngày
              </span>
              <span className="text-[10px] text-amber-600 font-semibold">Tương tác liên tục</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Điểm Cống Hiến</span>
              <span className="text-2xl font-black text-blue-600 font-mono mt-1 block">
                {userProfile.xp} XP
              </span>
              <span className="text-[10px] text-blue-500 font-semibold">Giáo viên tích cực</span>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Điểm Tích Lũy</span>
              <span className="text-2xl font-black text-blue-600 font-mono mt-1 block">
                {userProfile.xp} XP
              </span>
              <span className="text-[10px] text-blue-500 font-semibold">Thứ hạng: Cao thủ</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Chuỗi Streak</span>
              <span className="text-2xl font-black text-amber-500 font-mono mt-1 block flex items-center gap-1">
                <Flame size={20} className="fill-amber-500" />
                <span>{userProfile.streakDays}</span>
              </span>
              <span className="text-[10px] text-amber-600 font-semibold">Ngày học liên tục</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Đề Thi Đã Nộp</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                {mySubmissions.length}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">Điểm TB: {avgScore}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Quét Bài Tập</span>
              <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
                {userProfile.dailyScanCount}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">Lượt hôm nay</span>
            </div>
          </>
        )}
      </div>

      {/* Main Form: Cập nhật thông tin hồ sơ */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Edit3 size={20} className="text-blue-600" />
            <h2 className="text-lg font-extrabold text-slate-900">Chi Tiết Hồ Sơ Cá Nhân</h2>
          </div>
          <span className="text-xs text-slate-400">Cập nhật hồ sơ phục vụ thi cử & nhóm lớp</span>
        </div>

        {/* Preset Avatar Picker */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">Chọn ảnh đại diện Avatar:</label>
          <div className="flex flex-wrap items-center gap-3">
            {PRESET_AVATARS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAvatarUrl(p)}
                className={`w-12 h-12 rounded-2xl p-0.5 border-2 transition-transform ${
                  avatarUrl === p ? 'border-blue-600 scale-105' : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <img src={p} alt="Preset avatar" className="w-full h-full object-cover rounded-xl bg-slate-50" />
              </button>
            ))}
          </div>
        </div>

        {/* Grid Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Họ và tên *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-semibold focus:border-blue-600 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Email trường học *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-semibold focus:border-blue-600 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Trường THPT *</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-semibold focus:border-blue-600 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Số điện thoại liên hệ</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-semibold focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">
              {isTeacher ? 'Tổ Bộ Môn / Khối Phụ Trách' : 'Khối Lớp Đang Học *'}
            </label>
            {isTeacher ? (
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-semibold focus:border-blue-600 focus:outline-none"
              />
            ) : (
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value) as any)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-semibold bg-white focus:border-blue-600 focus:outline-none"
              >
                <option value={12}>Lớp 12 (Chương trình GDPT 2018)</option>
                <option value={11}>Lớp 11 (Chương trình GDPT 2018)</option>
                <option value={10}>Lớp 10 (Chương trình GDPT 2018)</option>
              </select>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Mã Định Danh ID Hệ Thống (Bảo mật)</label>
            <input
              type="text"
              value={userProfile.id}
              disabled
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-100 font-mono font-bold text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Tiểu sử & Mục tiêu */}
        <div className="space-y-1 text-xs">
          <label className="font-bold text-slate-700">
            {isTeacher ? 'Lời giới thiệu & Thông điệp giảng dạy' : 'Mục tiêu học tập & Kỳ thi hướng tới'}
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Viết vài dòng chia sẻ về mục tiêu học tập môn Toán..."
            className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Danh sách lớp học đang tham gia */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              {isTeacher ? 'Các nhóm lớp đang quản lý' : 'Các nhóm lớp đang tham gia'} ({myClassrooms.length})
            </span>
            {onNavigateToClassroom && (
              <button
                type="button"
                onClick={onNavigateToClassroom}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Đến Cổng Nhóm Lớp
              </button>
            )}
          </div>

          {myClassrooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {myClassrooms.map((cls) => (
                <div
                  key={cls.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900">{cls.name}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Mã lớp: {cls.code} · Khối {cls.grade}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-bold text-[10px]">
                    {cls.studentIds.length} học sinh
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center">
              Chưa tham gia nhóm lớp nào.
            </p>
          )}
        </div>

        {/* Nút lưu thay đổi */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all"
          >
            <Save size={16} />
            <span>Lưu Thay Đổi Hồ Sơ</span>
          </button>
        </div>
      </form>
    </div>
  );
};
