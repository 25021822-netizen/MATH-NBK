import React, { useState } from 'react';
import { SocraticMessage } from '../../types/math';
import { MathView } from '../MathView';
import { FunctionGrapher } from '../FunctionGrapher';
import { Bot, User, Send, Sparkles, Lightbulb, LineChart, HelpCircle, ArrowRight, RefreshCw } from 'lucide-react';

export const SocraticTutorView: React.FC = () => {
  const [messages, setMessages] = useState<SocraticMessage[]>([
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
      latex: 'y\' = (x^3 - 3x + 1)\' = ?',
      graphHint: {
        equation: 'y = x^3 - 3x + 1',
        label: 'Đồ thị minh họa hàm số bậc ba có 2 cực trị',
      },
      timestamp: '08:31',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMessage: SocraticMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Gọi API Server Proxy Socratic Tutor
      const response = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          query,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botReply: SocraticMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          latex: data.latex,
          graphHint: data.graphHint,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        fallbackBotReply(query);
      }
    } catch (err) {
      fallbackBotReply(query);
    } finally {
      setIsTyping(false);
    }
  };

  const fallbackBotReply = (query: string) => {
    let reply = 'Chính xác! Khi y\' = 3x² - 3 = 0, ta tìm được hai nghiệm x = 1 và x = -1. Tiếp theo, bạn hãy lập bảng xét dấu để xem đạo hàm đổi dấu như thế nào qua từng điểm này nhé?';
    let latex = 'f\'(x) = 3x^2 - 3 = 0 \\iff x = \\pm 1';

    if (query.includes('đổi dấu') || query.includes('bảng xét dấu')) {
      reply = 'Tuyệt vời! Qua x = -1, đạo hàm đổi dấu từ (+) sang (-) nên đây là điểm cực đại. Qua x = 1, đạo hàm đổi dấu từ (-) sang (+) nên đây là điểm cực tiểu.';
      latex = 'x_{CĐ} = -1 \\implies y_{CĐ} = 3; \\quad x_{CT} = 1 \\implies y_{CT} = -1';
    }

    const botMessage: SocraticMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: reply,
      latex,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header & Graph Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">Gia Sư Socratic AI</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                Gợi Mở Tư Duy
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Phương pháp Socrates: Hỏi - Đáp dẫn dắt bản chất · Không giải bài hộ · Kèm đồ thị trực quan
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowGraphModal(!showGraphModal)}
          className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
            showGraphModal
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
          }`}
        >
          <LineChart size={16} />
          <span>{showGraphModal ? 'Ẩn Bảng Đồ Thị' : 'Mở Đồ Thị Tương Tác'}</span>
        </button>
      </div>

      {/* Optional Embedded Interactive Grapher */}
      {showGraphModal && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-200">
          <FunctionGrapher initialFunctionId="cubic_1" />
        </div>
      )}

      {/* Chat Messages Stream */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 min-h-[480px] max-h-[580px] overflow-y-auto space-y-6 shadow-xs">
        {messages.map((msg) => {
          const isBot = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl space-y-2 ${
                  isBot
                    ? 'bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-sm'
                    : 'bg-blue-600 text-white rounded-tr-sm shadow-xs'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>

                {msg.latex && (
                  <div
                    className={`p-3 rounded-2xl ${
                      isBot ? 'bg-white border border-slate-200' : 'bg-blue-700/60'
                    }`}
                  >
                    <MathView math={msg.latex} block />
                  </div>
                )}

                {msg.graphHint && (
                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs font-semibold text-indigo-900">
                    <div className="flex items-center gap-2">
                      <LineChart size={16} className="text-indigo-600" />
                      <span>{msg.graphHint.label || 'Đồ thị gợi ý'}</span>
                    </div>
                    <button
                      onClick={() => setShowGraphModal(true)}
                      className="text-xs text-indigo-600 font-bold hover:underline"
                    >
                      Xem ngay
                    </button>
                  </div>
                )}

                <span
                  className={`text-[10px] block text-right ${
                    isBot ? 'text-slate-400' : 'text-blue-200'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {!isBot && (
                <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 mt-1">
                  <User size={16} />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin text-indigo-600" />
              <span>Gia sư Socratic đang phân tích gợi ý tiếp theo...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="text-slate-400 self-center font-medium">Gợi ý câu hỏi:</span>
        {[
          'Đạo hàm y\' = 3x² - 3',
          'Lập bảng xét dấu đạo hàm thế nào?',
          'Tìm giá trị lớn nhất trên đoạn [0; 2]',
          'Đồ thị có bao nhiêu đường tiệm cận?',
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-medium transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Message Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-3 bg-white p-2.5 rounded-3xl border border-slate-200 shadow-xs"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập câu trả lời hoặc thắc mắc về bài toán..."
          className="flex-1 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
        >
          <Send size={15} />
          <span>Gửi</span>
        </button>
      </form>
    </div>
  );
};
