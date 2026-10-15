# Hệ Thống Ứng Dụng Học Toán THPT "Math&NBK" (Kiến Trúc & Mã Nguồn Toàn Diện)

Math&NBK là nền tảng học Toán thông minh thế hệ mới dành cho học sinh THPT (Lớp 10, 11, 12), kết hợp giữa Gamification (Duolingo-style tree, XP, Streak), trợ lý AI gia sư Socratic, máy quét bài tập OCR giải toán từng bước qua LaTeX, và hệ thống phòng thi chuẩn định dạng mới của Bộ Giáo dục & Đào tạo (BGD) với cơ chế chống gian lận đa tầng.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Các quyết định kiến trúc đã được xác nhận:**
> - **Giao diện trải nghiệm**: Thiết kế thích ứng đa thiết bị (Desktop / Tablet / Mobile) với khung xem trước linh hoạt, đồng thời hỗ trợ xuất khẩu mã nguồn React Native (Expo) nguyên bản cho cả iOS và Android.
> - **AI Engine**: Tích hợp trực tiếp Google Gemini API (`@google/genai`) cho cả 3 tác vụ AI: Multimodal OCR giải toán ảnh, Gia sư đàm thoại Socratic không giải bài hộ mà gợi ý phương pháp, và Trình phân tích đề thi PDF tự động trích xuất định dạng JSON 4 phần.
> - **Chương trình học mẫu**: Khởi tạo đầy đủ dữ liệu Toán 3 khối 10, 11, 12 theo chương trình GDPT mới (Đại số & Giải tích, Hình học phẳng & Không gian, Lượng giác, Đạo hàm & Tích phân, Số học & Xác suất thống kê).

- **Quyết định lưu trữ & Caching**: Sử dụng Supabase PostgreSQL với Row Level Security (RLS) cho dữ liệu học tập, kết hợp tầng Cache (Redis/In-Memory Cache) theo mã băm hình ảnh/LaTeX để tối ưu hóa chi phí gọi AI Vision.
- **Hệ thống chấm điểm chuẩn BGD 2025+**: Thuật toán tính điểm lũy tiến Phần II (Đúng/Sai: 1 ý đúng = 0.1đ, 2 ý = 0.25đ, 3 ý = 0.5đ, 4 ý = 1.0đ) cùng cơ chế chuẩn hóa phân số/thập phân tự động ở Phần III & IV.

---

### 1. Overview & Core Concept

- **Mục tiêu ứng dụng**: Giúp học sinh THPT tiếp cận môn Toán một cách trực quan, hứng thú thông qua lộ trình phân nhánh game hóa; đồng thời cung cấp công cụ tự kiểm tra đánh giá bám sát 100% cấu trúc đề thi tốt nghiệp THPT mới nhất.
- **Đối tượng người dùng**:
  - **Học sinh (Student)**: Quét bài tập giải tức thì, chat cùng Gia sư Socratic, thi thử áp lực thực tế có bộ đếm giờ và giám sát gian lận, cày streak và thu thập huy hiệu.
  - **Giáo viên (Teacher)**: Tải đề thi PDF lên để AI tự động bóc tách cấu trúc 4 phần, chỉnh sửa câu hỏi, duyệt đề thi công khai và theo dõi phổ điểm học sinh.
  - **Quản trị viên (Admin)**: Quản lý người dùng, phân quyền RBAC, kiểm duyệt tài nguyên, giám sát chỉ số tiêu thụ token AI và nhật ký cảnh báo gian lận.
- **Giá trị cốt lõi**: Tăng tốc độ tự học môn Toán lên 3 lần, giải phóng 80% thời gian biên soạn đề thi cho giáo viên, và đảm bảo tính công bằng trong đánh giá năng lực học sinh.

---

### 2. User Experience & Visual Design

- **Ngôn ngữ thiết kế & Thẩm mỹ**:
  - Định hình phong cách *Modern Academic & High-Energy Neumorphic/Clean Tech*: Lấy cảm hứng từ Duolingo, Khan Academy và Apple Education.
  - Tông màu chủ đạo: Xanh học viện sâu (`#1E3A8A` / `--primary`), Xanh lá Emerald năng lượng (`#10B981` cho Streak & Thành tích), Vàng hổ phách (`#F59E0B` cho XP & Huy hiệu), kết hợp nền trung tính dịu mắt (`#F8FAFC` Light Mode và `#0F172A` Dark Mode).
  - Kiểu chữ: Sử dụng họ phông sans-serif hiện đại, rõ nét (`Plus Jakarta Sans` / `Outfit`) kết hợp KaTeX chuẩn mực cho các biểu thức toán học và `tabular-nums` cho số đo, điểm số và đồng hồ đếm ngược.
- **Luồng trải nghiệm chính**:
  1. **Khám phá lộ trình**: Bản đồ kỹ năng phân nhánh với các đảo chuyên đề (Hàm số, Mũ - Logarit, Tích phân, Oxyz...). Mỗi bài học có tiến độ vòng cung, hiển thị số bài tập đã đạt và rương thưởng.
  2. **Quét bài tập tức thì (Math Scanner)**: Chụp/Tải ảnh bài toán $\to$ AI bóc tách đề thành mã LaTeX hiển thị sắc nét $\to$ phân tích dạng bài $\to$ đưa ra hướng dẫn phương pháp giải và đáp số chi tiết.
  3. **Đàm thoại Gia sư Socratic**: Học sinh hỏi một bài toán khó, AI không đưa ngay đáp án cuối cùng mà đặt lại các câu hỏi gợi mở kiến thức gốc (Định lý gì? Điều kiện xác định là gì?), hỗ trợ đính kèm công thức toán và đồ thị hàm số trực quan.
  4. **Phòng thi áp lực chuẩn BGD**: Đồng hồ đếm ngược đồng bộ; hệ thống bắt sự kiện thoát app/chuyển tab (cảnh báo 2 lần, lần 3 tự động nộp bài và ghi nhận log gian lận); tự động lưu bài nháp cục bộ (Auto-Save) không lo mất kết nối mạng.
  5. **Cổng giáo viên & Trình bóc tách PDF AI**: Kéo thả đề thi PDF $\to$ AI đọc nội dung, trích xuất cấu trúc 4 phần $\to$ kiểm tra hợp lệ bằng Zod schema $\to$ hiển thị bảng xem trước tương tác để giáo viên phê duyệt 1 chạm.

---

### 3. Key Product Decisions & Trade-Offs

- **Quyết định 1: Kiến trúc Client-Side & Server Proxy cho Gemini AI**
  - *Giải pháp*: Xây dựng tầng Server Proxy an toàn tại `/api/gemini/*` trên nền tảng Express/Node.js để bảo vệ `GEMINI_API_KEY`, áp dụng Rate Limiting và hạn ngạch quota theo gói tài khoản (Free vs Premium).
  - *Lý do*: Đáp ứng nguyên tắc bảo mật thông tin bí mật, đồng thời cho phép tích hợp tầng bộ đệm (Caching) bằng cách băm chuỗi nhận dạng bài toán trước khi gọi Gemini API nhằm tiết kiệm chi phí token.
- **Quyết định 2: Cơ chế chống gian lận thích ứng môi trường đa nền tảng**
  - *Giải pháp*: Kết hợp lắng nghe sự kiện `AppState` (trong React Native) và sự kiện `visibilitychange` / `blur` (trong trình duyệt web). Mọi vi phạm được lưu tức thì vào bảng `cheat_logs` kèm mốc thời gian và lý do.
  - *Lý do*: Đảm bảo tính răn đe và toàn vẹn của kết quả khảo sát năng lực trực tuyến mà không gây treo giật trải nghiệm học tập của học sinh.
- **Quyết định 3: Hệ thống chấm điểm tự động đa dạng thức**
  - *Giải pháp*: Viết hàm thuần TypeScript thực hiện chuẩn hóa chuỗi đáp án (chuyển đổi dấu phẩy sang chấm thập phân, rút gọn phân số, loại bỏ khoảng trắng dư thừa) và áp dụng bảng điểm lũy tiến Bộ GD&ĐT cho các câu hỏi Đúng/Sai 4 ý.
  - *Lý do*: Loại trừ 100% rủi ro chấm sai do định dạng bàn phím khác nhau của học sinh và đảm bảo tính minh bạch tuyệt đối.

---

### 4. Technical Architecture & Data Strategy

#### Sơ đồ kiến trúc tổng thể & Luồng dữ liệu

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER (React / React Native)              │
│                                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌──────────────────┐ │
│  │   Student Mobile UI   │  │   Teacher Portal UI   │  │  Admin Dashboard │ │
│  │ - Duolingo Skill Tree │  │ - PDF AI Parser View  │  │ - User & Quota   │ │
│  │ - Camera OCR Solver   │  │ - Exam Editor Form    │  │ - Cheat Logs     │ │
│  │ - Socratic Chatbot    │  │ - Question Approval   │  │ - Token Monitor  │ │
│  │ - BGD 4-Part Exam     │  │                       │  │                  │ │
│  └───────────┬───────────┘  └───────────┬───────────┘  └────────┬─────────┘ │
│              │                          │                       │           │
│              ▼                          ▼                       ▼           │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Local Offline Storage (AsyncStorage / MMKV / LocalStorage Draft Store) │ │
│  └──────────────────────────────────┬─────────────────────────────────────┘ │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │ HTTPS / REST / Realtime
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND & PROXY SERVICES                           │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Node.js / Express Server API Gateway (/api/*)                         │  │
│  │ - Quota & Rate Limiter Middleware (Free: 10 scans/day, Premium: Unlim) │  │
│  │ - Problem Hash & Response Cache (Redis / In-Memory Map)               │  │
│  │ - Anti-Cheat Event Ingestion & Audit Logger                           │  │
│  └───────────────┬───────────────────────────────────────┬───────────────┘  │
│                  │                                       │                  │
│                  ▼                                       ▼                  │
│  ┌───────────────────────────────┐       ┌───────────────────────────────┐  │
│  │   Gemini 3.8 / 4 AI Engine    │       │     Supabase / PostgreSQL     │  │
│  │ - Vision Math OCR (LaTeX)     │       │ - RBAC (Student/Teacher/Admin)│  │
│  │ - Socratic Reasoning Tutor    │       │ - DDL Schemas & RLS Rules     │  │
│  │ - PDF 4-Part Zod Parser       │       │ - Realtime Leaderboards & XP  │  │
│  └───────────────────────────────┘       └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Mô hình Cơ sở dữ liệu Supabase / PostgreSQL DDL

Bao gồm 8 bảng cốt lõi với khóa ngoại và chỉ mục tối ưu:
1. `profiles`: Thông tin người dùng, vai trò (`role`: student, teacher, admin), gói cước (`tier`: free, premium), điểm kinh nghiệm (`xp`), số ngày học liên tục (`streak_days`), ngày hoạt động gần nhất.
2. `curriculums`: Cấu trúc môn học phân theo khối lớp (10, 11, 12) và chuyên đề (Đại số, Hình học, Giải tích, Lượng giác).
3. `lessons`: Các bài học trong cây kỹ năng phân cấp, vị trí tọa độ trên bản đồ, điểm thưởng và điều kiện tiên quyết mở khóa.
4. `exams`: Đề thi do giáo viên/hệ thống tạo, thời gian làm bài, năm học, trạng thái phê duyệt (`status`: draft, approved, archived).
5. `questions`: Câu hỏi thuộc đề thi hoặc kho luyện tập, phân loại 4 phần chuẩn BGD (`part`: part_1_mcq, part_2_true_false, part_3_short_answer, part_4_essay), công thức LaTeX, giải thích chi tiết.
6. `exam_results`: Kết quả thi của học sinh, tổng điểm, chi tiết đáp án từng câu, thời gian bắt đầu và hoàn thành.
7. `chat_history`: Lịch sử trao đổi cùng Gia sư Socratic theo từng phiên học.
8. `cheat_logs`: Nhật ký ghi nhận các hành vi vi phạm khi làm bài thi (rời ứng dụng, mất tiêu điểm, chụp màn hình).

#### Bảng thông số & Thuật toán chấm điểm chuẩn BGD 2025+

```typescript
// Thuật toán chấm Phần II: Đúng / Sai 4 ý độc lập
export function calculateTrueFalseScore(userAnswers: boolean[], correctAnswers: boolean[]): number {
  let correctCount = 0;
  for (let i = 0; i < 4; i++) {
    if (userAnswers[i] === correctAnswers[i]) correctCount++;
  }
  switch (correctCount) {
    case 1: return 0.1;
    case 2: return 0.25;
    case 3: return 0.5;
    case 4: return 1.0;
    default: return 0.0;
  }
}
```

#### Quy trình triển khai & bàn giao mã nguồn
1. **Khởi tạo Database & Utility Core**: DDL PostgreSQL đầy đủ, TypeScript Types, Scoring Engine, Prompt System & Zod Schema cho bộ tách PDF.
2. **Xây dựng Server Proxy**: Cung cấp các endpoint `/api/gemini/scan`, `/api/gemini/tutor`, `/api/gemini/parse-pdf` với cơ chế cache và đếm quota.
3. **Mã nguồn React Native / React tương thích cao**:
   - Màn hình 1: Trang chủ Dashboard & Bản đồ kỹ năng phân nhánh Duolingo.
   - Màn hình 2: Máy quét bài tập Camera OCR kết xuất công thức KaTeX.
   - Màn hình 3: Phòng chat Gia sư Socratic tương tác đồ thị và gợi ý tư duy.
   - Màn hình 4: Phòng thi chuẩn 4 phần với đếm ngược, tự lưu bản nháp và bộ giám sát chống gian lận.
   - Màn hình 5: Cổng giáo viên tải lên PDF và xem trước cấu trúc trích xuất.
