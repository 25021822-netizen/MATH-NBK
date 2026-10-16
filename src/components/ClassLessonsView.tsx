import React, { useMemo, useState } from 'react';
import { BookOpenCheck, Plus, ClipboardList, FileText, Upload, Download } from 'lucide-react';
import { Classroom, ClassroomLesson, UserRole } from '../types/math';

interface ClassLessonsViewProps {
  classrooms: Classroom[];
  lessons: ClassroomLesson[];
  userRole: UserRole;
  userId: string;
  userName: string;
  onAddLesson: (lesson: ClassroomLesson) => void;
  initialClassId?: string;
}

export const ClassLessonsView: React.FC<ClassLessonsViewProps> = ({ classrooms, lessons, userRole, userId, userName, onAddLesson, initialClassId }) => {
  const availableClasses = useMemo(
    () => userRole === 'teacher' ? classrooms.filter((room) => room.teacherId === userId) : classrooms.filter((room) => room.studentIds.includes(userId)),
    [classrooms, userId, userRole],
  );
  const [selectedClassId, setSelectedClassId] = useState(initialClassId || availableClasses[0]?.id || '');
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [attachment, setAttachment] = useState<ClassroomLesson['attachment']>();
  const [attachmentError, setAttachmentError] = useState('');
  const [isReadingAttachment, setIsReadingAttachment] = useState(false);
  const selectedClass = availableClasses.find((room) => room.id === selectedClassId) || availableClasses[0];
  const classLessons = lessons.filter((lesson) => lesson.classId === selectedClass?.id);

  const groupedLessons = useMemo(() => {
    const groups = new Map<string, ClassroomLesson[]>();
    classLessons.forEach((lesson) => {
      const chapter = lesson.topic.trim() || 'Chưa phân chương';
      groups.set(chapter, [...(groups.get(chapter) || []), lesson]);
    });
    return [...groups.entries()].sort(([chapterA], [chapterB]) => chapterA.localeCompare(chapterB, 'vi'));
  }, [classLessons]);

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAttachment(undefined);
    setAttachmentError('');
    setIsReadingAttachment(false);
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setAttachmentError('Vui lòng chọn tệp PDF.');
      event.target.value = '';
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setAttachmentError('Tệp PDF vượt quá 3 MB. Do tệp được lưu trên trình duyệt, vui lòng chọn tệp nhỏ hơn.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    setIsReadingAttachment(true);
    reader.onload = () => {
      setIsReadingAttachment(false);
      if (typeof reader.result !== 'string') {
        setAttachmentError('Không thể đọc tệp PDF đã chọn.');
        return;
      }
      setAttachment({ name: file.name, dataUrl: reader.result, size: file.size });
    };
    reader.onerror = () => {
      setIsReadingAttachment(false);
      setAttachmentError('Đọc tệp PDF thất bại. Vui lòng thử lại.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedClass || !title.trim() || !content.trim() || isReadingAttachment || attachmentError) return;
    onAddLesson({
      id: `lesson_${Date.now()}`,
      classId: selectedClass.id,
      title: title.trim(),
      topic: topic.trim(),
      content: content.trim(),
      summary: summary.trim(),
      teacherId: userId,
      teacherName: userName,
      createdAt: new Date().toISOString(),
      attachment,
    });
    setTitle('');
    setTopic('');
    setContent('');
    setSummary('');
    setAttachment(undefined);
    setAttachmentError('');
    setIsReadingAttachment(false);
    const fileInput = document.getElementById('lesson-pdf-upload') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <header className="rounded-3xl bg-gradient-to-r from-emerald-700 to-teal-600 p-6 text-white sm:p-8">
        <div className="flex items-center gap-3">
          <BookOpenCheck size={28} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">{userRole === 'teacher' ? 'Soạn và tổng hợp' : 'Tài liệu lớp học'}</p>
            <h1 className="text-2xl font-extrabold">{userRole === 'teacher' ? 'Bài Học Theo Nhóm Lớp' : 'Bài Học Được Giao'}</h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-emerald-50">{userRole === 'teacher' ? 'Tạo bài học, nội dung và tóm tắt để chia sẻ đúng nhóm lớp.' : 'Xem bài giảng và nội dung ôn tập giáo viên đã đăng cho lớp của bạn.'}</p>
      </header>

      {availableClasses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Chưa có nhóm lớp phù hợp để hiển thị bài học.</div>
      ) : (
        <>
          <label className="block space-y-2 text-xs font-bold text-slate-600">
            Chọn nhóm lớp
            <select value={selectedClass?.id || ''} onChange={(event) => setSelectedClassId(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 sm:max-w-xl">
              {availableClasses.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
            </select>
          </label>

          {userRole === 'teacher' && (
            <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 font-extrabold text-slate-900"><Plus size={18} className="text-emerald-600" /> Tạo bài học cho lớp</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tên bài học" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
                <input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Chương (ví dụ: Chương 1 - Ứng dụng đạo hàm)" aria-label="Chương bài học" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
              </div>
              <textarea required value={content} onChange={(event) => setContent(event.target.value)} placeholder="Nội dung bài học, công thức, bài tập..." rows={5} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
              <textarea value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Tóm tắt / ý chính cần ghi nhớ" rows={3} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <label htmlFor="lesson-pdf-upload" className="flex cursor-pointer items-center gap-3 text-sm font-bold text-slate-700">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600"><Upload size={18} /></span>
                  <span>
                    {isReadingAttachment ? 'Đang đọc tệp PDF...' : attachment ? attachment.name : 'Đính kèm tài liệu PDF'}
                    <span className="mt-0.5 block text-xs font-normal text-slate-500">Chỉ nhận PDF, tối đa 3 MB để phù hợp dung lượng lưu trên trình duyệt</span>
                  </span>
                </label>
                <input id="lesson-pdf-upload" type="file" accept="application/pdf,.pdf" onChange={handleAttachmentChange} className="sr-only" />
                {attachment && <p className="mt-2 text-xs text-emerald-700">Đã chọn tệp ({(attachment.size / 1024).toFixed(0)} KB).</p>}
                {attachmentError && <p role="alert" className="mt-2 text-xs font-semibold text-rose-700">{attachmentError}</p>}
              </div>
              <button type="submit" disabled={isReadingAttachment || Boolean(attachmentError)} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">Đăng bài học cho lớp</button>
            </form>
          )}

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900"><ClipboardList size={20} className="text-blue-600" /> Danh sách bài học ({classLessons.length})</h2>
            {classLessons.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Nhóm lớp chưa có bài học được đăng.</div>
            ) : groupedLessons.map(([chapter, chapterLessons]) => (
              <section key={chapter} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-blue-100 bg-blue-50 px-5 py-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">Chương</span>
                    <h3 className="mt-0.5 text-base font-extrabold text-slate-900">{chapter}</h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700">{chapterLessons.length} buổi học</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {chapterLessons.map((lesson) => (
                    <article key={lesson.id} className="space-y-3 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h4 className="text-base font-extrabold text-slate-900">{lesson.title}</h4>
                        <span className="text-xs text-slate-400">{new Date(lesson.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{lesson.content}</p>
                      {lesson.summary && <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950"><strong>Tóm tắt:</strong><p className="mt-1 whitespace-pre-wrap">{lesson.summary}</p></div>}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-slate-400">Giáo viên: {lesson.teacherName}</p>
                        {lesson.attachment && (
                          <a href={lesson.attachment.dataUrl} download={lesson.attachment.name} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100">
                            <FileText size={15} /> {lesson.attachment.name} <Download size={14} />
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </section>
        </>
      )}
    </div>
  );
};
