/**
 * Hướng Dẫn Cấu Trúc Dự Án Clean Architecture cho Ứng Dụng React Native "Math&NBK"
 */

export const CLEAN_ARCHITECTURE_DIRECTORY_TREE = `
math-nbk-mobile/
├── App.tsx                     # Điểm khởi tạo ứng dụng (Navigation Container, Providers)
├── app.json                    # Cấu hình Expo, Camera & Media Library permissions
├── babel.config.js             # Cấu hình NativeWind Tailwind CSS
├── tailwind.config.js          # Hệ thống Design Tokens & bảng màu học thuật
├── tsconfig.json               # Cấu hình TypeScript với Path Aliases (@domain, @data, @presentation)
└── src/
    ├── core/                   # Các tiện ích cốt lõi dùng chung toàn ứng dụng
    │   ├── constants/          # Bảng mã lỗi, hằng số quota, quy chế thi BGD
    │   ├── errors/             # Custom Error Classes (AppError, NetworkError, QuotaExceededError)
    │   ├── theme/              # Bảng màu, typography, khoảng cách, dark/light tokens
    │   └── utils/              # ScoringEngine, formatters, LaTeX parser, hashing
    │
    ├── domain/                 # TẦNG NGHIỆP VỤ CỐT LÕI (Do not depend on external frameworks)
    │   ├── entities/           # Models thuần túy: User, Lesson, Exam, Question, CheatLog
    │   ├── repositories/       # Hợp đồng Interface: IAuthRepository, IExamRepository, IAISolverRepository
    │   └── usecases/           # Các luồng nghiệp vụ độc lập:
    │       ├── ScanMathProblemUseCase.ts
    │       ├── AskSocraticTutorUseCase.ts
    │       ├── GradeExamSubmissionUseCase.ts
    │       ├── TrackAntiCheatViolationUseCase.ts
    │       └── ParseExamFromPDFUseCase.ts
    │
    ├── data/                   # TẦNG DỮ LIỆU & BỘ ĐỆM (Implementations of domain contracts)
    │   ├── datasources/
    │   │   ├── remote/         # Supabase client, Gemini API Server Proxy client
    │   │   └── local/          # MMKV / AsyncStorage cho Auto-Save draft và Offline Cache
    │   ├── cache/              # ProblemHashCache (Tối ưu hóa chi phí AI Vision)
    │   ├── dtos/               # Data Transfer Objects & Zod Schemas
    │   ├── mappers/            # Chuyển đổi DTO <-> Domain Entity
    │   └── repositories/       # Cài đặt cụ thể: ExamRepositoryImpl, AISolverRepositoryImpl
    │
    ├── infrastructure/         # TẦNG HẠ TẦNG & THIẾT BỊ NGOẠI VI
    │   ├── camera/             # Expo Camera adapter & Image Manipulator (nén ảnh trước khi OCR)
    │   ├── sound/              # Haptic feedback & âm thanh tương tác bài học
    │   └── storage/            # Quản lý khóa an toàn SecureStore
    │
    └── presentation/           # TẦNG GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (React Native UI)
        ├── components/
        │   ├── common/         # Button, Card, Header, Modal, Badge, LoadingSkeleton
        │   ├── math/           # KaTeX MathView, Interactive Function Grapher
        │   └── exam/           # TimerBar, AntiCheatWarningModal, DraftIndicator
        ├── hooks/              # useAntiCheatTracker, useCountdownTimer, useAutoSaveDraft
        ├── navigation/         # BottomTabNavigator, RootStackNavigator, AuthNavigator
        └── screens/            # 5 Màn hình nghiệp vụ chính:
            ├── HomeScreen.tsx           # Bản đồ Duolingo Skill Tree, Streak, XP
            ├── ScannerScreen.tsx        # Camera OCR toán học & hiển thị lời giải LaTeX
            ├── SocraticChatScreen.tsx   # Gia sư AI đàm thoại gợi mở & vẽ đồ thị
            ├── ExamScreen.tsx           # Phòng thi và giám sát gian lận
            └── TeacherUploadScreen.tsx  # Tải đề PDF, bóc tách AI & xem trước dữ liệu
`;

export const ARCHITECTURE_EXPLANATION = `
### Nguyên Tắc Thiết Kế Clean Architecture:
1. **Quy tắc phụ thuộc (Dependency Rule)**: Các tầng bên trong (Domain) hoàn toàn không biết gì về các tầng bên ngoài (Data, Presentation, Frameworks). Mọi giao tiếp thông qua Interfaces (Inversion of Control).
2. **Khả năng kiểm thử (Testability)**: Các nghiệp vụ quan trọng như ScoringEngine, quy tắc trừ điểm và xử lý phân số được viết dưới dạng pure function, có thể viết Unit Test 100% không phụ thuộc React Native hay UI.
3. **Bộ đệm thông minh (Multi-Tier Caching)**:
   - Tầng 1: Client Memory Cache (tránh gọi lại API khi vuốt qua lại màn hình).
   - Tầng 2: Local Storage / MMKV (lưu nháp bài làm tự động mỗi 10 giây).
   - Tầng 3: Server Problem Hash Cache (băm nội dung câu hỏi/ảnh để trả lời tức thì cho các bài toán đã được giải trước đó).
`;
