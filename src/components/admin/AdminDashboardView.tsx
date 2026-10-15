import React, { useState } from 'react';
import { UserProfile, CheatLog, Exam } from '../../types/math';
import { SAMPLE_CHEAT_LOGS, SAMPLE_EXAM_BGD } from '../../data/mockData';
import { Users, ShieldAlert, Cpu, Database, CheckCircle2, Clock, AlertTriangle, Sparkles, Zap, Search } from 'lucide-react';

interface AdminDashboardViewProps {
  cheatLogs: CheatLog[];
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ cheatLogs }) => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'users' | 'cheat_logs' | 'exams'>('tokens');

  const [users, setUsers] = useState<UserProfile[]>([
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
      id: 'usr_student_02',
      name: 'Trần Hoàng Long',
      email: 'long.tran@thpt-nbk.edu.vn',
      role: 'student',
      tier: 'free',
      xp: 2100,
      streakDays: 14,
      lastActiveDate: '2026-10-15',
      dailyScanCount: 8,
      maxDailyScans: 10,
      grade: 12,
    },
    {
      id: 'usr_student_03',
      name: 'Lê Thùy Dung',
      email: 'dung.le@thpt-nbk.edu.vn',
      role: 'student',
      tier: 'premium',
      xp: 3450,
      streakDays: 22,
      lastActiveDate: '2026-10-15',
      dailyScanCount: 15,
      maxDailyScans: 9999,
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

  const [allLogs, setAllLogs] = useState<CheatLog[]>([...cheatLogs, ...SAMPLE_CHEAT_LOGS]);

  const toggleUserTier = (userId: string) => {
    setUsers((prev) =>
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
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Bảng Điều Khiển Quản Trị Hệ Thống</span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Math&NBK Admin Center</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Giám sát mức tiêu thụ Token AI, quản lý người dùng & phân quyền RBAC, kiểm toán nhật ký chống gian lận.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'tokens' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Token & Cache
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Người Dùng ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('cheat_logs')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'cheat_logs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Nhật Ký Thi ({allLogs.length})
          </button>
        </div>
      </div>

      {/* TAB 1: AI TOKEN CONSUMPTION & CACHING STATS */}
      {activeTab === 'tokens' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
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
              <span className="text-xs font-bold text-slate-500 block">Lượt Quét OCR Toán</span>
              <span className="text-2xl font-black text-purple-600 font-mono mt-1 block">
                1,420 <span className="text-xs font-medium text-slate-400">lần</span>
              </span>
              <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                Trung bình 1.2s / lần giải
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">Đề Thi PDF Đã Bóc Tách</span>
              <span className="text-2xl font-black text-amber-600 font-mono mt-1 block">
                86 <span className="text-xs font-medium text-slate-400">bộ đề</span>
              </span>
              <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                100% đạt chuẩn Zod Schema
              </span>
            </div>
          </div>

          {/* Detailed Token Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-base text-slate-900">
              Phân Bổ Token Theo Tác Vụ Nghiệp Vụ
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Máy Quét Camera OCR & AI Math Solver (Gemini Vision)</span>
                  <span className="font-mono">54% (67,270 tk)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '54%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Gia Sư Socratic Đàm Thoại & Gợi Mở (Gemini Chat)</span>
                  <span className="font-mono">31% (38,620 tk)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '31%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Trình Bóc Tách Đề PDF AI 4 Phần & Zod Schema Validation</span>
                  <span className="font-mono">15% (18,690 tk)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Quản Lý Tài Khoản & Gói Cước</h3>
            <span className="text-xs text-slate-500">Tổng cộng: {users.length} người dùng</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Họ Tên & Email</th>
                  <th className="px-6 py-3">Vai Trò</th>
                  <th className="px-6 py-3">Gói Cước</th>
                  <th className="px-6 py-3">Lượt Quét Hôm Nay</th>
                  <th className="px-6 py-3">Điểm XP / Chuỗi</th>
                  <th className="px-6 py-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          u.role === 'teacher'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role === 'admin'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {u.role}
                      </span>
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
                    <td className="px-6 py-4 font-mono">
                      {u.dailyScanCount} / {u.tier === 'premium' ? '∞' : u.maxDailyScans}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-amber-600">{u.xp} XP</span>
                      <span className="text-slate-400 ml-2">({u.streakDays} ngày)</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleUserTier(u.id)}
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
      )}

      {/* TAB 3: CHEAT LOGS AUDIT */}
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
    </div>
  );
};
