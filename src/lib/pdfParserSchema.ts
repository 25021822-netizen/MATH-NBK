import { z } from 'zod';

/**
 * Zod Schema xác thực các dạng câu hỏi được hỗ trợ trong đề thi.
 */

export const Part1OptionSchema = z.object({
  key: z.enum(['A', 'B', 'C', 'D']),
  text: z.string().min(1, 'Nội dung lựa chọn không được để trống'),
  latex: z.string().optional(),
});

export const QuestionPart1Schema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  part: z.literal('part_1_mcq'),
  questionNumber: z.number().int().positive(),
  prompt: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
  latex: z.string().optional(),
  options: z.array(Part1OptionSchema).length(4, 'Phần 1 bắt buộc có đúng 4 phương án A, B, C, D'),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string().default(''),
  points: z.number().positive().default(0.25),
});

export const TrueFalseItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  subKey: z.enum(['a', 'b', 'c', 'd']),
  text: z.string().min(1, 'Mệnh đề con không được để trống'),
  latex: z.string().optional(),
  isCorrect: z.boolean({ message: 'Phải xác định tính Đúng/Sai của mệnh đề' }),
});

export const QuestionPart2Schema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  part: z.literal('part_2_true_false'),
  questionNumber: z.number().int().positive(),
  prompt: z.string().min(1, 'Lệnh hỏi hoặc giả thiết không được để trống'),
  latex: z.string().optional(),
  items: z.array(TrueFalseItemSchema).length(4, 'Phần 2 bắt buộc có đúng 4 mệnh đề a, b, c, d'),
  explanation: z.string().default(''),
  points: z.number().positive().default(1.0),
});

export const QuestionPart3Schema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  part: z.literal('part_3_short_answer'),
  questionNumber: z.number().int().positive(),
  prompt: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
  latex: z.string().optional(),
  correctAnswer: z.string()
    .min(1, 'Đáp án không được để trống')
    .max(4, 'Đáp án Phần 3 tối đa 4 ký tự theo quy chế BGD')
    .regex(/^[-0-9,\.\/]+$/, 'Chỉ cho phép số và ký tự -, ,, ., /'),
  explanation: z.string().default(''),
  points: z.number().positive().default(0.5),
});

export const ExamQuestionSchema = z.discriminatedUnion('part', [
  QuestionPart1Schema,
  QuestionPart2Schema,
  QuestionPart3Schema,
]);

export const ExamMetadataSchema = z.object({
  title: z.string().min(3, 'Tên đề thi phải từ 3 ký tự trở lên'),
  grade: z.union([z.literal(10), z.literal(11), z.literal(12)]),
  year: z.number().int().min(2024).max(2030).default(2025),
  durationMinutes: z.number().int().positive().default(90),
  totalPoints: z.number().positive().optional(),
});

export const ParsedExamSchema = z.object({
  metadata: ExamMetadataSchema,
  questions: z.array(ExamQuestionSchema).min(1, 'Đề thi phải có ít nhất 1 câu hỏi'),
});

export type ParsedExamData = z.infer<typeof ParsedExamSchema>;

/**
 * System Prompt chuẩn hóa dành cho AI PDF Parser
 */
export const PDF_PARSER_SYSTEM_PROMPT = `
Bạn là chuyên gia chuyển đổi và bóc tách đề thi Toán học THPT Việt Nam (Bộ Giáo dục & Đào tạo định dạng mới).
Nhiệm vụ của bạn là đọc nội dung văn bản đề thi (từ file PDF hoặc hình ảnh đề thi) và chuyển đổi thành cấu trúc JSON nghiêm ngặt theo các dạng câu hỏi sau:

1. PHẦN 1 (part_1_mcq): Trắc nghiệm 4 lựa chọn nhiều phương án.
   - Luôn có đúng 4 phương án: key = 'A' | 'B' | 'C' | 'D'.
   - correctAnswer là 1 trong 4 chữ cái A, B, C, D.

2. PHẦN 2 (part_2_true_false): Trắc nghiệm Đúng/Sai với 4 ý độc lập.
   - Luôn có đúng 4 ý: subKey = 'a' | 'b' | 'c' | 'd'.
   - isCorrect: true nếu mệnh đề đó ĐÚNG, false nếu SAI.

3. PHẦN 3 (part_3_short_answer): Câu hỏi trắc nghiệm trả lời ngắn.
   - Thí sinh điền tối đa 4 ký tự/chữ số (chỉ gồm [0-9], '-', ',', '.', '/').
   - Ví dụ correctAnswer: "-2/3", "3.14", "12", "-0.5".

Đề thi có thể chỉ gồm một hoặc nhiều phần; không bắt buộc phải có đủ cả ba phần.
Quy tắc bắt buộc:
- Mọi công thức toán học phải được bọc trong cú pháp LaTeX chuẩn (ví dụ: \\frac{a}{b}, \\sqrt{x}, \\int_{0}^{1} x dx).
- Không thêm bất kỳ chữ nào ngoài chuỗi JSON hợp lệ.
`;
