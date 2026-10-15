import React, { useState } from 'react';
import { UserProfile, UserRole, FriendRelation, FriendRequest } from '../../types/math';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Copy,
  Check,
  X,
  Shield,
  GraduationCap,
  Sparkles,
  Clock,
  ArrowRight,
  Send,
  MessageCircle,
} from 'lucide-react';

interface FriendsModalViewProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  friendRelations: FriendRelation[];
  friendRequests: FriendRequest[];
  onSendFriendRequest: (toUserId: string) => { success: boolean; message: string };
  onAcceptFriendRequest: (requestId: string) => void;
  onDeclineFriendRequest: (requestId: string) => void;
  onCancelFriendRequest: (requestId: string) => void;
  onRemoveFriend: (friendUserId: string) => void;
  onOpenClassroomChat?: () => void;
}

export const FriendsModalView: React.FC<FriendsModalViewProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  friendRelations,
  friendRequests,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onCancelFriendRequest,
  onRemoveFriend,
  onOpenClassroomChat,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'add_by_id' | 'requests'>('friends');
  const [friendFilter, setFriendFilter] = useState<'all' | 'teacher' | 'student'>('all');
  const [searchFriendName, setSearchFriendName] = useState('');

  // Tab Add by ID states
  const [targetUserIdInput, setTargetUserIdInput] = useState('');
  const [idFeedbackMessage, setIdFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [hasCopiedOwnId, setHasCopiedOwnId] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<UserProfile | null>(null);

  if (!isOpen) return null;

  // Lấy danh sách ID bạn bè của currentUser
  const myFriendIds = friendRelations
    .filter((rel) => rel.userId1 === currentUser.id || rel.userId2 === currentUser.id)
    .map((rel) => (rel.userId1 === currentUser.id ? rel.userId2 : rel.userId1));

  // Lấy UserProfile của bạn bè
  const myFriends = allUsers.filter((u) => myFriendIds.includes(u.id));

  // Lọc bạn bè theo vai trò và tên
  const filteredFriends = myFriends.filter((f) => {
    const matchesFilter = friendFilter === 'all' || f.role === friendFilter;
    const matchesName = f.name.toLowerCase().includes(searchFriendName.toLowerCase()) ||
      f.id.toLowerCase().includes(searchFriendName.toLowerCase()) ||
      f.email.toLowerCase().includes(searchFriendName.toLowerCase());
    return matchesFilter && matchesName;
  });

  // Lời mời đã nhận (incoming)
  const incomingRequests = friendRequests.filter(
    (req) => req.toUserId === currentUser.id && req.status === 'pending'
  );

  // Lời mời đã gửi (outgoing)
  const outgoingRequests = friendRequests.filter(
    (req) => req.fromUserId === currentUser.id && req.status === 'pending'
  );

  // Kiểm tra user được tìm kiếm qua ID
  const normalizedSearchId = targetUserIdInput.trim();
  const foundTargetUser = allUsers.find(
    (u) => u.id.toLowerCase() === normalizedSearchId.toLowerCase()
  );

  const handleCopyOwnId = () => {
    navigator.clipboard.writeText(currentUser.id);
    setHasCopiedOwnId(true);
    setTimeout(() => setHasCopiedOwnId(false), 2500);
  };

  const handleSendRequestSubmit = () => {
    if (!normalizedSearchId) return;
    const result = onSendFriendRequest(normalizedSearchId);
    setIdFeedbackMessage({
      text: result.message,
      type: result.success ? 'success' : 'error',
    });
    if (result.success) {
      setTargetUserIdInput('');
    }
  };

  // Xác định cặp vai trò kết bạn
  const getFriendshipTypeLabel = (role1: UserRole, role2: UserRole) => {
    if (role1 === 'teacher' && role2 === 'teacher') {
      return { label: 'Đồng nghiệp (GV ↔ GV)', badgeClass: 'bg-purple-100 text-purple-700' };
    }
    if (role1 === 'student' && role2 === 'student') {
      return { label: 'Bạn đồng học (HS ↔ HS)', badgeClass: 'bg-blue-100 text-blue-700' };
    }
    return { label: 'Thầy trò (GV ↔ HS)', badgeClass: 'bg-emerald-100 text-emerald-700' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck size={22} />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-slate-900 leading-tight">
                Mạng Lưới Bạn Bè & Kết Bạn Qua ID
              </h2>
              <p className="text-xs text-slate-500">
                Hỗ trợ Giáo viên ↔ Giáo viên, Học sinh ↔ Học sinh và Giáo viên ↔ Học sinh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Thẻ định danh cá nhân (Own ID Card) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-blue-200 overflow-hidden flex items-center justify-center font-bold text-blue-600 shadow-xs">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900">{currentUser.name}</span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    currentUser.role === 'teacher'
                      ? 'bg-purple-100 text-purple-700'
                      : currentUser.role === 'admin'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {currentUser.role === 'teacher' ? 'Giáo viên' : currentUser.role === 'admin' ? 'Quản trị' : `Học sinh Lớp ${currentUser.grade}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                <span>Mã ID của bạn:</span>
                <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200 text-xs">
                  {currentUser.id}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCopyOwnId}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap ${
              hasCopiedOwnId
                ? 'bg-emerald-600 text-white'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
            }`}
          >
            {hasCopiedOwnId ? <Check size={14} /> : <Copy size={14} />}
            <span>{hasCopiedOwnId ? 'Đã sao chép ID!' : 'Sao chép ID của bạn'}</span>
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'friends' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={15} />
            <span>Bạn Bè Của Tôi ({myFriends.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add_by_id')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'add_by_id' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus size={15} />
            <span>Kết Bạn Qua ID</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 relative ${
              activeTab === 'requests' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock size={15} />
            <span>Lời Mời Kết Bạn</span>
            {incomingRequests.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                {incomingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* ========================================================= */}
          {/* TAB 1: DANH SÁCH BẠN BÈ HIỆN TẠI                          */}
          {/* ========================================================= */}
          {activeTab === 'friends' && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setFriendFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      friendFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Tất cả ({myFriends.length})
                  </button>
                  <button
                    onClick={() => setFriendFilter('teacher')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      friendFilter === 'teacher' ? 'bg-white text-purple-700 font-bold shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Thầy Cô ({myFriends.filter((f) => f.role === 'teacher').length})
                  </button>
                  <button
                    onClick={() => setFriendFilter('student')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      friendFilter === 'student' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Học Sinh ({myFriends.filter((f) => f.role === 'student').length})
                  </button>
                </div>

                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchFriendName}
                    onChange={(e) => setSearchFriendName(e.target.value)}
                    placeholder="Tìm tên hoặc ID bạn bè..."
                    className="h-9 pl-8 pr-3 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:outline-none w-full sm:w-48"
                  />
                </div>
              </div>

              {/* Friend list */}
              {filteredFriends.length > 0 ? (
                <div className="space-y-2.5">
                  {filteredFriends.map((friend) => {
                    const relationType = getFriendshipTypeLabel(currentUser.role, friend.role);
                    return (
                      <div
                        key={friend.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-11 h-11 rounded-xl bg-blue-100 overflow-hidden flex items-center justify-center font-bold text-blue-700 text-sm">
                              {friend.avatar ? (
                                <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                              ) : (
                                friend.name.charAt(0)
                              )}
                            </div>
                            <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900">{friend.name}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${relationType.badgeClass}`}
                              >
                                {friend.role === 'teacher' ? 'Giáo viên' : `Lớp ${friend.grade}`}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              ID: <strong className="text-slate-600">{friend.id}</strong> · {friend.email}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {onOpenClassroomChat && (
                            <button
                              onClick={() => {
                                onClose();
                                onOpenClassroomChat();
                              }}
                              title="Nhắn tin trong nhóm lớp"
                              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                            >
                              <MessageCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => setFriendToRemove(friend)}
                            title="Hủy kết bạn"
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <UserX size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <Users size={38} className="mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-sm text-slate-700">Chưa tìm thấy bạn bè nào</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Chuyển sang tab <strong>"Kết Bạn Qua ID"</strong> để kết nối cùng thầy cô và bạn học.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: KẾT BẠN QUA ID                                      */}
          {/* ========================================================= */}
          {activeTab === 'add_by_id' && (
            <div className="space-y-5">
              {/* Feature Introduction */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1.5">
                <div className="flex items-center gap-2 font-extrabold text-blue-950">
                  <Sparkles size={16} className="text-blue-600" />
                  <span>Cơ Chế Kết Bạn Toàn Diện (3 Chiều)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="bg-white/80 p-2 rounded-xl border border-blue-200 font-semibold text-[11px]">
                    👨‍🏫 <strong>GV ↔ GV:</strong> Giáo viên kết bạn chia sẻ giáo án, đề thi.
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-blue-200 font-semibold text-[11px]">
                    🎓 <strong>HS ↔ HS:</strong> Học sinh kết bạn lập nhóm cùng tiến.
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-blue-200 font-semibold text-[11px]">
                    🤝 <strong>GV ↔ HS:</strong> Thầy cô và học trò kết nối kèm cặp.
                  </div>
                </div>
              </div>

              {/* ID Input Form */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Nhập Mã ID Người Dùng Cần Kết Bạn:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={targetUserIdInput}
                      onChange={(e) => {
                        setTargetUserIdInput(e.target.value);
                        setIdFeedbackMessage(null);
                      }}
                      placeholder="Ví dụ: usr_teacher_01, usr_student_02, ..."
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-mono text-xs font-bold focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleSendRequestSubmit}
                    disabled={!normalizedSearchId}
                    className="px-5 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs whitespace-nowrap transition-colors"
                  >
                    <Send size={15} />
                    <span>Gửi Lời Mời</span>
                  </button>
                </div>

                {/* Quick suggestions to test easily */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="text-slate-400 font-semibold">Gợi ý ID mẫu để thử nghiệm:</span>
                  {allUsers
                    .filter((u) => u.id !== currentUser.id && !myFriendIds.includes(u.id))
                    .slice(0, 4)
                    .map((sampleUser) => (
                      <button
                        key={sampleUser.id}
                        type="button"
                        onClick={() => {
                          setTargetUserIdInput(sampleUser.id);
                          setIdFeedbackMessage(null);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-mono text-[11px] border border-slate-200 transition-colors"
                      >
                        {sampleUser.id} ({sampleUser.role === 'teacher' ? 'GV' : 'HS'})
                      </button>
                    ))}
                </div>
              </div>

              {/* Feedback Alert */}
              {idFeedbackMessage && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-bold animate-in fade-in duration-200 ${
                    idFeedbackMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : idFeedbackMessage.type === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}
                >
                  {idFeedbackMessage.text}
                </div>
              )}

              {/* Live Preview Card of Searched User */}
              {foundTargetUser && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Thông tin tài khoản tìm thấy:
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 overflow-hidden flex items-center justify-center font-bold text-blue-700 text-base">
                        {foundTargetUser.avatar ? (
                          <img src={foundTargetUser.avatar} alt={foundTargetUser.name} className="w-full h-full object-cover" />
                        ) : (
                          foundTargetUser.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{foundTargetUser.name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              foundTargetUser.role === 'teacher'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {foundTargetUser.role === 'teacher' ? 'Giáo viên Toán' : `Học sinh Lớp ${foundTargetUser.grade}`}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          ID: <strong className="text-slate-800">{foundTargetUser.id}</strong> · {foundTargetUser.email}
                        </div>
                      </div>
                    </div>

                    <div>
                      {myFriendIds.includes(foundTargetUser.id) ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                          <Check size={14} />
                          <span>Đã là bạn bè</span>
                        </span>
                      ) : foundTargetUser.id === currentUser.id ? (
                        <span className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-600 font-bold text-xs">
                          Tài khoản của bạn
                        </span>
                      ) : outgoingRequests.some((r) => r.toUserId === foundTargetUser.id) ? (
                        <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs">
                          Đã gửi lời mời
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-[11px]">
                          Sẵn sàng kết bạn
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: LỜI MỜI KẾT BẠN (INCOMING & OUTGOING)              */}
          {/* ========================================================= */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              {/* Lời mời đã nhận */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Lời Mời Đã Nhận ({incomingRequests.length})</span>
                  <span className="text-slate-400 font-normal">Cần bạn chấp thuận</span>
                </h4>

                {incomingRequests.length > 0 ? (
                  <div className="space-y-2">
                    {incomingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-blue-200 overflow-hidden flex items-center justify-center font-bold text-blue-700">
                            {req.fromUserAvatar ? (
                              <img src={req.fromUserAvatar} alt={req.fromUserName} className="w-full h-full object-cover" />
                            ) : (
                              req.fromUserName.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{req.fromUserName}</span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  req.fromUserRole === 'teacher'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {req.fromUserRole === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono">
                              ID: {req.fromUserId} · {new Date(req.timestamp).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onDeclineFriendRequest(req.id)}
                            className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 font-bold text-xs"
                          >
                            Từ Chối
                          </button>
                          <button
                            onClick={() => onAcceptFriendRequest(req.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                          >
                            <Check size={14} />
                            <span>Đồng Ý</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    Hiện không có lời mời kết bạn nào đang chờ.
                  </p>
                )}
              </div>

              {/* Lời mời đã gửi */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                  Lời Mời Đã Gửi Đi ({outgoingRequests.length})
                </h4>

                {outgoingRequests.length > 0 ? (
                  <div className="space-y-2">
                    {outgoingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800">
                            Gửi đến: <span className="font-mono text-blue-600 font-bold">{req.toUserId}</span>
                            {req.toUserName && <span className="ml-1 text-slate-700">({req.toUserName})</span>}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(req.timestamp).toLocaleDateString('vi-VN')} · Đang đợi phản hồi
                          </span>
                        </div>
                        <button
                          onClick={() => onCancelFriendRequest(req.id)}
                          className="px-3 py-1 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs"
                        >
                          Thu Hồi
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-2">
                    Bạn chưa gửi lời mời kết bạn nào.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Quyền riêng tư: Mã ID được cấp phát chính thống theo hồ sơ THPT NBK</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Confirmation Modal: Hủy kết bạn */}
      {friendToRemove && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <UserX size={24} />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900">Hủy Kết Bạn?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Bạn có chắc chắn muốn hủy kết bạn với <strong className="text-slate-800">{friendToRemove.name}</strong> ({friendToRemove.id}) không?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setFriendToRemove(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Giữ Lại
              </button>
              <button
                onClick={() => {
                  onRemoveFriend(friendToRemove.id);
                  setFriendToRemove(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
              >
                Hủy Kết Bạn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
