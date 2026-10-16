import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types/math';
import { BookOpen, Save, UserRound } from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfile;
  userRole: UserRole;
  onSave: (profile: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, userRole, onSave }) => {
  const [form, setForm] = useState<UserProfile>({ ...profile, role: userRole });
  const [saved, setSaved] = useState(false);

  const update = (field: keyof UserProfile, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value, role: userRole }));
    setSaved(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({ ...form, role: userRole });
    setSaved(true);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <header className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <UserRound size={28} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-100">Hồ sơ cá nhân</p>
            <h1 className="mt-1 text-2xl font-extrabold">{userRole === 'teacher' ? 'Giáo viên' : 'Học sinh'}</h1>
          </div>
        </div>
        <p className="mt-4 max-w-xl text-sm text-blue-100">
          Cập nhật thông tin liên hệ và thông tin học tập. Thông tin được lưu trên trình duyệt hiện tại.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <BookOpen size={18} className="text-blue-600" />
          <h2 className="font-extrabold text-slate-900">Thông tin tài khoản</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-xs font-bold text-slate-600">
            Họ và tên
            <input required value={form.name} onChange={(event) => update('name', event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="space-y-1.5 text-xs font-bold text-slate-600">
            Email
            <input type="email" required value={form.email} onChange={(event) => update('email', event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="space-y-1.5 text-xs font-bold text-slate-600">
            Số điện thoại
            <input type="tel" value={form.phone || ''} onChange={(event) => update('phone', event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="space-y-1.5 text-xs font-bold text-slate-600">
            Trường
            <input value={form.school || ''} onChange={(event) => update('school', event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          {userRole === 'student' ? (
            <label className="space-y-1.5 text-xs font-bold text-slate-600 sm:col-span-2">
              Khối lớp
              <select value={form.grade} onChange={(event) => update('grade', Number(event.target.value))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                {[10, 11, 12].map((grade) => <option key={grade} value={grade}>Lớp {grade}</option>)}
              </select>
            </label>
          ) : (
            <label className="space-y-1.5 text-xs font-bold text-slate-600 sm:col-span-2">
              Môn giảng dạy
              <input value={form.subject || ''} onChange={(event) => update('subject', event.target.value)} placeholder="Ví dụ: Toán THPT" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm font-semibold text-emerald-700">{saved ? 'Đã lưu hồ sơ.' : ''}</p>
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">
            <Save size={16} /> Lưu hồ sơ
          </button>
        </div>
      </form>
    </div>
  );
};
