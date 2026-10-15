import React, { useState, useMemo } from 'react';
import { UserProfile, CheatLog, UserRole, AccountTier } from '../../types/math';
import {
  Users,
  ShieldAlert,
  Cpu,
  Database,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Zap,
  Search,
  UserPlus,
  X,
  Check,
  ShieldCheck,
  GraduationCap,
  Award,
  Filter,
} from 'lucide-react';

interface AdminDashboardViewProps {
  cheatLogs: CheatLog[];
  users?: UserProfile[];
  onCreateUser?: (newUser: UserProfile) => void;
  onToggleUserTier?: (userId: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  cheatLogs,
  users: propUsers,
  onCreateUser,
  onToggleUserTier,
}) => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'users' | 'cheat_logs'>('users');

  // Internal user state if not provided via props
  const [internalUsers, setInternalUsers] = useState<UserProfile[]>([
    {
      id: 'usr_student_01',
      name: 'Nguyễn Văn An',
      email: 'an.nguyen@thpt-nbk.edu.vn',
      role: 'student',
      tier: 'free',
      xp: 1450,
      streakDays: 7,
      lastActiveDate: '2026-10-15',
      dailyScanCount: 2,
      maxDailyScans: 10,
      grade: 12,
    },
    {
      id: 'usr_teacher_01',
      name: 'ThS. Trần Văn Minh',
      email: 'minh.tran@thpt-nbk.edu.vn',
      role: 'teacher',
      tier: 'premium',
      xp: 8900,
      streakDays: 45,
      lastActiveDate: '2026-10-15',
      dailyScanCount: 0,
      maxDailyScans: 9999,
      grade: 12,
    },
  ]);

  const usersList = propUsers || internalUsers;

  // Search & Filter state in User Management
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'teacher' | 'student'>('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // ==========================================
  // STATE CẤP TÀI KHOẢN MỚI (CHỈ ADMIN MỚI CÓ QUYỀN)
  // ==========================================
  const [showCreateUserModal, setShowCreateUserModal] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'teacher' | 'student'>('student');
  const [newUserId, setNewUserId] = useState('');
  const [newUserGrade, setNewUserGrade] = useState<10 | 11 | 12>(12);
  const [newUserTier, setNewUserTier] = useState<AccountTier>('free');
  const [createUserError, setCreateUserError] = useState<string | null>(null);
  const [createUserSuccess, setCreateUserSuccess] = useState<string | null>(null);

  // Lọc duy nhất theo id để tránh lỗi duplicate key cl_101, cl_102, cl_103
  const allLogs = useMemo(() => {
    const map = new Map<string, CheatLog>();
    (cheatLogs || []).forEach((log) => {
      if (log && log.id) {
        map.set(log.id, log);
      }
    });
    return Array.from(map.values());
  }, [cheatLogs]);

  const toggleTier = (userId: string) => {
    if (onToggleUserTier) {
      onToggleUserTier(userId);
    } else {
      setInternalUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            const nextTier = u.tier === 'free' ? 'premium' : 'free';
            return {
              ...u,
              tier: nextTier,
              maxDailyScans: nextTier === 'premium' ? 9999 : 10,
            };
          }
          return u;
        })
      );
    }
  };

  // Tự động sinh ID theo vai trò
  const generateRecommendedId = (role: 'teacher' | 'student') => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    return role === 'teacher' ? `usr_teacher_${randomNum}` : `usr_student_${randomNum}`;
  };

  const handleOpenCreateModal = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('student');
    setNewUserId(generateRecommendedId('student'));
    setNewUserGrade(12);
    setNewUserTier('free');
    setCreateUserError(null);
    setCreateUserSuccess(null);
    setShowCreateUserModal(true);
  };

  // Submit tạo tài khoản mới (Admin Only)
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError(null);

    if (!newUserName.trim()) {
      setCreateUserError('Vui lòng nhập họ và tên!');
      return;
    }

    const trimmedId = (newUserId.trim() || generateRecommendedId(newUserRole)).toLowerCase();

    // Kiểm tra trùng ID
    if (usersList.some((u) => u.id.toLowerCase() === trimmedId)) {
      setCreateUserError(`Mã ID "${trimmedId}" đã tồn tại trên hệ thống. Vui lòng chọn mã ID khác!`);
      return;
    }

    const finalEmail =
      newUserEmail.trim() ||
      `${newUserName.trim().toLowerCase().replace(/\s+/g, '')}.${trimmedId}@thpt-nbk.edu.vn`;

    const newUser: UserProfile = {
      id: trimmedId,
      name: newUserName.trim(),
      email: finalEmail,
      role: newUserRole,
      tier: newUserTier,
      xp: newUserRole === 'teacher' ? 5000 : 500,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      dailyScanCount: 0,
      maxDailyScans: newUserTier === 'premium' ? 9999 : 10,
      grade: newUserGrade,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newUserName.trim())}`,
    };

    if (onCreateUser) {
      onCreateUser(newUser);
    } else {
      setInternalUsers((prev) => [newUser, ...prev]);
    }

    setCreateUserSuccess(
      `Đã tạo thành công tài khoản cho ${newUserRole === 'teacher' ? 'Giáo viên' : 'Học sinh'} "${newUser.name}" với ID: ${newUser.id}`
    );

    setTimeout(() => {
      setShowCreateUserModal(false);
      setCreateUserSuccess(null);
    }, 2000);
  };

  // Lọc danh sách người dùng hiển thị
  const filteredUsers = usersList.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
            <ShieldCheck size={16} />
            <span>Trung Tâm Quản Trị Hệ Thống Toàn Quyền (Super Admin)</span>
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Math&NBK Admin Center</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Độc quyền quyền hạn cấp tài khoản Giáo viên & Học sinh, quản lý token AI và nhật ký thi.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Users size={14} />
            <span>Tài Khoản ({usersList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'tokens' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Cpu size={14} />
            <span>Token & Cache</span>
          </button>
          <button
            onClick={() => setActiveTab('cheat_logs')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'cheat_logs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <ShieldAlert size={14} />
            <span>Nhật Ký Thi ({allLogs.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: USER MANAGEMENT (CHỈ ADMIN MỚI CÓ QUYỀN TẠO TÀI KHOẢN) */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Security Banner regarding Admin Exclusive User Provisioning */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-slate-50 border border-rose-200 text-xs text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-rose-900">
                  Phân Quyền Tuyệt Đối: Chỉ Admin Mới Được Cấp Tài Khoản
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Theo quy định an toàn bảo mật GDPT 2018, học sinh và giáo viên không thể tự tạo tài khoản. Chỉ Quản Trị Viên (Admin) mới có quyền tạo và cấp phát mã định danh (User ID) cho Giáo viên và Học sinh.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs whitespace-nowrap transition-colors"
            >
              <UserPlus size={16} />
              <span>+ Cấp Tài Khoản Mới</span>
            </button>
          </div>

          {/* User Table Card */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            {/* Filter and search bar */}
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setUserRoleFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    userRoleFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Tất cả ({usersList.length})
                </button>
                <button
                  onClick={() => setUserRoleFilter('teacher')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    userRoleFilter === 'teacher' ? 'bg-white text-purple-700 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Giáo viên ({usersList.filter((u) => u.role === 'teacher').length})
                </button>
                <button
                  onClick={() => setUserRoleFilter('student')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    userRoleFilter === 'student' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Học sinh ({usersList.filter((u) => u.role === 'student').length})
                </button>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="Tìm theo tên, email, ID..."
                  className="h-9 pl-8 pr-3 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:outline-none w-full sm:w-56"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Họ Tên & Email</th>
                    <th className="px-6 py-3">Mã ID Hệ Thống</th>
                    <th className="px-6 py-3">Vai Trò / Khối</th>
                    <th className="px-6 py-3">Gói Cước</th>
                    <th className="px-6 py-3">Điểm XP</th>
                    <th className="px-6 py-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-blue-700">
                        {u.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                              u.role === 'teacher'
                                ? 'bg-purple-100 text-purple-700'
                                : u.role === 'admin'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {u.role === 'teacher' ? 'Giáo viên' : u.role === 'admin' ? 'Quản trị' : 'Học sinh'}
                          </span>
                          {u.role === 'student' && (
                            <span className="text-[11px] font-semibold text-slate-500">Khối {u.grade}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            u.tier === 'premium' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {u.tier === 'premium' ? 'Premium (Pro)' : 'Free Tier'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-amber-600">{u.xp} XP</span>
                        <span className="text-slate-400 ml-2">({u.streakDays} ngày)</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleTier(u.id)}
                          className="px-3 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700 transition-colors"
                        >
                          {u.tier === 'free' ? 'Nâng lên Pro' : 'Hạ xuống Free'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI TOKEN & CACHE */}
      {activeTab === 'tokens' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">Tổng Token Đã Dùng</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                124,580 <span className="text-xs font-medium text-slate-400">tk</span>
              </span>
              <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
                Mô hình: Gemini 3.8 Flash
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">Tỷ Lệ Trúng Cache (Redis)</span>
              <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
                68.4%
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                Tiết kiệm 85,200 token gọi lại
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">Chi Phí Ước Tính</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                $1.24
              </span>
              <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                Ngân sách trường: $500/tháng
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">Người Dùng Hoạt Động</span>
              <span className="text-2xl font-black text-blue-600 font-mono mt-1 block">
                {usersList.length}
              </span>
              <span className="text-[11px] text-blue-700 font-semibold mt-1 block">
                Tài khoản chính quy
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHEAT LOGS */}
      {activeTab === 'cheat_logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Nhật Ký Giám Sát Chống Gian Lận Trực Tuyến
              </h3>
              <p className="text-xs text-slate-500">
                Ghi nhận các sự kiện chuyển ứng dụng, rời màn hình và vi phạm quá 3 lần
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
              {allLogs.length} vi phạm được ghi nhận
            </span>
          </div>

          <div className="space-y-3">
            {allLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.studentName}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.infractionNumber >= 3
                          ? 'bg-red-600 text-white'
                          : log.infractionNumber === 2
                          ? 'bg-amber-500 text-white'
                          : 'bg-yellow-400 text-slate-900'
                      }`}
                    >
                      Lần {log.infractionNumber}
                    </span>
                  </div>
                  <p className="text-slate-600">{log.reason}</p>
                  <p className="text-[11px] text-slate-400">Đề thi: {log.examTitle}</p>
                </div>

                <div className="text-right">
                  <span
                    className={`font-bold block ${
                      log.actionTaken === 'auto_submitted_disqualified'
                        ? 'text-red-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {log.actionTaken === 'auto_submitted_disqualified'
                      ? 'Tự động nộp bài & Đình chỉ'
                      : `Cảnh báo vi phạm lần ${log.infractionNumber}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CẤP TÀI KHOẢN MỚI CHO GIÁO VIÊN / HỌC SINH (CHỈ ADMIN MỚI CÓ QUYỀN) */}
      {/* ========================================================================= */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Cấp Tài Khoản Mới (Quyền Quản Trị)
                  </h3>
                  <p className="text-xs text-rose-600 font-semibold">
                    Chỉ Admin mới có thẩm quyền khởi tạo tài khoản GV / HS
                  </p>
                </div>
              </div>
              <button onClick={() => setShowCreateUserModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {createUserError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{createUserError}</span>
              </div>
            )}

            {createUserSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{createUserSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs">
              {/* Chọn vai trò: Giáo viên hoặc Học sinh */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Chọn vai trò tài khoản:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewUserRole('teacher');
                      setNewUserId(generateRecommendedId('teacher'));
                    }}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      newUserRole === 'teacher'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <GraduationCap size={16} />
                    <span>Giáo Viên Toán</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewUserRole('student');
                      setNewUserId(generateRecommendedId('student'));
                    }}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      newUserRole === 'student'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Users size={16} />
                    <span>Học Sinh THPT</span>
                  </button>
                </div>
              </div>

              {/* Họ và tên */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Họ và tên người dùng *</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder={newUserRole === 'teacher' ? 'VD: ThS. Hoàng Văn Bách' : 'VD: Đặng Quốc Huy'}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              {/* Mã ID hệ thống (Unique Key dùng cho Kết Bạn qua ID) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Mã ID Hệ Thống (Dùng để kết bạn qua ID) *</label>
                  <button
                    type="button"
                    onClick={() => setNewUserId(generateRecommendedId(newUserRole))}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    Tạo mã ngẫu nhiên
                  </button>
                </div>
                <input
                  type="text"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value.toLowerCase().trim())}
                  placeholder="VD: usr_teacher_04 hoặc usr_student_08"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-xs font-bold text-blue-700 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email trường học (Tùy chọn)</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="Tự động sinh theo tên nếu để trống"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Khối lớp (Nếu là Học sinh) */}
              {newUserRole === 'student' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Khối Lớp Đang Học *</label>
                  <select
                    value={newUserGrade}
                    onChange={(e) => setNewUserGrade(Number(e.target.value) as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value={12}>Lớp 12 (Ôn thi Tốt nghiệp THPT)</option>
                    <option value={11}>Lớp 11 (GDPT 2018)</option>
                    <option value={10}>Lớp 10 (GDPT 2018)</option>
                  </select>
                </div>
              )}

              {/* Gói cước */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Gói Tài Khoản</label>
                <select
                  value={newUserTier}
                  onChange={(e) => setNewUserTier(e.target.value as AccountTier)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white focus:border-blue-600 focus:outline-none"
                >
                  <option value="free">Miễn Phí (Free Tier - 10 lượt quét/ngày)</option>
                  <option value="premium">Nâng Cao (Premium Pro - Không giới hạn AI & Đề thi)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
                >
                  Xác Nhận Cấp Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
