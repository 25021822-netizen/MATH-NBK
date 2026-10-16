export type UserRole = 'student' | 'teacher' | 'admin';
export type AccountTier = 'free' | 'premium';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tier: AccountTier;
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  dailyScanCount: number;
  maxDailyScans: number;
  grade: 10 | 11 | 12;
  avatar?: string;
  schoolName?: string;
  phone?: string;
  bio?: string;
  subject?: string;
}

export type MathTopic = 
  | 'algebra' 
  | 'geometry_plane' 
  | 'geometry_spatial' 
  | 'trigonometry' 
  | 'calculus' 
  | 'arithmetic_probability';

export interface SkillNode {
  id: string;
  grade: 10 | 11 | 12;
  topic: MathTopic;
  title: string;
  description: string;
  level: number;
  totalSteps: number;
  completedSteps: number;
  isLocked: boolean;
  xpReward: number;
  prerequisiteId?: string;
  coordinates: { x: number; y: number };
}

export type ExamPartType = 
  | 'part_1_mcq' 
  | 'part_2_true_false' 
  | 'part_3_short_answer';

export interface QuestionPart1MCQ {
  id: string;
  part: 'part_1_mcq';
  questionNumber: number;
  prompt: string;
  latex?: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
    latex?: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  points: number;
  imageAttachment?: string; // Dán/cắt file ảnh minh họa hoặc đề bài
  pdfAttachmentName?: string; // Tên file tài liệu / hình vẽ đính kèm
  pdfAttachmentUrl?: string;
}

export interface QuestionPart2TrueFalseItem {
  id: string;
  subKey: 'a' | 'b' | 'c' | 'd';
  text: string;
  latex?: string;
  isCorrect: boolean; // Giá trị chân lý đúng của mệnh đề
}

export interface QuestionPart2TrueFalse {
  id: string;
  part: 'part_2_true_false';
  questionNumber: number;
  prompt: string;
  latex?: string;
  items: QuestionPart2TrueFalseItem[]; // 4 ý độc lập a, b, c, d
  explanation: string;
  points: number; // Tối đa 1.0 điểm theo quy tắc lũy tiến 0.1 -> 0.25 -> 0.5 -> 1.0
  imageAttachment?: string;
  pdfAttachmentName?: string;
  pdfAttachmentUrl?: string;
}

export interface QuestionPart3ShortAnswer {
  id: string;
  part: 'part_3_short_answer';
  questionNumber: number;
  prompt: string;
  latex?: string;
  correctAnswer: string; // Tối đa 4 ký tự/chữ số, hỗ trợ -, ,, /
  explanation: string;
  points: number;
  imageAttachment?: string;
  pdfAttachmentName?: string;
  pdfAttachmentUrl?: string;
}

// Chỉ gồm 3 phần thi trắc nghiệm khách quan chuẩn BGD (đã loại bỏ hoàn toàn tự luận)
export type Question = 
  | QuestionPart1MCQ 
  | QuestionPart2TrueFalse 
  | QuestionPart3ShortAnswer;

export interface Exam {
  id: string;
  title: string;
  grade: 10 | 11 | 12;
  year: number;
  durationMinutes: number;
  totalPoints: number;
  status: 'draft' | 'approved' | 'archived';
  createdBy: string;
  createdAt: string;
  questions: Question[];
  // Tính năng mới cho giáo viên
  maxAttempts?: number; // Giới hạn số lượt làm bài (1, 2, 3... hoặc 0/undefined là không giới hạn)
  openTime?: string; // Thời gian mở đề thi (YYYY-MM-DDTHH:mm)
  closeTime?: string; // Thời gian đóng đề thi (YYYY-MM-DDTHH:mm)
  distributionType?: 'classroom' | 'repository' | 'both'; // Giao cho nhóm lớp hoặc đưa vào kho tổng hợp
  targetClassIds?: string[]; // Danh sách nhóm lớp được giao đề
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  startTime: string;
  endTime?: string;
  answers: Record<string, any>;
  score?: number;
  partScores?: {
    part1: number;
    part2: number;
    part3: number;
    part4: number;
  };
  infractionCount: number;
  isDisqualified: boolean;
  status: 'in_progress' | 'submitted' | 'disqualified';
}

export interface CheatLog {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  timestamp: string;
  infractionNumber: number;
  event: 'app_state_blur' | 'visibility_hidden' | 'window_unfocus' | 'screen_capture';
  reason: string;
  actionTaken: 'warning_1' | 'warning_2' | 'auto_submitted_disqualified';
}

export interface SocraticMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  latex?: string;
  graphHint?: {
    equation: string;
    rangeX?: [number, number];
    label?: string;
  };
  hintsRemaining?: number;
  timestamp: string;
}

export interface ScanResult {
  problemText: string;
  latexFormula: string;
  topic: MathTopic;
  difficulty: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  stepByStepSolution: {
    stepNumber: number;
    title: string;
    description: string;
    latex: string;
  }[];
  finalAnswer: string;
  source: 'cache' | 'gemini_vision';
  processingTimeMs: number;
}

export interface Classroom {
  id: string;
  name: string;
  code: string;
  grade: 10 | 11 | 12;
  teacherId: string;
  teacherName: string;
  studentIds: string[];
  assignedExamIds: string[];
  createdAt: string;
  description?: string;
}

export interface ClassroomLesson {
  id: string;
  classId: string;
  title: string;
  chapter: string; // Chuyên đề / Chương bài học
  description: string;
  content: string; // Tóm tắt kiến thức, định lý, công thức LaTeX
  teacherName: string;
  createdAt: string;
  attachments?: {
    name: string;
    type: 'pdf' | 'image' | 'link';
    url: string;
    size?: string;
  }[];
  exercisesCount?: number;
  completedStudentIds?: string[];
}

export interface StudentExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  classId: string;
  submittedAt: string;
  score: number;
  partScores: {
    part1: number;
    part2: number;
    part3: number;
    part4?: number;
  };
  answers: Record<string, any>;
  infractionCount: number;
  isDisqualified: boolean;
  timeSpentSeconds: number;
}

// ==========================================
// CHAT TRONG NHÓM LỚP (GỬI ẢNH & TAG TÊN)
// ==========================================
export interface ChatMention {
  userId: string;
  userName: string;
}

export interface ClassroomChatMessage {
  id: string;
  classId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  content: string;
  imageUrl?: string;
  mentions?: ChatMention[];
  timestamp: string;
}

// ==========================================
// HỆ THỐNG KẾT BẠN QUA ID
// (GV - GV, HS - HS, GV - HS)
// ==========================================
export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserRole: UserRole;
  fromUserEmail: string;
  fromUserAvatar?: string;
  toUserId: string;
  toUserName?: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface FriendRelation {
  id: string;
  userId1: string;
  userId2: string;
  friendedAt: string;
}
