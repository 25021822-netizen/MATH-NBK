import type { Question } from '../types/math';

/**
 * Bộ công cụ chấm điểm tự động & Chuẩn hóa đáp án Toán THPT
 * Theo định dạng đề thi mới của Bộ Giáo dục & Đào tạo (Áp dụng từ năm 2025)
 */

/**
 * 1. Chấm điểm Phần II: Câu hỏi Đúng/Sai gồm 4 ý độc lập a, b, c, d
 * Quy tắc tính điểm lũy tiến BGD:
 * - Đúng 1 ý: 0.10 điểm
 * - Đúng 2 ý: 0.25 điểm
 * - Đúng 3 ý: 0.50 điểm
 * - Đúng 4 ý: 1.00 điểm
 * - Đúng 0 ý: 0.00 điểm
 */
export function gradePart2TrueFalse(
  studentAnswers: Record<'a' | 'b' | 'c' | 'd', boolean | null | undefined>,
  correctAnswers: Record<'a' | 'b' | 'c' | 'd', boolean>
): {
  correctCount: number;
  earnedPoints: number;
  details: Record<'a' | 'b' | 'c' | 'd', boolean>;
} {
  const keys: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];
  let correctCount = 0;
  const details = {
    a: false,
    b: false,
    c: false,
    d: false,
  };

  for (const key of keys) {
    const isMatch = studentAnswers[key] === correctAnswers[key];
    details[key] = isMatch;
    if (isMatch) {
      correctCount++;
    }
  }

  let earnedPoints = 0;
  switch (correctCount) {
    case 1:
      earnedPoints = 0.1;
      break;
    case 2:
      earnedPoints = 0.25;
      break;
    case 3:
      earnedPoints = 0.5;
      break;
    case 4:
      earnedPoints = 1.0;
      break;
    default:
      earnedPoints = 0.0;
  }

  return {
    correctCount,
    earnedPoints,
    details,
  };
}

export function calculateExamTotalPoints(questions: Question[]): number {
  return Number(questions.reduce((total, question) => total + question.points, 0).toFixed(2));
}

/**
 * 2. Kiểm tra tính hợp lệ của câu trả lời ngắn Phần III
 * Quy định BGD:
 * - Độ dài tối đa 4 ký tự/chữ số
 * - Chỉ chấp nhận các ký tự: số [0-9], dấu âm [-], dấu phẩy/chấm [, .], dấu gạch chéo [/]
 * - Ví dụ hợp lệ: "-2/3", "3,14", "12", "-0,5", "4"
 */
export function validatePart3ShortAnswerFormat(rawAnswer: string): {
  isValidFormat: boolean;
  sanitized: string;
  errorMessage?: string;
} {
  const sanitized = rawAnswer.trim().replace(/\s+/g, '');

  if (sanitized.length === 0) {
    return { isValidFormat: false, sanitized: '', errorMessage: 'Chưa nhập đáp án' };
  }

  if (sanitized.length > 4) {
    return {
      isValidFormat: false,
      sanitized,
      errorMessage: `Độ dài vượt quá 4 ký tự (hiện tại: ${sanitized.length})`,
    };
  }

  // Regex cho phép ký tự số, dấu trừ, dấu phẩy, dấu chấm, dấu gạch chéo
  const allowedPattern = /^[-0-9,\.\/]+$/;
  if (!allowedPattern.test(sanitized)) {
    return {
      isValidFormat: false,
      sanitized,
      errorMessage: 'Chứa ký tự không hợp lệ. Chỉ cho phép số và các dấu -, ,, ., /',
    };
  }

  return { isValidFormat: true, sanitized };
}

/**
 * 3. Chuẩn hóa giá trị số học / phân số tự động cho câu trả lời ngắn.
 * Thuật toán quy đổi:
 * - Thay thế dấu phẩy thập phân ',' của tiếng Việt thành '.'
 * - Phân tích phân số 'a/b' thành giá trị số thực
 * - Chuyển đổi phần trăm 'x%' -> x / 100
 * - So sánh sai số epsilon (1e-4) để chấp nhận các cách viết tương đương:
 *   Ví dụ: "1/2" == "0.5" == "0,5" == "2/4"
 */
export function parseNumericValue(input: string): number | null {
  if (!input) return null;
  let clean = input.trim().toLowerCase().replace(/\s+/g, '');

  // Xử lý dấu phẩy thập phân kiểu Việt Nam
  clean = clean.replace(/,/g, '.');

  // Kiểm tra phần trăm
  if (clean.endsWith('%')) {
    const numPart = parseFloat(clean.slice(0, -1));
    return isNaN(numPart) ? null : numPart / 100;
  }

  // Kiểm tra phân số dạng a/b hoặc -a/b
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }
  }

  // Xử lý số thực thông thường
  const directNum = parseFloat(clean);
  return isNaN(directNum) ? null : directNum;
}

/**
 * So sánh đáp án của học sinh với đáp án chuẩn
 */
export function isAnswerEquivalent(
  studentAnswer: string,
  correctAnswer: string,
  acceptedVariants: string[] = []
): boolean {
  if (!studentAnswer || !correctAnswer) return false;

  const cleanStudent = studentAnswer.trim().toLowerCase().replace(/\s+/g, '').replace(/,/g, '.');
  const cleanCorrect = correctAnswer.trim().toLowerCase().replace(/\s+/g, '').replace(/,/g, '.');

  // 1. So sánh trực tiếp chuỗi đã chuẩn hóa
  if (cleanStudent === cleanCorrect) return true;

  // 2. Kiểm tra trong danh sách các biến thể chấp nhận
  for (const variant of acceptedVariants) {
    const cleanVariant = variant.trim().toLowerCase().replace(/\s+/g, '').replace(/,/g, '.');
    if (cleanStudent === cleanVariant) return true;
  }

  // 3. So sánh giá trị số thực với ngưỡng sai số epsilon
  const studentNum = parseNumericValue(cleanStudent);
  const correctNum = parseNumericValue(cleanCorrect);

  if (studentNum !== null && correctNum !== null) {
    const epsilon = 1e-4;
    return Math.abs(studentNum - correctNum) < epsilon;
  }

  return false;
}
