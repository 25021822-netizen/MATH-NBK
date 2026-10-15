-- ====================================================================
-- HỆ THỐNG CƠ SỞ DỮ LIỆU TOÀN DIỆN CHO ỨNG DỤNG "Math&NBK"
-- Nền tảng: PostgreSQL 15+ / Supabase với Row Level Security (RLS)
-- ====================================================================

-- 1. KHỞI TẠO CÁC KIỂU ENUM DỮ LIỆU
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE account_tier AS ENUM ('free', 'premium');
CREATE TYPE math_topic AS ENUM (
  'algebra', 
  'geometry_plane', 
  'geometry_spatial', 
  'trigonometry', 
  'calculus', 
  'arithmetic_probability'
);
CREATE TYPE exam_part_type AS ENUM (
  'part_1_mcq', 
  'part_2_true_false', 
  'part_3_short_answer', 
  'part_4_essay'
);
CREATE TYPE exam_status AS ENUM ('draft', 'approved', 'archived');
CREATE TYPE cheat_event_type AS ENUM (
  'app_state_blur', 
  'visibility_hidden', 
  'window_unfocus', 
  'screen_capture'
);

-- 2. BẢNG HỒ SƠ NGƯỜI DÙNG & PHÂN QUYỀN RBAC (PROFILES)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  tier account_tier NOT NULL DEFAULT 'free',
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  streak_days INTEGER NOT NULL DEFAULT 1 CHECK (streak_days >= 0),
  last_active_date DATE NOT NULL DEFAULT CURRENT_DATE,
  daily_scan_count INTEGER NOT NULL DEFAULT 0 CHECK (daily_scan_count >= 0),
  max_daily_scans INTEGER NOT NULL DEFAULT 10,
  grade SMALLINT NOT NULL DEFAULT 12 CHECK (grade IN (10, 11, 12)),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. BẢNG CHƯƠNG TRÌNH HỌC (CURRICULUMS)
CREATE TABLE curriculums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade SMALLINT NOT NULL CHECK (grade IN (10, 11, 12)),
  topic math_topic NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BẢNG BÀI HỌC CÂY KỸ NĂNG DUOLINGO (LESSONS)
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id UUID NOT NULL REFERENCES curriculums(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  total_steps INTEGER NOT NULL DEFAULT 5,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  prerequisite_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  coordinates_x INTEGER NOT NULL DEFAULT 0,
  coordinates_y INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BẢNG TIẾN ĐỘ HỌC TẬP (USER_LESSON_PROGRESS)
CREATE TABLE user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_steps INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 6. BẢNG ĐỀ THI (EXAMS)
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  grade SMALLINT NOT NULL CHECK (grade IN (10, 11, 12)),
  year SMALLINT NOT NULL DEFAULT 2025,
  duration_minutes INTEGER NOT NULL DEFAULT 90 CHECK (duration_minutes > 0),
  total_points NUMERIC(4, 2) NOT NULL DEFAULT 10.00,
  status exam_status NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. BẢNG CÂU HỎI THI 4 PHẦN CHUẨN BGD (QUESTIONS)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  part exam_part_type NOT NULL,
  question_number INTEGER NOT NULL CHECK (question_number > 0),
  prompt TEXT NOT NULL,
  latex TEXT,
  -- Dữ liệu lựa chọn A, B, C, D (cho Phần 1)
  options JSONB,
  -- Dữ liệu 4 ý Đúng/Sai a, b, c, d (cho Phần 2)
  true_false_items JSONB,
  -- Đáp án chuẩn (Phần 1: 'A'|'B'|'C'|'D', Phần 3: chuỗi <= 4 ký tự, Phần 4: phân số/số thực)
  correct_answer TEXT NOT NULL,
  accepted_variants JSONB DEFAULT '[]'::JSONB,
  explanation TEXT DEFAULT '',
  points NUMERIC(3, 2) NOT NULL DEFAULT 0.25,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. BẢNG KẾT QUẢ BÀI THI (EXAM_RESULTS)
CREATE TABLE exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  answers JSONB NOT NULL DEFAULT '{}'::JSONB,
  total_score NUMERIC(4, 2) DEFAULT 0.00,
  part_scores JSONB DEFAULT '{"part1": 0, "part2": 0, "part3": 0, "part4": 0}'::JSONB,
  infraction_count INTEGER NOT NULL DEFAULT 0,
  is_disqualified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. BẢNG LỊCH SỬ CHAT GIA SƯ SOCRATIC (CHAT_HISTORY)
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  latex TEXT,
  graph_hint JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. BẢNG NHẬT KÝ CHỐNG GIAN LẬN (CHEAT_LOGS)
CREATE TABLE cheat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  infraction_number SMALLINT NOT NULL CHECK (infraction_number BETWEEN 1 AND 3),
  event_type cheat_event_type NOT NULL,
  reason TEXT NOT NULL,
  action_taken TEXT NOT NULL
);

-- ====================================================================
-- CHỈ MỤC TỐI ƯU HÓA HIỆU NĂNG TRUY VẤN (INDEXES)
-- ====================================================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_xp_streak ON profiles(xp DESC, streak_days DESC);
CREATE INDEX idx_lessons_curriculum ON lessons(curriculum_id, level);
CREATE INDEX idx_questions_exam_part ON questions(exam_id, part, question_number);
CREATE INDEX idx_exam_results_student ON exam_results(student_id, exam_id);
CREATE INDEX idx_cheat_logs_exam_student ON cheat_logs(exam_id, student_id);
CREATE INDEX idx_chat_history_user_session ON chat_history(user_id, session_id);

-- ====================================================================
-- CHÍNH SÁCH BẢO MẬT HÀNG (ROW LEVEL SECURITY - RLS)
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Người dùng đọc và cập nhật hồ sơ cá nhân; Admin toàn quyền
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Exams: Mọi người đọc được đề đã duyệt ('approved'); Giáo viên/Admin quản lý đề
CREATE POLICY "Anyone can view approved exams" ON exams
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Teachers can manage exams" ON exams
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin'))
  );

-- 3. Exam Results & Cheat Logs: Học sinh xem kết quả của mình, Giáo viên & Admin xem tất cả
CREATE POLICY "Students can view own exam results" ON exam_results
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view all exam results" ON exam_results
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin'))
  );

CREATE POLICY "System and Teachers can view cheat logs" ON cheat_logs
  FOR SELECT USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin'))
  );
