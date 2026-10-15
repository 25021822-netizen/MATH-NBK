/**
 * Trọn bộ Mã Nguồn React Native (TypeScript) 5 Màn Hình Chính của Math&NBK
 * Sử dụng Expo + NativeWind (Tailwind CSS) + Lucide Icons + KaTeX
 */

export const RN_SCREEN_1_HOME = `
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Flame, Award, Zap, BookOpen, CheckCircle, Lock } from 'lucide-react-native';

interface SkillNode {
  id: string;
  title: string;
  description: string;
  level: number;
  totalSteps: number;
  completedSteps: number;
  isLocked: boolean;
  xpReward: number;
}

export const HomeScreen: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<10 | 11 | 12>(12);
  const [streak, setStreak] = useState(7);
  const [xp, setXp] = useState(1450);

  const skillTree: SkillNode[] = [
    { id: '1', title: 'Tính đơn điệu của hàm số', description: 'Đồng biến, nghịch biến & đồ thị $y=f(x)$', level: 1, totalSteps: 5, completedSteps: 5, isLocked: false, xpReward: 50 },
    { id: '2', title: 'Cực trị của hàm số', description: 'Điều kiện cần và đủ cho cực đại, cực tiểu', level: 2, totalSteps: 5, completedSteps: 3, isLocked: false, xpReward: 60 },
    { id: '3', title: 'Giá trị lớn nhất & nhỏ nhất', description: 'Ứng dụng GTLN, GTNN vào bài toán thực tế', level: 3, totalSteps: 4, completedSteps: 0, isLocked: false, xpReward: 70 },
    { id: '4', title: 'Đường tiệm cận', description: 'Tiệm cận đứng, ngang & tiệm cận xiên', level: 4, totalSteps: 5, completedSteps: 0, isLocked: true, xpReward: 80 },
    { id: '5', title: 'Khảo sát sự biến thiên', description: 'Vẽ bảng biến thiên và đồ thị phân thức', level: 5, totalSteps: 6, completedSteps: 0, isLocked: true, xpReward: 100 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Top Header - Streak & XP Bar */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <View className="flex-row items-center gap-2">
          <View className="w-9 h-9 rounded-xl bg-blue-600 items-center justify-center">
            <BookOpen size={20} color="#FFFFFF" />
          </View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">Math&NBK</Text>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/40 rounded-full border border-orange-200">
            <Flame size={18} color="#EA580C" />
            <Text className="text-xs font-bold text-orange-700 dark:text-orange-400">{streak} ngày</Text>
          </View>
          <View className="flex-row items-center gap-1 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-full border border-amber-200">
            <Zap size={18} color="#D97706" />
            <Text className="text-xs font-bold text-amber-700 dark:text-amber-400">{xp} XP</Text>
          </View>
        </View>
      </View>

      {/* Grade Selector Switcher */}
      <View className="flex-row px-6 py-3 bg-white dark:bg-slate-900 gap-2">
        {([10, 11, 12] as const).map((g) => (
          <TouchableOpacity
            key={g}
            onPress={() => setSelectedGrade(g)}
            className={\`flex-1 py-2 rounded-xl items-center \${selectedGrade === g ? 'bg-blue-600' : 'bg-slate-100 dark:bg-slate-800'}\`}
          >
            <Text className={\`font-semibold text-xs \${selectedGrade === g ? 'text-white' : 'text-slate-600 dark:text-slate-400'}\`}>
              Lớp {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Duolingo Style Skill Tree */}
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
        <Text className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
          Chương I: Ứng Dụng Đạo Hàm Khảo Sát Hàm Số
        </Text>

        {skillTree.map((node, index) => {
          // Tính toán vị trí uốn lượn hình chữ S phong cách Duolingo
          const offset = Math.sin(index * 1.3) * 50;
          const isDone = node.completedSteps === node.totalSteps;

          return (
            <View key={node.id} style={{ transform: [{ translateX: offset }], marginBottom: 36, alignItems: 'center' }}>
              <TouchableOpacity
                disabled={node.isLocked}
                className={\`w-20 h-20 rounded-3xl items-center justify-center shadow-lg border-4 \${
                  node.isLocked
                    ? 'bg-slate-200 dark:bg-slate-800 border-slate-300'
                    : isDone
                    ? 'bg-emerald-500 border-emerald-600'
                    : 'bg-blue-600 border-blue-700'
                }\`}
              >
                {node.isLocked ? (
                  <Lock size={28} color="#94A3B8" />
                ) : isDone ? (
                  <CheckCircle size={32} color="#FFFFFF" />
                ) : (
                  <Award size={32} color="#FFFFFF" />
                )}
              </TouchableOpacity>

              {/* Progress Subtitle */}
              <View className="mt-2 items-center bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">{node.title}</Text>
                <Text className="text-[10px] text-slate-500">
                  {node.isLocked ? 'Chưa mở khóa' : \`\${node.completedSteps}/\${node.totalSteps} bài tập\`}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};
`;

export const RN_SCREEN_2_SCANNER = `
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { Camera, Image as ImageIcon, Zap, Sparkles, Check, RefreshCw } from 'lucide-react-native';
// Giả định thư viện KaTeX component cho React Native: react-native-katex
import MathView from 'react-native-math-view';

export const ScannerScreen: React.FC = () => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quotaRemaining, setQuotaRemaining] = useState(8); // 8/10 scans remaining
  const [solution, setSolution] = useState<any | null>(null);

  const handleCapture = async () => {
    if (quotaRemaining <= 0) {
      alert('Bạn đã dùng hết 10 lượt quét miễn phí hôm nay. Vui lòng nâng cấp gói Premium!');
      return;
    }

    setIsProcessing(true);
    setQuotaRemaining(prev => prev - 1);

    // Giả lập gửi ảnh tới Server Proxy Gemini Vision
    setTimeout(() => {
      setSolution({
        latex: '\\\\int_{0}^{\\\\frac{\\\\pi}{2}} x \\\\sin(x) \\\\, dx',
        topic: 'Giải tích - Tích phân từng phần',
        steps: [
          { title: 'Bước 1: Đặt biến tích phân từng phần', math: 'u = x \\\\Rightarrow du = dx; \\\\quad dv = \\\\sin(x)dx \\\\Rightarrow v = -\\\\cos(x)' },
          { title: 'Bước 2: Áp dụng công thức \\\\int u dv = uv - \\\\int v du', math: '= \\\\left[ -x\\\\cos(x) \\\\right]_0^{\\\\frac{\\\\pi}{2}} - \\\\int_0^{\\\\frac{\\\\pi}{2}} (-\\\\cos(x))dx' },
          { title: 'Bước 3: Tính giá trị tích phân', math: '= 0 + \\\\left[ \\\\sin(x) \\\\right]_0^{\\\\frac{\\\\pi}{2}} = 1 - 0 = 1' }
        ],
        finalAnswer: 'I = 1',
        fromCache: true
      });
      setIsProcessing(false);
    }, 1800);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* Top Bar with Quota */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800">
        <Text className="text-lg font-bold text-white">Máy Quét Bài Tập AI</Text>
        <View className="px-3 py-1 bg-blue-950 rounded-full border border-blue-500/40">
          <Text className="text-xs text-blue-400 font-semibold">Còn {quotaRemaining}/10 lượt</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Camera Viewfinder Frame */}
        <View className="w-full h-72 rounded-3xl bg-slate-800 border-2 border-dashed border-blue-500/50 items-center justify-center overflow-hidden mb-6">
          {photoUri ? (
            <Image source={{ uri: photoUri }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="items-center">
              <Camera size={48} color="#3B82F6" />
              <Text className="text-white text-sm mt-3 font-medium">Đặt đề bài vào giữa khung hình</Text>
              <Text className="text-slate-400 text-xs mt-1">Hỗ trợ cả chữ in trong SGK và chữ viết tay</Text>
            </View>
          )}
        </View>

        {/* Action Controls */}
        <View className="flex-row gap-4 mb-6">
          <TouchableOpacity
            onPress={handleCapture}
            disabled={isProcessing}
            className="flex-1 h-14 bg-blue-600 rounded-2xl flex-row items-center justify-center gap-2"
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Sparkles size={20} color="#FFFFFF" />
                <Text className="text-white font-bold text-base">Giải Bằng AI Vision</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* AI Result Card */}
        {solution && (
          <View className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{solution.topic}</Text>
              {solution.fromCache && (
                <View className="flex-row items-center gap-1 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  <Zap size={12} color="#10B981" />
                  <Text className="text-[10px] text-emerald-300 font-bold">Redis Cached (0.05s)</Text>
                </View>
              )}
            </View>

            {/* LaTeX Problem */}
            <View className="bg-slate-900 p-4 rounded-2xl mb-4">
              <Text className="text-slate-400 text-xs mb-1">Công thức nhận diện:</Text>
              <MathView math={solution.latex} style={{ color: '#FFFFFF' }} />
            </View>

            {/* Steps */}
            <Text className="text-white font-bold text-sm mb-3">Lời giải chi tiết từng bước:</Text>
            {solution.steps.map((st: any, idx: number) => (
              <View key={idx} className="mb-3 bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                <Text className="text-blue-400 font-semibold text-xs mb-1">{st.title}</Text>
                <MathView math={st.math} />
              </View>
            ))}

            <View className="mt-2 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex-row items-center justify-between">
              <Text className="text-xs text-emerald-400 font-semibold">Đáp số cuối cùng:</Text>
              <Text className="text-base text-white font-bold">{solution.finalAnswer}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
`;

export const RN_SCREEN_3_SOCRATIC_CHAT = `
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Send, Bot, User, Sparkles, Lightbulb, LineChart } from 'lucide-react-native';
import MathView from 'react-native-math-view';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  latex?: string;
  hasGraph?: boolean;
}

export const SocraticChatScreen: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Chào bạn! Mình là Gia sư Socratic Math&NBK. Mình sẽ không giải bài tập thay bạn, nhưng sẽ gợi mở từng bước để bạn tự tìm ra lời giải. Bạn đang gặp vướng mắc ở bài toán nào?',
    },
    {
      id: '2',
      sender: 'user',
      text: 'Làm thế nào để tìm tiệm cận đứng của hàm số y = (2x + 1)/(x - 3)?',
    },
    {
      id: '3',
      sender: 'assistant',
      text: 'Để tìm đường tiệm cận đứng x = x0, bạn hãy nhớ lại định nghĩa: Khi x tiến dần tới x0 thì giới hạn lim y phải tiến ra vô cực (+\\\\infty hoặc -\\\\infty).',
      latex: '\\\\lim_{x \\\\to x_0^+} \\\\frac{2x+1}{x-3} = \\\\pm\\\\infty',
      hasGraph: true,
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Phản hồi Socratic: Đặt câu hỏi kích thích tư duy
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Chính xác! Vậy với phân thức này, giá trị nào của x sẽ làm cho mẫu số x - 3 bằng 0 trong khi tử số 2x + 1 khác 0?',
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-2xl bg-indigo-600 items-center justify-center">
          <Bot size={22} color="#FFFFFF" />
        </View>
        <View>
          <Text className="text-base font-bold text-slate-900 dark:text-white">Gia Sư Socratic AI</Text>
          <Text className="text-xs text-emerald-600 font-medium">Gợi ý tư duy · Không giải hộ</Text>
        </View>
      </View>

      {/* Chat Messages */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const isBot = item.sender === 'assistant';
          return (
            <View className={\`flex-row mb-4 \${isBot ? 'justify-start' : 'justify-end'}\`}>
              <View className={\`max-w-[85%] p-4 rounded-3xl \${
                isBot 
                  ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-sm' 
                  : 'bg-blue-600 rounded-tr-sm'
              }\`}>
                <Text className={\`text-sm \${isBot ? 'text-slate-800 dark:text-slate-200' : 'text-white'}\`}>
                  {item.text}
                </Text>

                {item.latex && (
                  <View className="mt-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <MathView math={item.latex} />
                  </View>
                )}

                {item.hasGraph && (
                  <View className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 flex-row items-center gap-2">
                    <LineChart size={18} color="#4F46E5" />
                    <Text className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                      Gợi ý: Mở đồ thị hàm số y = (2x+1)/(x-3)
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* Input Field */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-row items-center gap-2">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Hỏi phương pháp hoặc kiến thức toán..."
            placeholderTextColor="#94A3B8"
            className="flex-1 h-12 px-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white"
          />
          <TouchableOpacity
            onPress={handleSend}
            className="w-12 h-12 bg-blue-600 rounded-2xl items-center justify-center"
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
`;

export const RN_SCREEN_4_EXAM = `
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, AppState, AppStateStatus, SafeAreaView } from 'react-native';
import { Clock, AlertTriangle, Save, ShieldAlert, Check } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MathView from 'react-native-math-view';

export const ExamScreen: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 phút
  const [infractionCount, setInfractionCount] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const appState = useRef(AppState.currentState);

  // 1. Bộ đếm ngược thời gian
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam('Hết giờ làm bài!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Chống gian lận qua sự kiện AppState
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        handleViolation();
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [infractionCount]);

  // 3. Tự động lưu bản nháp (Auto-Save) mỗi 10 giây
  useEffect(() => {
    const saveInterval = setInterval(async () => {
      try {
        await AsyncStorage.setItem('@math_exam_draft', JSON.stringify(answers));
      } catch (err) {
        console.error('Lỗi tự động lưu nháp:', err);
      }
    }, 10000);
    return () => clearInterval(saveInterval);
  }, [answers]);

  const handleViolation = () => {
    const nextCount = infractionCount + 1;
    setInfractionCount(nextCount);

    if (nextCount === 1) {
      Alert.alert('Cảnh báo vi phạm lần 1', 'Bạn vừa rời khỏi màn hình bài thi. Vui lòng tập trung làm bài!');
    } else if (nextCount === 2) {
      Alert.alert('Cảnh báo nghiêm trọng lần 2', 'Nếu bạn rời màn hình thêm một lần nữa, bài thi sẽ tự động bị đình chỉ và nộp!');
    } else if (nextCount >= 3) {
      Alert.alert('Đình chỉ bài thi', 'Bạn đã vi phạm quy chế thi 3 lần. Hệ thống tiến hành nộp bài và ghi nhận gian lận!');
      handleSubmitExam('Vi phạm quy chế thi quá 3 lần');
    }
  };

  const handleSubmitExam = (reason?: string) => {
    // Xử lý nộp bài
    Alert.alert('Nộp bài thành công', reason || 'Bài thi đã được ghi nhận vào hệ thống');
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return \`\${m < 10 ? '0' : ''}\${m}:\${s < 10 ? '0' : ''}\${s}\`;
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Top Countdown & Anti-Cheat Header */}
      <View className="px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Clock size={18} color="#2563EB" />
          <Text className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">
            {formatTimer(timeLeft)}
          </Text>
        </View>

        {/* Warning Indicator */}
        <View className="flex-row items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-950/40 rounded-full border border-red-200">
          <ShieldAlert size={14} color="#DC2626" />
          <Text className="text-xs font-bold text-red-600">Vi phạm: {infractionCount}/3</Text>
        </View>

        <TouchableOpacity
          onPress={() => handleSubmitExam()}
          className="px-4 py-2 bg-blue-600 rounded-xl"
        >
          <Text className="text-white text-xs font-bold">Nộp bài</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* PHẦN 1: TRẮC NGHIỆM 4 LỰA CHỌN */}
        <Text className="text-base font-bold text-slate-900 dark:text-white mb-2">
          PHẦN I: Trắc nghiệm 4 lựa chọn (3.0 điểm)
        </Text>
        <View className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
          <Text className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Câu 1: Cho hàm số y = f(x) có đạo hàm f'(x) = x(x-1)^2. Số điểm cực trị của hàm số là:
          </Text>
          {(['A. 0', 'B. 1', 'C. 2', 'D. 3'] as const).map((opt, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setAnswers(prev => ({ ...prev, q1: opt[0] }))}
              className={\`p-3 rounded-xl mb-2 border \${answers.q1 === opt[0] ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30' : 'border-slate-200'}\`}
            >
              <Text className="text-sm font-medium">{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PHẦN 2: ĐÚNG / SAI 4 Ý (LŨY TIẾN 0.1, 0.25, 0.5, 1.0) */}
        <Text className="text-base font-bold text-slate-900 dark:text-white mb-2">
          PHẦN II: Trắc nghiệm Đúng/Sai 4 ý (4.0 điểm)
        </Text>
        <View className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
          <Text className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Câu 2: Cho hàm số y = (x^2 - 2x + 2)/(x - 1). Xét tính đúng sai của các mệnh đề:
          </Text>

          {[
            { key: 'a', text: 'Tập xác định của hàm số là D = R \\\\ {1}' },
            { key: 'b', text: 'Đạo hàm y\\\' = (x^2 - 2x)/(x - 1)^2' },
            { key: 'c', text: 'Hàm số đạt cực đại tại x = 2' },
            { key: 'd', text: 'Đường thẳng y = x - 1 là tiệm cận xiên' }
          ].map((item) => (
            <View key={item.key} className="flex-row items-center justify-between py-2 border-b border-slate-100">
              <Text className="text-xs flex-1 mr-2">{item.key}) {item.text}</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setAnswers(prev => ({ ...prev, [\`q2_\${item.key}\`]: true }))}
                  className={\`px-3 py-1.5 rounded-lg border \${answers[\`q2_\${item.key}\`] === true ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'}\`}
                >
                  <Text className={\`text-xs font-bold \${answers[\`q2_\${item.key}\`] === true ? 'text-white' : 'text-slate-700'}\`}>Đúng</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setAnswers(prev => ({ ...prev, [\`q2_\${item.key}\`]: false }))}
                  className={\`px-3 py-1.5 rounded-lg border \${answers[\`q2_\${item.key}\`] === false ? 'bg-rose-600 border-rose-600' : 'border-slate-300'}\`}
                >
                  <Text className={\`text-xs font-bold \${answers[\`q2_\${item.key}\`] === false ? 'text-white' : 'text-slate-700'}\`}>Sai</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* PHẦN 3: TRẢ LỜI NGẮN (TỐI ĐA 4 KÝ TỰ) */}
        <Text className="text-base font-bold text-slate-900 dark:text-white mb-2">
          PHẦN III: Trả lời ngắn (Tối đa 4 ký tự) (3.0 điểm)
        </Text>
        <View className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
          <Text className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Câu 3: Tìm giá trị nhỏ nhất của hàm số y = x + 4/x trên khoảng (0; +\\\\infty):
          </Text>
          <TextInput
            maxLength={4}
            placeholder="Điền tối đa 4 ký tự (VD: 4)"
            value={answers.q3 || ''}
            onChangeText={(txt) => setAnswers(prev => ({ ...prev, q3: txt }))}
            className="h-12 border border-slate-300 rounded-xl px-4 font-mono font-bold text-base"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
`;

export const RN_SCREEN_5_TEACHER_UPLOAD = `
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { FileUp, CheckCircle2, AlertCircle, FileText, Send, Eye, Edit3, Plus, Trash2, Save } from 'lucide-react-native';

export const TeacherUploadScreen: React.FC = () => {
  const [mode, setMode] = useState<'manual' | 'pdf'>('manual');
  
  // State Tạo đề thủ công
  const [examTitle, setExamTitle] = useState('Đề Khảo Sát Toán 12 - THPT NBK');
  const [questions, setQuestions] = useState<any[]>([
    {
      id: '1',
      part: 'part_1_mcq',
      prompt: 'Cho hàm số y = f(x) có đạo hàm f\\\'(x) = x(x-1)². Số điểm cực trị là:',
      correctAnswer: 'A',
      points: 0.25,
    },
    {
      id: '2',
      part: 'part_2_true_false',
      prompt: 'Cho hình chóp S.ABCD đáy hình vuông cạnh a. Xét tính Đúng/Sai:',
      points: 1.0,
    },
    {
      id: '3',
      part: 'part_3_short_answer',
      prompt: 'Tìm giá trị nhỏ nhất của f(x) = x + 4/x trên (0; +\\\\infty):',
      correctAnswer: '4',
      points: 0.5,
    }
  ]);

  // State PDF
  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any | null>(null);

  const handleAddQuestion = (part: string) => {
    const newQ = {
      id: Date.now().toString(),
      part,
      prompt: \`Câu hỏi mới \${questions.length + 1} chuẩn BGD...\`,
      points: part === 'part_2_true_false' ? 1.0 : part === 'part_1_mcq' ? 0.25 : 0.5,
      correctAnswer: 'A',
    };
    setQuestions(prev => [...prev, newQ]);
  };

  const handlePublish = () => {
    Alert.alert('Xuất bản thành công', \`Đề thi "\${examTitle}" đã được đưa vào hệ thống với \${questions.length} câu hỏi!\`);
  };

  const handlePickAndParsePDF = async () => {
    setIsParsing(true);
    setFileName('De_Thi_Thu_Toan_THPT_2025.pdf');

    setTimeout(() => {
      setParsedData({
        title: 'Đề Khảo Sát Chất Lượng Toán 12 - Năm Học 2024-2025',
        totalQuestions: 22,
        partCounts: { part1: 12, part2: 4, part3: 6 },
        isValidatedByZod: true
      });
      setIsParsing(false);
    }, 1800);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">Cổng Giáo Viên</Text>
          <Text className="text-xs text-slate-500">Biên soạn thủ công & AI Parser chuẩn BGD 2025</Text>
        </View>

        {/* Mode switcher */}
        <View className="flex-row bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <TouchableOpacity
            onPress={() => setMode('manual')}
            className={\`px-3 py-1.5 rounded-lg \${mode === 'manual' ? 'bg-blue-600' : ''}\`}
          >
            <Text className={\`text-xs font-bold \${mode === 'manual' ? 'text-white' : 'text-slate-600'}\`}>Thủ công</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('pdf')}
            className={\`px-3 py-1.5 rounded-lg \${mode === 'pdf' ? 'bg-blue-600' : ''}\`}
          >
            <Text className={\`text-xs font-bold \${mode === 'pdf' ? 'text-white' : 'text-slate-600'}\`}>AI PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {mode === 'manual' ? (
          <View>
            {/* Metadata Card */}
            <View className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4">
              <Text className="text-xs font-bold text-slate-500 mb-1">Tên đề thi:</Text>
              <TextInput
                value={examTitle}
                onChangeText={setExamTitle}
                className="h-11 px-3 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
              />
            </View>

            {/* Quick Add Question Toolbar */}
            <View className="flex-row gap-2 mb-4">
              <TouchableOpacity
                onPress={() => handleAddQuestion('part_1_mcq')}
                className="flex-1 py-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl items-center border border-blue-200"
              >
                <Text className="text-xs font-bold text-blue-700 dark:text-blue-400">+ Phần 1 (MCQ)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleAddQuestion('part_2_true_false')}
                className="flex-1 py-2.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl items-center border border-purple-200"
              >
                <Text className="text-xs font-bold text-purple-700 dark:text-purple-400">+ Phần 2 (Đ/S)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleAddQuestion('part_3_short_answer')}
                className="flex-1 py-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl items-center border border-amber-200"
              >
                <Text className="text-xs font-bold text-amber-700 dark:text-amber-400">+ Phần 3 (Ngắn)</Text>
              </TouchableOpacity>
            </View>

            {/* Questions List */}
            {questions.map((q, idx) => (
              <View key={q.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xs font-bold text-blue-600">Câu {idx + 1} ({q.part})</Text>
                  <TouchableOpacity onPress={() => setQuestions(prev => prev.filter(item => item.id !== q.id))}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <Text className="text-xs font-semibold text-slate-800 dark:text-slate-200">{q.prompt}</Text>
              </View>
            ))}

            {/* Publish Button */}
            <TouchableOpacity
              onPress={handlePublish}
              className="w-full h-13 bg-blue-600 rounded-2xl items-center justify-center flex-row gap-2 mt-4"
            >
              <Save size={18} color="#FFFFFF" />
              <Text className="text-white font-bold text-sm">Xuất Bản Đề Thi ({questions.length} câu)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Upload Zone */}
            <TouchableOpacity
              onPress={handlePickAndParsePDF}
              className="w-full border-2 border-dashed border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-3xl p-8 items-center justify-center mb-6"
            >
              <FileUp size={48} color="#2563EB" />
              <Text className="text-base font-bold text-blue-700 dark:text-blue-400 mt-3">Chọn tệp PDF đề thi Toán</Text>
              <Text className="text-xs text-slate-500 mt-1">Hỗ trợ định dạng PDF chuẩn BGD (Tối đa 25MB)</Text>
            </TouchableOpacity>

            {isParsing && (
              <View className="items-center py-6">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-sm font-semibold text-slate-600 mt-3">AI đang đọc nội dung & xác thực Zod...</Text>
              </View>
            )}

            {parsedData && (
              <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <View className="flex-row items-center gap-2 mb-4">
                  <CheckCircle2 size={20} color="#10B981" />
                  <Text className="text-sm font-bold text-emerald-600">Đã bóc tách thành công (Zod Validated)</Text>
                </View>
                <Text className="text-base font-bold text-slate-900 dark:text-white mb-2">{parsedData.title}</Text>
                <TouchableOpacity onPress={handlePublish} className="w-full h-12 bg-blue-600 rounded-2xl items-center justify-center mt-4">
                  <Text className="text-white font-bold text-sm">Phê Duyệt & Xuất Bản Đề Thi</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
`;
