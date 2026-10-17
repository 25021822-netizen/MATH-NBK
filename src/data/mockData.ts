import {
  UserProfile,
  SkillNode,
  Exam,
  ScanResult,
  CheatLog,
  Classroom,
  ClassroomLesson,
  StudentExamSubmission,
  ClassroomChatMessage,
  FriendRequest,
  FriendRelation,
  SocraticMessage,
} from '../types/math';

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'usr_student_01',
  name: 'Nguyễn Văn An',
  email: 'an.nguyen@thpt-nbk.edu.vn',
  role: 'student',
  tier: 'free',
  xp: 1450,
  streakDays: 7,
  lastActiveDate: new Date().toISOString().split('T')[0],
  dailyScanCount: 2,
  maxDailyScans: 10,
  grade: 12,
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AnNguyen',
  schoolName: 'THPT Chuyên Nguyễn Bỉnh Khiêm',
  phone: '0912 345 678',
  bio: 'Học sinh lớp 12 chuyên Toán, định hướng thi khối A00 và kỳ thi Đánh giá Năng lực.',
  subject: 'Toán Học THPT',
};

export const SAMPLE_SKILL_TREES: Record<10 | 11 | 12, SkillNode[]> = {
  12: [
    {
      id: 'g12_1',
      grade: 12,
      topic: 'calculus',
      title: 'Tính đơn điệu của hàm số',
      description: 'Quy tắc xét dấu đạo hàm f\'(x), các khoảng đồng biến nghịch biến.',
      level: 1,
      totalSteps: 5,
      completedSteps: 5,
      isLocked: false,
      xpReward: 50,
      coordinates: { x: 0, y: 0 },
    },
    {
      id: 'g12_2',
      grade: 12,
      topic: 'calculus',
      title: 'Cực trị của hàm số',
      description: 'Điều kiện cấp 1 và cấp 2, tìm tọa độ cực đại cực tiểu.',
      level: 2,
      totalSteps: 5,
      completedSteps: 3,
      isLocked: false,
      xpReward: 60,
      prerequisiteId: 'g12_1',
      coordinates: { x: 30, y: 1 },
    },
    {
      id: 'g12_3',
      grade: 12,
      topic: 'calculus',
      title: 'Giá trị lớn nhất & nhỏ nhất',
      description: 'Tìm GTLN, GTNN trên đoạn [a; b] và khoảng vô hạn.',
      level: 3,
      totalSteps: 4,
      completedSteps: 0,
      isLocked: false,
      xpReward: 70,
      prerequisiteId: 'g12_2',
      coordinates: { x: -25, y: 2 },
    },
    {
      id: 'g12_4',
      grade: 12,
      topic: 'calculus',
      title: 'Đường tiệm cận đồ thị',
      description: 'Tiệm cận đứng, tiệm cận ngang và tiệm cận xiên hàm phân thức.',
      level: 4,
      totalSteps: 5,
      completedSteps: 0,
      isLocked: true,
      xpReward: 80,
      prerequisiteId: 'g12_3',
      coordinates: { x: 20, y: 3 },
    },
    {
      id: 'g12_5',
      grade: 12,
      topic: 'geometry_spatial',
      title: 'Hệ tọa độ Oxyz trong không gian',
      description: 'Tọa độ vectơ, tích có hướng và khoảng cách điểm đến mặt phẳng.',
      level: 5,
      totalSteps: 6,
      completedSteps: 0,
      isLocked: true,
      xpReward: 100,
      prerequisiteId: 'g12_4',
      coordinates: { x: 0, y: 4 },
    },
  ],
  11: [
    {
      id: 'g11_1',
      grade: 11,
      topic: 'trigonometry',
      title: 'Hàm số lượng giác cơ bản',
      description: 'Tập xác định, chu kỳ và đồ thị y = sin x, y = cos x.',
      level: 1,
      totalSteps: 4,
      completedSteps: 4,
      isLocked: false,
      xpReward: 50,
      coordinates: { x: 0, y: 0 },
    },
    {
      id: 'g11_2',
      grade: 11,
      topic: 'trigonometry',
      title: 'Phương trình lượng giác',
      description: 'Giải các dạng sin x = m, cos x = m và phương trình bậc 2.',
      level: 2,
      totalSteps: 5,
      completedSteps: 2,
      isLocked: false,
      xpReward: 60,
      coordinates: { x: 25, y: 1 },
    },
    {
      id: 'g11_3',
      grade: 11,
      topic: 'geometry_spatial',
      title: 'Quan hệ vuông góc trong không gian',
      description: 'Đường thẳng vuông góc mặt phẳng, góc giữa hai mặt phẳng.',
      level: 3,
      totalSteps: 5,
      completedSteps: 0,
      isLocked: true,
      xpReward: 80,
      coordinates: { x: -20, y: 2 },
    },
  ],
  10: [
    {
      id: 'g10_1',
      grade: 10,
      topic: 'algebra',
      title: 'Mệnh đề và Tập hợp',
      description: 'Mệnh đề kéo theo, tương đương và các phép toán tập hợp.',
      level: 1,
      totalSteps: 4,
      completedSteps: 4,
      isLocked: false,
      xpReward: 50,
      coordinates: { x: 0, y: 0 },
    },
    {
      id: 'g10_2',
      grade: 10,
      topic: 'algebra',
      title: 'Bất phương trình bậc hai một ẩn',
      description: 'Định lý dấu tam thức bậc hai và ứng dụng giải bài toán thực tế.',
      level: 2,
      totalSteps: 5,
      completedSteps: 1,
      isLocked: false,
      xpReward: 60,
      coordinates: { x: 30, y: 1 },
    },
    {
      id: 'g10_3',
      grade: 10,
      topic: 'trigonometry',
      title: 'Hệ thức lượng trong tam giác',
      description: 'Định lý sin, định lý cosin và công thức tính diện tích Heron.',
      level: 3,
      totalSteps: 4,
      completedSteps: 0,
      isLocked: true,
      xpReward: 70,
      coordinates: { x: -15, y: 2 },
    },
  ],
};

export const SAMPLE_OCR_PROBLEMS: {
  id: string;
  title: string;
  category: string;
  imagePreviewText: string;
  latex: string;
  difficulty: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  solution: ScanResult;
}[] = [
  {
    id: 'sample_1',
    title: 'Tích phân từng phần',
    category: 'Giải tích 12',
    imagePreviewText: '∫ [0 → π/2] x · sin(x) dx',
    latex: '\\int_{0}^{\\frac{\\pi}{2}} x \\sin(x) \\, dx',
    difficulty: 'Thông hiểu',
    solution: {
      problemText: 'Tính tích phân xác định: I = ∫_0^(π/2) x sin(x) dx',
      latexFormula: '\\int_{0}^{\\frac{\\pi}{2}} x \\sin(x) \\, dx',
      topic: 'calculus',
      difficulty: 'Thông hiểu',
      stepByStepSolution: [
        {
          stepNumber: 1,
          title: 'Đặt biến tích phân từng phần',
          description: 'Sử dụng quy tắc ưu tiên Lôgarit - Đa thức - Lượng giác - Mũ.',
          latex: 'u = x \\implies du = dx; \\quad dv = \\sin(x)dx \\implies v = -\\cos(x)',
        },
        {
          stepNumber: 2,
          title: 'Áp dụng công thức I = u·v - ∫ v du',
          description: 'Thay các đại lượng đã tính vào biểu thức tích phân từng phần.',
          latex: 'I = \\left[ -x \\cos(x) \\right]_0^{\\frac{\\pi}{2}} - \\int_0^{\\frac{\\pi}{2}} (-\\cos(x)) dx',
        },
        {
          stepNumber: 3,
          title: 'Thế cận và tính tích phân còn lại',
          description: 'Vì cos(π/2) = 0 và cos(0) = 1 nên hạng tử đầu bằng 0.',
          latex: 'I = 0 + \\left[ \\sin(x) \\right]_0^{\\frac{\\pi}{2}} = \\sin\\left(\\frac{\\pi}{2}\\right) - \\sin(0) = 1',
        },
      ],
      finalAnswer: 'I = 1',
      source: 'cache',
      processingTimeMs: 42,
    },
  },
  {
    id: 'sample_2',
    title: 'Cực trị hàm phân thức bậc 2 trên bậc 1',
    category: 'Đại số & Giải tích 12',
    imagePreviewText: 'y = (x² - 2x + 2) / (x - 1)',
    latex: 'y = \\frac{x^2 - 2x + 2}{x - 1}',
    difficulty: 'Vận dụng',
    solution: {
      problemText: 'Tìm điểm cực trị của đồ thị hàm số y = (x² - 2x + 2) / (x - 1)',
      latexFormula: 'y = \\frac{x^2 - 2x + 2}{x - 1}',
      topic: 'calculus',
      difficulty: 'Vận dụng',
      stepByStepSolution: [
        {
          stepNumber: 1,
          title: 'Tập xác định & tính đạo hàm y\'',
          description: 'Điều kiện xác định x ≠ 1. Áp dụng công thức (u/v)\' = (u\'v - uv\') / v².',
          latex: 'y\' = \\frac{(2x - 2)(x - 1) - (x^2 - 2x + 2)}{(x - 1)^2} = \\frac{x^2 - 2x}{(x - 1)^2}',
        },
        {
          stepNumber: 2,
          title: 'Giải phương trình đạo hàm y\' = 0',
          description: 'Tử thức x² - 2x = 0 cho hai nghiệm phân biệt.',
          latex: 'y\' = 0 \\iff x(x - 2) = 0 \\iff \\begin{cases} x = 0 \\implies y = -2 \\\\ x = 2 \\implies y = 2 \\end{cases}',
        },
        {
          stepNumber: 3,
          title: 'Lập bảng xét dấu & kết luận',
          description: 'Qua x = 0 đạo hàm đổi dấu từ + sang - (cực đại), qua x = 2 đạo hàm đổi dấu từ - sang + (cực tiểu).',
          latex: 'A(0; -2) \\text{ là điểm cực đại}, \\quad B(2; 2) \\text{ là điểm cực tiểu}',
        },
      ],
      finalAnswer: 'Điểm CĐ: (0; -2), Điểm CT: (2; 2)',
      source: 'gemini_vision',
      processingTimeMs: 1420,
    },
  },
  {
    id: 'sample_3',
    title: 'Khoảng cách điểm đến mặt phẳng (Oxyz)',
    category: 'Hình học không gian Oxyz',
    imagePreviewText: 'd(M, (P)) với M(1; 2; -1), (P): 2x - 2y + z + 5 = 0',
    latex: 'd(M, (P)) = \\frac{|2(1) - 2(2) + (-1) + 5|}{\\sqrt{2^2 + (-2)^2 + 1^2}}',
    difficulty: 'Thông hiểu',
    solution: {
      problemText: 'Trong không gian Oxyz, tính khoảng cách từ điểm M(1; 2; -1) đến mặt phẳng (P): 2x - 2y + z + 5 = 0.',
      latexFormula: 'd(M, (P)) = \\frac{|Ax_M + By_M + Cz_M + D|}{\\sqrt{A^2 + B^2 + C^2}}',
      topic: 'geometry_spatial',
      difficulty: 'Thông hiểu',
      stepByStepSolution: [
        {
          stepNumber: 1,
          title: 'Nhận dạng tọa độ điểm và hệ số mặt phẳng',
          description: 'M(1; 2; -1), mặt phẳng (P) có pháp tuyến n = (2; -2; 1) và D = 5.',
          latex: 'A = 2, B = -2, C = 1, D = 5',
        },
        {
          stepNumber: 2,
          title: 'Thay vào công thức khoảng cách',
          description: 'Tính tử số (trị tuyệt đối) và mẫu số (độ dài vectơ pháp tuyến).',
          latex: 'd(M, (P)) = \\frac{|2 \\cdot 1 - 2 \\cdot 2 + 1 \\cdot (-1) + 5|}{\\sqrt{2^2 + (-2)^2 + 1^2}} = \\frac{|2 - 4 - 1 + 5|}{\\sqrt{4 + 4 + 1}}',
        },
        {
          stepNumber: 3,
          title: 'Rút gọn kết quả',
          description: 'Tử số là |2| = 2, mẫu số là căn bậc hai của 9 = 3.',
          latex: 'd(M, (P)) = \\frac{2}{3}',
        },
      ],
      finalAnswer: 'd(M, (P)) = 2/3',
      source: 'cache',
      processingTimeMs: 35,
    },
  },
];

export const SAMPLE_SCAN_RESULTS: ScanResult[] = SAMPLE_OCR_PROBLEMS.map((p) => p.solution);

export const SAMPLE_SOCRATIC_MESSAGES: SocraticMessage[] = [
  {
    id: 'm1',
    role: 'assistant',
    content:
      'Xin chào bạn! Mình là Gia sư Socratic của Math&NBK. Theo phương pháp vấn đáp Socratic, mình sẽ không giải hộ bài toán, mà sẽ đặt câu hỏi dẫn dắt để giúp bạn tự khám phá bản chất kiến thức.',
    timestamp: '08:30',
  },
  {
    id: 'm2',
    role: 'user',
    content: 'Làm thế nào để tìm cực trị của hàm số y = x³ - 3x + 1 vậy thầy?',
    timestamp: '08:31',
  },
  {
    id: 'm3',
    role: 'assistant',
    content:
      'Để tìm cực trị của một hàm số đa thức, chúng ta hãy nhớ lại định lý dấu đạo hàm. Đầu tiên, bạn hãy tính đạo hàm f\'(x) xem bằng bao nhiêu nhé?',
    latex: "y' = (x^3 - 3x + 1)' = ?",
    graphHint: {
      equation: 'y = x^3 - 3x + 1',
      label: 'Đồ thị minh họa hàm số bậc ba có 2 cực trị',
    },
    timestamp: '08:31',
  },
];

export const SAMPLE_EXAM_BGD: Exam = {
  id: 'exam_bgd_2025_01',
  title: 'Đề Thi Thử Tốt Nghiệp THPT 2025 - Môn Toán (Mã Đề 101)',
  grade: 12,
  year: 2025,
  durationMinutes: 90,
  totalPoints: 10,
  status: 'approved',
  createdBy: 'ThS. Trần Văn Minh - Tổ Toán THPT Chuyên',
  createdAt: '2026-03-15T08:00:00Z',
  maxAttempts: 2, // Giới hạn tối đa 2 lượt làm bài
  openTime: '2026-03-01T07:00', // Thời gian mở đề
  closeTime: '2026-12-31T23:59', // Thời gian đóng đề
  distributionType: 'both', // Giao cho cả nhóm lớp và kho đề tổng hợp
  targetClassIds: ['cls_12a1', 'cls_12a2'],
  questions: [
    // PHẦN I: TRẮC NGHIỆM 4 PHƯƠNG ÁN (1.5 điểm mỗi câu)
    {
      id: 'q1',
      part: 'part_1_mcq',
      questionNumber: 1,
      prompt: 'Cho hàm số y = f(x) có đạo hàm f\'(x) = x(x - 1)²(x + 2). Số điểm cực trị của hàm số đã cho là:',
      latex: 'f\'(x) = x(x - 1)^2(x + 2)',
      options: [
        { key: 'A', text: '1 điểm' },
        { key: 'B', text: '2 điểm' },
        { key: 'C', text: '3 điểm' },
        { key: 'D', text: '4 điểm' },
      ],
      correctAnswer: 'B',
      explanation: 'Đạo hàm đổi dấu khi qua nghiệm bội lẻ x = 0 và x = -2. Nghiệm x = 1 là nghiệm bội chẵn nên không đổi dấu. Vậy có 2 điểm cực trị.',
      points: 1.5,
    },
    {
      id: 'q2',
      part: 'part_1_mcq',
      questionNumber: 2,
      prompt: 'Họ nguyên hàm của hàm số f(x) = e^(2x) + 3x² là:',
      latex: '\\int (e^{2x} + 3x^2) \\, dx',
      options: [
        { key: 'A', text: '2e^(2x) + 6x + C' },
        { key: 'B', text: '(1/2)e^(2x) + x³ + C' },
        { key: 'C', text: 'e^(2x) + x³ + C' },
        { key: 'D', text: '(1/2)e^(2x) + 6x + C' },
      ],
      correctAnswer: 'B',
      explanation: 'Áp dụng công thức nguyên hàm cơ bản: ∫ e^(ax) dx = (1/a)e^(ax) + C và ∫ x² dx = x³/3 + C.',
      points: 1.5,
    },

    // PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI 4 Ý (Tối đa 4.0 điểm)
    {
      id: 'q3',
      part: 'part_2_true_false',
      questionNumber: 3,
      prompt: 'Cho hàm số phân thức hữu tỉ y = (x² - 2x + 2) / (x - 1). Xét tính Đúng/Sai của các mệnh đề sau:',
      latex: 'y = \\frac{x^2 - 2x + 2}{x - 1}',
      imageAttachment: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
      items: [
        {
          id: 'q3_a',
          subKey: 'a',
          text: 'Tập xác định của hàm số là D = ℝ \\ {1}.',
          latex: 'D = \\mathbb{R} \\setminus \\{1\\}',
          isCorrect: true,
        },
        {
          id: 'q3_b',
          subKey: 'b',
          text: 'Đạo hàm của hàm số là y\' = (x² - 2x) / (x - 1)².',
          latex: 'y\' = \\frac{x^2 - 2x}{(x - 1)^2}',
          isCorrect: true,
        },
        {
          id: 'q3_c',
          subKey: 'c',
          text: 'Hàm số đồng biến trên toàn bộ tập xác định D.',
          isCorrect: false,
        },
        {
          id: 'q3_d',
          subKey: 'd',
          text: 'Đồ thị hàm số có đường tiệm cận xiên là y = x - 1.',
          latex: 'y = x - 1',
          isCorrect: true,
        },
      ],
      explanation: 'Ta có y = x - 1 + 1/(x-1). Khi x -> ±∞ thì 1/(x-1) -> 0 => tiệm cận xiên y = x - 1 (Đúng). Đạo hàm y\' > 0 khi x < 0 hoặc x > 2, nên không đồng biến trên toàn D (Sai).',
      points: 4.0,
    },

    // PHẦN III: CÂU TRẢ LỜI NGẮN (Tối đa 4 ký tự/chữ số) (1.5 điểm mỗi câu)
    {
      id: 'q4',
      part: 'part_3_short_answer',
      questionNumber: 4,
      prompt: 'Tìm giá trị nhỏ nhất của hàm số f(x) = x + 4/x trên khoảng (0; +∞).',
      latex: 'f(x) = x + \\frac{4}{x}, \\quad x > 0',
      correctAnswer: '4',
      explanation: 'Áp dụng bất đẳng thức Cô-si (AM-GM) cho hai số dương x và 4/x: x + 4/x ≥ 2√(x · 4/x) = 4. Dấu "=" xảy ra khi x = 4/x ⇔ x = 2 > 0.',
      points: 1.5,
    },
    {
      id: 'q5',
      part: 'part_3_short_answer',
      questionNumber: 5,
      prompt: 'Cho khối lăng trụ có diện tích đáy B = 6a² và chiều cao h = 3a. Thể tích V của khối lăng trụ bằng k·a³. Hãy điền giá trị của k:',
      latex: 'V = B \\cdot h',
      correctAnswer: '18',
      explanation: 'V = B · h = 6a² · 3a = 18a³ => k = 18.',
      points: 1.5,
      pdfAttachmentName: 'Chuyen_De_Hinh_Lang_Tru.pdf',
    },
  ],
};

export const SAMPLE_CHEAT_LOGS: CheatLog[] = [
  {
    id: 'cl_101',
    examId: 'exam_bgd_2025_01',
    examTitle: 'Đề Thi Thử Tốt Nghiệp THPT 2025 - Mã 101',
    studentId: 'usr_student_02',
    studentName: 'Trần Hoàng Long (12A1)',
    timestamp: '2026-10-15T08:12:44Z',
    infractionNumber: 1,
    event: 'window_unfocus',
    reason: 'Chuyển tab sang trình duyệt khác hoặc nhấn Alt+Tab',
    actionTaken: 'warning_1',
  },
  {
    id: 'cl_102',
    examId: 'exam_bgd_2025_01',
    examTitle: 'Đề Thi Thử Tốt Nghiệp THPT 2025 - Mã 101',
    studentId: 'usr_student_02',
    studentName: 'Trần Hoàng Long (12A1)',
    timestamp: '2026-10-15T08:14:10Z',
    infractionNumber: 2,
    event: 'visibility_hidden',
    reason: 'Rời ứng dụng kiểm tra trong 15 giây',
    actionTaken: 'warning_2',
  },
  {
    id: 'cl_103',
    examId: 'exam_bgd_2025_01',
    examTitle: 'Đề Thi Thử Tốt Nghiệp THPT 2025 - Mã 101',
    studentId: 'usr_student_03',
    studentName: 'Lê Thùy Dung (12D2)',
    timestamp: '2026-10-15T07:45:20Z',
    infractionNumber: 3,
    event: 'app_state_blur',
    reason: 'Vi phạm quy chế 3 lần: Thoát màn hình bài thi',
    actionTaken: 'auto_submitted_disqualified',
  },
];

export const SAMPLE_STUDENTS: UserProfile[] = [
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
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AnNguyen',
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
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=HoangLong',
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
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ThuyDung',
  },
  {
    id: 'usr_student_04',
    name: 'Phạm Minh Đức',
    email: 'duc.pham@thpt-nbk.edu.vn',
    role: 'student',
    tier: 'free',
    xp: 1820,
    streakDays: 9,
    lastActiveDate: '2026-10-14',
    dailyScanCount: 3,
    maxDailyScans: 10,
    grade: 12,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MinhDuc',
  },
  {
    id: 'usr_student_05',
    name: 'Hoàng Khánh Linh',
    email: 'linh.hoang@thpt-nbk.edu.vn',
    role: 'student',
    tier: 'premium',
    xp: 2900,
    streakDays: 18,
    lastActiveDate: '2026-10-15',
    dailyScanCount: 6,
    maxDailyScans: 9999,
    grade: 12,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=KhanhLinh',
  },
  {
    id: 'usr_student_06',
    name: 'Vũ Thanh Tùng',
    email: 'tung.vu@thpt-nbk.edu.vn',
    role: 'student',
    tier: 'free',
    xp: 1120,
    streakDays: 4,
    lastActiveDate: '2026-10-13',
    dailyScanCount: 1,
    maxDailyScans: 10,
    grade: 11,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ThanhTung',
  },
  {
    id: 'usr_student_07',
    name: 'Đỗ Phương Thảo',
    email: 'thao.do@thpt-nbk.edu.vn',
    role: 'student',
    tier: 'free',
    xp: 980,
    streakDays: 5,
    lastActiveDate: '2026-10-12',
    dailyScanCount: 2,
    maxDailyScans: 10,
    grade: 10,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PhuongThao',
  },
];

export const SAMPLE_CLASSROOMS: Classroom[] = [
  {
    id: 'cls_12a1',
    name: 'Lớp 12A1 Chuyên Toán (Năm học 2025-2026)',
    code: 'NBK-12A1',
    grade: 12,
    teacherId: 'usr_teacher_01',
    teacherName: 'ThS. Trần Văn Minh',
    studentIds: ['usr_student_01', 'usr_student_02', 'usr_student_03', 'usr_student_04', 'usr_student_05'],
    assignedExamIds: ['exam_bgd_2025_01'],
    createdAt: '2026-09-05',
    description: 'Lớp chuyên Toán 12, luyện thi Tốt nghiệp THPT Quốc Gia và Đánh giá Năng lực ĐHQG.',
  },
  {
    id: 'cls_11b2',
    name: 'Lớp 11B2 Ôn Thi Học Sinh Giỏi Cấp Tỉnh',
    code: 'NBK-11B2',
    grade: 11,
    teacherId: 'usr_teacher_01',
    teacherName: 'ThS. Trần Văn Minh',
    studentIds: ['usr_student_06'],
    assignedExamIds: ['exam_bgd_2025_01'],
    createdAt: '2026-09-10',
    description: 'Bồi dưỡng chuyên sâu các chuyên đề Lượng giác, Hình học không gian và Giới hạn dãy số.',
  },
];

export const SAMPLE_SUBMISSIONS: StudentExamSubmission[] = [
  {
    id: 'sub_01',
    examId: 'exam_bgd_2025_01',
    examTitle: 'Đề Thi Thử Tốt Nghiệp THPT 2025 - Mã 101',
    studentId: 'usr_student_01',
    studentName: 'Nguyễn Văn An',
    studentEmail: 'an.nguyen@thpt-nbk.edu.vn',
    classId: 'cls_12a1',
    submittedAt: '2026-10-14T09:30:00Z',
    score: 9.50,
    partScores: { part1: 3.0, part2: 3.5, part3: 3.0 },
    answers: { q1: 'B', q2: 'B', q3_a: true, q3_b: true, q3_c: false, q3_d: true, q4: '4', q5: '18' },
    infractionCount: 0,
    isDisqualified: false,
    timeSpentSeconds: 4850,
  },
  {
    id: 'sub_02',
    examId: 'exam_bgd_2025_01',
    examTitle: 'Đề Thi Thử Tốt Nghiệp THPT 2025 - Mã 101',
    studentId: 'usr_student_03',
    studentName: 'Lê Thùy Dung',
    studentEmail: 'dung.le@thpt-nbk.edu.vn',
    classId: 'cls_12a1',
    submittedAt: '2026-10-14T10:15:00Z',
    score: 8.50,
    partScores: { part1: 3.0, part2: 2.5, part3: 3.0 },
    answers: { q1: 'B', q2: 'B', q3_a: true, q3_b: true, q3_c: true, q3_d: true, q4: '4', q5: '18' },
    infractionCount: 0,
    isDisqualified: false,
    timeSpentSeconds: 5120,
  },
  {
    id: 'sub_03',
    examId: 'exam_bgd_2025_01',
    examTitle: 'Đề Thi Thử Tốt Nghiệp THPT 2025 - Mã 101',
    studentId: 'usr_student_05',
    studentName: 'Hoàng Khánh Linh',
    studentEmail: 'linh.hoang@thpt-nbk.edu.vn',
    classId: 'cls_12a1',
    submittedAt: '2026-10-14T11:00:00Z',
    score: 8.00,
    partScores: { part1: 3.0, part2: 3.5, part3: 1.5 },
    answers: { q1: 'B', q2: 'B', q3_a: true, q3_b: true, q3_c: false, q3_d: true, q4: '4', q5: '12' },
    infractionCount: 0,
    isDisqualified: false,
    timeSpentSeconds: 4900,
  },
  {
    id: 'sub_04',
    examId: 'exam_bgd_2025_01',
    examTitle: 'Đề Thi Thử Tốt Nghiệp THPT 2025 - Mã 101',
    studentId: 'usr_student_02',
    studentName: 'Trần Hoàng Long',
    studentEmail: 'long.tran@thpt-nbk.edu.vn',
    classId: 'cls_12a1',
    submittedAt: '2026-10-15T08:14:00Z',
    score: 7.00,
    partScores: { part1: 1.5, part2: 2.5, part3: 3.0 },
    answers: { q1: 'A', q2: 'B', q3_a: true, q3_b: false, q3_c: false, q3_d: false, q4: '4', q5: '18' },
    infractionCount: 2,
    isDisqualified: false,
    timeSpentSeconds: 4200,
  },
  {
    id: 'sub_05',
    examId: 'exam_bgd_2025_01',
    examTitle: 'Đề Thi Thử Tốt Nghiệp THPT 2025 - Mã 101',
    studentId: 'usr_student_04',
    studentName: 'Phạm Minh Đức',
    studentEmail: 'duc.pham@thpt-nbk.edu.vn',
    classId: 'cls_12a1',
    submittedAt: '2026-10-13T14:20:00Z',
    score: 5.50,
    partScores: { part1: 1.5, part2: 2.5, part3: 1.5 },
    answers: { q1: 'C', q2: 'B', q3_a: true, q3_b: false, q3_c: false, q3_d: false, q4: '4', q5: '10' },
    infractionCount: 0,
    isDisqualified: false,
    timeSpentSeconds: 5300,
  },
];

// ==========================================
// DANH SÁCH GIÁO VIÊN & TẤT CẢ NGƯỜI DÙNG HỆ THỐNG
// ==========================================
export const SAMPLE_TEACHERS: UserProfile[] = [
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
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TeacherMinh',
  },
  {
    id: 'usr_teacher_02',
    name: 'Cô Nguyễn Thị Mai Hoa',
    email: 'hoa.nguyen@thpt-nbk.edu.vn',
    role: 'teacher',
    tier: 'premium',
    xp: 6400,
    streakDays: 30,
    lastActiveDate: '2026-10-14',
    dailyScanCount: 0,
    maxDailyScans: 9999,
    grade: 11,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TeacherHoa',
  },
  {
    id: 'usr_teacher_03',
    name: 'Thầy Lê Quốc Dũng',
    email: 'dung.le@thpt-nbk.edu.vn',
    role: 'teacher',
    tier: 'premium',
    xp: 7200,
    streakDays: 38,
    lastActiveDate: '2026-10-15',
    dailyScanCount: 0,
    maxDailyScans: 9999,
    grade: 10,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TeacherDung',
  },
];

export const SAMPLE_ADMIN: UserProfile = {
  id: 'usr_admin_01',
  name: 'Ban Giám Hiệu - Quản Trị Hệ Thống',
  email: 'admin@thpt-nbk.edu.vn',
  role: 'admin',
  tier: 'premium',
  xp: 15000,
  streakDays: 120,
  lastActiveDate: '2026-10-15',
  dailyScanCount: 0,
  maxDailyScans: 9999,
  grade: 12,
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminNBK',
};

// Tổng hợp người dùng hệ thống (chỉ admin có quyền tạo mới tài khoản cho giáo viên và học sinh)
export const INITIAL_ALL_USERS: UserProfile[] = [
  SAMPLE_ADMIN,
  ...SAMPLE_TEACHERS,
  ...SAMPLE_STUDENTS,
];

// ==========================================
// MẪU TIN NHẮN CHAT TRONG NHÓM LỚP (GỬI ẢNH, TAG TÊN)
// ==========================================
export const INITIAL_CLASSROOM_MESSAGES: Record<string, ClassroomChatMessage[]> = {
  cls_12a1: [
    {
      id: 'msg_01',
      classId: 'cls_12a1',
      senderId: 'usr_teacher_01',
      senderName: 'ThS. Trần Văn Minh',
      senderRole: 'teacher',
      senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TeacherMinh',
      content: 'Chào cả lớp 12A1! Thầy vừa giao đề thi thử tốt nghiệp THPT 2025 mã 101. Các em lưu ý hạn chót làm bài là 22h tối nay nhé!',
      timestamp: '2026-10-14T08:00:00Z',
    },
    {
      id: 'msg_02',
      classId: 'cls_12a1',
      senderId: 'usr_student_01',
      senderName: 'Nguyễn Văn An',
      senderRole: 'student',
      senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AnNguyen',
      content: 'Dạ vâng ạ! @ThS. Trần Văn Minh thầy ơi câu 6 phần trả lời ngắn bài toán thực tế bể nước có phải dùng công thức V = B.h không ạ?',
      mentions: [
        { userId: 'usr_teacher_01', userName: 'ThS. Trần Văn Minh' }
      ],
      timestamp: '2026-10-14T08:15:00Z',
    },
    {
      id: 'msg_03',
      classId: 'cls_12a1',
      senderId: 'usr_teacher_01',
      senderName: 'ThS. Trần Văn Minh',
      senderRole: 'teacher',
      senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TeacherMinh',
      content: '@Nguyễn Văn An Đúng rồi em nhé, em xem sơ đồ thầy vẽ minh họa mặt cắt không gian dưới này:',
      imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
      mentions: [
        { userId: 'usr_student_01', userName: 'Nguyễn Văn An' }
      ],
      timestamp: '2026-10-14T08:20:00Z',
    },
    {
      id: 'msg_04',
      classId: 'cls_12a1',
      senderId: 'usr_student_03',
      senderName: 'Lê Thùy Dung',
      senderRole: 'student',
      senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ThuyDung',
      content: '@Nguyễn Văn An @Trần Hoàng Long lát 2 cậu ôn lại phần tiệm cận xiên không, mình vừa giải xong đề 101 được 8.75 nè!',
      mentions: [
        { userId: 'usr_student_01', userName: 'Nguyễn Văn An' },
        { userId: 'usr_student_02', userName: 'Trần Hoàng Long' }
      ],
      timestamp: '2026-10-14T10:30:00Z',
    },
  ],
  cls_11b2: [
    {
      id: 'msg_11_01',
      classId: 'cls_11b2',
      senderId: 'usr_teacher_01',
      senderName: 'ThS. Trần Văn Minh',
      senderRole: 'teacher',
      senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TeacherMinh',
      content: 'Chào các bạn đội tuyển Toán 11! Hôm nay chúng ta tập trung chuyên đề phương trình lượng giác nâng cao nhé.',
      timestamp: '2026-10-13T14:00:00Z',
    },
  ],
};

// ==========================================
// MẪU KẾT BẠN QUA ID
// GV - GV, HS - HS, GV - HS
// ==========================================
export const INITIAL_FRIEND_RELATIONS: FriendRelation[] = [
  // 1. HS kết bạn với HS (Nguyễn Văn An <-> Lê Thùy Dung)
  {
    id: 'fr_01',
    userId1: 'usr_student_01',
    userId2: 'usr_student_03',
    friendedAt: '2026-09-15',
  },
  // 2. HS kết bạn với HS (Nguyễn Văn An <-> Trần Hoàng Long)
  {
    id: 'fr_02',
    userId1: 'usr_student_01',
    userId2: 'usr_student_02',
    friendedAt: '2026-09-18',
  },
  // 3. GV kết bạn với HS (ThS. Trần Văn Minh <-> Nguyễn Văn An)
  {
    id: 'fr_03',
    userId1: 'usr_teacher_01',
    userId2: 'usr_student_01',
    friendedAt: '2026-09-10',
  },
  // 4. GV kết bạn với GV (ThS. Trần Văn Minh <-> Cô Nguyễn Thị Mai Hoa)
  {
    id: 'fr_04',
    userId1: 'usr_teacher_01',
    userId2: 'usr_teacher_02',
    friendedAt: '2026-08-20',
  },
  // 5. GV kết bạn với GV (ThS. Trần Văn Minh <-> Thầy Lê Quốc Dũng)
  {
    id: 'fr_05',
    userId1: 'usr_teacher_01',
    userId2: 'usr_teacher_03',
    friendedAt: '2026-08-22',
  },
];

export const INITIAL_FRIEND_REQUESTS: FriendRequest[] = [
  // Lời mời gửi đến usr_student_01 từ học sinh khác
  {
    id: 'freq_01',
    fromUserId: 'usr_student_05',
    fromUserName: 'Hoàng Khánh Linh',
    fromUserRole: 'student',
    fromUserEmail: 'linh.hoang@thpt-nbk.edu.vn',
    fromUserAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=KhanhLinh',
    toUserId: 'usr_student_01',
    toUserName: 'Nguyễn Văn An',
    timestamp: '2026-10-15T07:30:00Z',
    status: 'pending',
  },
  // Lời mời kết bạn từ giáo viên khác gửi đến ThS. Trần Văn Minh (GV kết bạn GV)
  {
    id: 'freq_02',
    fromUserId: 'usr_teacher_03',
    fromUserName: 'Thầy Lê Quốc Dũng',
    fromUserRole: 'teacher',
    fromUserEmail: 'dung.le@thpt-nbk.edu.vn',
    fromUserAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TeacherDung',
    toUserId: 'usr_student_01',
    toUserName: 'Nguyễn Văn An',
    timestamp: '2026-10-14T16:00:00Z',
    status: 'pending',
  },
];

// ==========================================
// MẪU BÀI HỌC VÀ CHUYÊN ĐỀ THEO NHÓM LỚP
// ==========================================
export const SAMPLE_CLASSROOM_LESSONS: ClassroomLesson[] = [
  {
    id: 'les_01',
    classId: 'cls_12a1',
    title: 'Chuyên đề 1: Cực trị hàm số chứa dấu giá trị tuyệt đối',
    chapter: 'Chương 1: Ứng dụng đạo hàm khảo sát hàm số',
    description: 'Phương pháp đếm nhanh số điểm cực trị của hàm $g(x) = |f(x)|$ và $g(x) = f(|x|)$.',
    theoryContent: `### 1. Định lý và Công thức trọng tâm:
- Cho hàm số $y = f(x)$ có đạo hàm liên tục trên $\\mathbb{R}$.
- Số điểm cực trị của hàm số $y = |f(x)|$ bằng $m + n$, trong đó:
  + $m$: số điểm cực trị của hàm số $y = f(x)$ ban đầu (nghiệm bội lẻ của $f'(x) = 0$).
  + $n$: số nghiệm đơn hoặc nghiệm bội lẻ của phương trình $f(x) = 0$.
- Quy tắc suy đồ thị $y = |f(x)|$:
  + Giữ nguyên phần đồ thị hàm số $y = f(x)$ nằm phía trên trục hoành $Ox$.
  + Lấy đối xứng phần đồ thị nằm phía dưới trục hoành qua trục $Ox$, sau đó bỏ phần đồ thị phía dưới.

### 2. Dạng hàm $y = f(|x|)$:
- Là hàm số chẵn, đồ thị nhận trục tung $Oy$ làm trục đối xứng.
- Số điểm cực trị bằng $2k + 1$, trong đó $k$ là số điểm cực trị dương của hàm số $y = f(x)$.`,
    exercisesContent: `### 1. Bài tập ví dụ mẫu minh họa:
**Ví dụ 1:** Cho hàm số bậc ba $f(x) = x^3 - 3x^2 + 2$. Tìm số điểm cực trị của hàm số $g(x) = |f(x)|$.
*Lời giải:*
- Đạo hàm $f'(x) = 3x^2 - 6x = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$. Suy ra $f(x)$ có $m = 2$ điểm cực trị.
- Xét phương trình $f(x) = 0 \\Leftrightarrow x^3 - 3x^2 + 2 = 0 \\Leftrightarrow (x - 1)(x^2 - 2x - 2) = 0$.
  Phương trình có 3 nghiệm phân biệt $x = 1, x = 1 \\pm \\sqrt{3}$ (đều là nghiệm đơn, $n = 3$).
- Vậy số điểm cực trị của hàm $g(x) = |f(x)|$ là $m + n = 2 + 3 = 5$.

**Ví dụ 2:** Cho hàm số $y = f(x)$ có bảng biến thiên với 2 điểm cực trị dương $x_1 = 1, x_2 = 4$. Hỏi hàm số $y = f(|x|)$ có bao nhiêu điểm cực trị?
*Lời giải:* Do $k = 2$ điểm cực trị dương nên hàm số $y = f(|x|)$ có $2k + 1 = 2(2) + 1 = 5$ điểm cực trị.

### 2. Bài tập tự luyện rèn luyện:
- Bài 1: Cho hàm số $f(x) = x^4 - 4x^2 + 3$. Đếm số cực trị của hàm số $y = |f(x)|$.
- Bài 2: Tìm $m$ để hàm số $y = |x^3 - 3x + m|$ có đúng 3 điểm cực trị.
- Bài 3: Cho hàm số $f(x)$ có đồ thị như hình vẽ. Xác định số điểm cực trị của $g(x) = f(|x| + 1)$.`,
    content: 'Xem chi tiết ở tab Lý thuyết và Bài tập bài giảng.',
    teacherName: 'ThS. Trần Văn Minh',
    createdAt: '2026-10-10',
    externalLink: 'https://drive.google.com/file/d/1A_xY9SampleMathDriveLink12A1/view',
    pdfAttachment: {
      fileName: 'ChuyenDe1_CucTri_TriTuyetDoi_12A1.pdf',
      fileSize: '3.4 MB',
      fileData: '#',
    },
    attachments: [
      {
        name: 'ChuyenDe1_CucTri_TriTuyetDoi_12A1.pdf',
        type: 'pdf',
        url: '#',
        size: '3.4 MB',
      },
    ],
    exercisesCount: 15,
    completedStudentIds: ['usr_student_01', 'usr_student_03'],
  },
  {
    id: 'les_02',
    classId: 'cls_12a1',
    title: 'Chuyên đề 2: Tọa độ hóa Oxyz giải bài toán khoảng cách và góc',
    chapter: 'Chương 2: Phương pháp tọa độ trong không gian',
    description: 'Kỹ thuật gắn hệ trục tọa độ Oxyz vào khối đa diện (chóp, lăng trụ) để giải quyết bài toán tính khoảng cách điểm đến mặt phẳng.',
    theoryContent: `### 1. Phương pháp tọa độ hóa hình không gian:
- Chọn gốc tọa độ $O$: Thường chọn đỉnh có 3 đường đôi một vuông góc (tam diện vuông) hoặc chân đường cao của hình chóp/lăng trụ.
- Chọn 3 tia vuông góc làm các trục $Ox, Oy, Oz$.
- Xác định tọa độ các đỉnh chính của khối đa diện dựa vào kích thước hình học bài toán cho.

### 2. Các công thức tọa độ trọng tâm:
- Vectơ pháp tuyến mặt phẳng $(P)$ qua 3 điểm $A, B, C$: $\\vec{n} = [\\vec{AB}, \\vec{AC}]$.
- Khoảng cách từ điểm $M(x_0, y_0, z_0)$ đến mặt phẳng $(P): Ax + By + Cz + D = 0$:
  $$d(M, (P)) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}$$
- Góc giữa đường thẳng $d$ có VTCP $\\vec{u}$ và mặt phẳng $(P)$ có VTPT $\\vec{n}$:
  $$\\sin(d, (P)) = \\frac{|\\vec{u} \\cdot \\vec{n}|}{|\\vec{u}| \\cdot |\\vec{n}|}$$`,
    exercisesContent: `### 1. Bài tập ví dụ mẫu:
**Ví dụ 1:** Cho hình chóp $S.ABC$ có đáy $ABC$ vuông tại $B, AB = a, BC = a\\sqrt{3}$. Cạnh bên $SA \\perp (ABC)$ và $SA = 2a$. Tính khoảng cách từ $A$ đến mặt phẳng $(SBC)$.
*Lời giải tọa độ hóa:*
- Chọn gốc $B(0,0,0)$, trục $BA$ nằm trên tia $Ox \\Rightarrow A(a, 0, 0)$, trục $BC$ trên tia $Oy \\Rightarrow C(0, a\\sqrt{3}, 0)$.
- Trục $Oz$ qua $B$ song song $SA$. Do $A(a,0,0)$ nên $S(a, 0, 2a)$.
- Vectơ $\\vec{BC} = (0, a\\sqrt{3}, 0), \\vec{BS} = (a, 0, 2a)$.
- VTPT của $(SBC)$ là $\\vec{n} = [\\vec{BC}, \\vec{BS}] = (2a^2\\sqrt{3}, 0, -a^2\\sqrt{3})$. Rút gọn $\\vec{n}_0 = (2, 0, -1)$.
- Phương trình $(SBC)$ qua $B(0,0,0)$: $2x - z = 0$.
- Khoảng cách $d(A, (SBC)) = \\frac{|2(a) - 0|}{\\sqrt{2^2 + (-1)^2}} = \\frac{2a}{\\sqrt{5}} = \\frac{2a\\sqrt{5}}{5}$.

### 2. Bài tập tự luyện:
- Bài 1: Cho hình lập phương $ABCD.A'B'C'D'$ cạnh $a$. Tính góc giữa $AC'$ và mặt phẳng $(A'BD)$.
- Bài 2: Cho lăng trụ đứng $ABC.A'B'C'$ có đáy là tam giác đều cạnh $a$, $AA' = a\\sqrt{2}$. Tính khoảng cách giữa hai đường thẳng chéo nhau $AB'$ và $BC'$.`,
    content: 'Xem chi tiết ở tab Lý thuyết và Bài tập bài giảng.',
    teacherName: 'ThS. Trần Văn Minh',
    createdAt: '2026-10-12',
    externalLink: 'https://youtu.be/sampleMathVideoOxyzLecture12',
    pdfAttachment: {
      fileName: 'KyThuat_ToaDoHoa_Oxyz_12A1.pdf',
      fileSize: '4.1 MB',
      fileData: '#',
    },
    attachments: [
      {
        name: 'KyThuat_ToaDoHoa_Oxyz_12A1.pdf',
        type: 'pdf',
        url: '#',
        size: '4.1 MB',
      },
    ],
    exercisesCount: 12,
    completedStudentIds: ['usr_student_01'],
  },
  {
    id: 'les_03',
    classId: 'cls_11b2',
    title: 'Chuyên đề 1: Phương trình lượng giác biến đổi về bậc hai',
    chapter: 'Chương 1: Hàm số và phương trình lượng giác',
    description: 'Các dạng phương trình lượng giác đưa về dạng thuần nhất bậc hai hoặc đặt ẩn phụ $t = \\sin x \\pm \\cos x$.',
    theoryContent: `### Phương pháp đặt ẩn phụ đối xứng:
- Dạng phương trình: $a(\\sin x \\pm \\cos x) + b\\sin x \\cos x + c = 0$.
- Đặt $t = \\sin x + \\cos x = \\sqrt{2}\\sin(x + \\frac{\\pi}{4})$. Điều kiện $|t| \\le \\sqrt{2}$.
- Ta có $t^2 = 1 + 2\\sin x\\cos x \\Rightarrow \\sin x\\cos x = \\frac{t^2 - 1}{2}$.
- Thay vào phương trình ban đầu ta được phương trình bậc hai theo $t$:
  $$at + b\\frac{t^2-1}{2} + c = 0$$
- Giải tìm nghiệm $t \\in [-\\sqrt{2}; \\sqrt{2}]$, từ đó suy ra nghiệm $x$.`,
    exercisesContent: `### 1. Bài tập ví dụ mẫu:
**Ví dụ 1:** Giải phương trình $\\sin x + \\cos x - 2\\sin x\\cos x - 1 = 0$.
*Lời giải:*
- Đặt $t = \\sin x + \\cos x, |t| \\le \\sqrt{2}$. Phương trình trở thành:
  $t - (t^2 - 1) - 1 = 0 \\Leftrightarrow -t^2 + t = 0 \\Leftrightarrow t = 0$ (nhận) hoặc $t = 1$ (nhận).
- Với $t = 0 \\Leftrightarrow \\sqrt{2}\\sin(x + \\pi/4) = 0 \\Leftrightarrow x = -\\pi/4 + k\\pi$.
- Với $t = 1 \\Leftrightarrow \\sqrt{2}\\sin(x + \\pi/4) = 1 \\Leftrightarrow \\sin(x + \\pi/4) = \\frac{\\sqrt{2}}{2} \\Rightarrow x = k2\\pi$ hoặc $x = \\pi/2 + k2\\pi$.

### 2. Bài tập tự luyện:
- Bài 1: Giải phương trình $2(\\sin x - \\cos x) + 3\\sin 2x = 2$.
- Bài 2: Tìm $m$ để phương trình $\\sin 2x - 2\\sqrt{2}(\\sin x + \\cos x) + 2m - 1 = 0$ có nghiệm.`,
    content: 'Xem chi tiết ở tab Lý thuyết và Bài tập bài giảng.',
    teacherName: 'ThS. Trần Văn Minh',
    createdAt: '2026-10-11',
    externalLink: 'https://drive.google.com/drive/folders/sampleLuongGiac11',
    pdfAttachment: {
      fileName: 'LuongGiac_11B2_ChuyenDe.pdf',
      fileSize: '2.8 MB',
      fileData: '#',
    },
    attachments: [
      {
        name: 'LuongGiac_11B2_ChuyenDe.pdf',
        type: 'pdf',
        url: '#',
        size: '2.8 MB',
      },
    ],
    exercisesCount: 10,
    completedStudentIds: [],
  },
];
