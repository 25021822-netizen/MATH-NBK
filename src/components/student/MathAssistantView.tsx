import React, { useState } from 'react';
import { Bot, Camera, Sparkles } from 'lucide-react';
import { AccountTier } from '../../types/math';
import { CameraScannerView } from './CameraScannerView';
import { SocraticTutorView } from './SocraticTutorView';

interface MathAssistantViewProps {
  dailyScanCount: number;
  maxDailyScans: number;
  tier: AccountTier;
  onIncrementScan: () => void;
  onUpgradeTier: () => void;
  initialMode?: 'scanner' | 'tutor';
}

export const MathAssistantView: React.FC<MathAssistantViewProps> = ({
  dailyScanCount,
  maxDailyScans,
  tier,
  onIncrementScan,
  onUpgradeTier,
  initialMode = 'scanner',
}) => {
  const [mode, setMode] = useState<'scanner' | 'tutor'>(initialMode);
  const [tutorQuestion, setTutorQuestion] = useState('');

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pt-8">
      <div className="mb-6 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-blue-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Trợ Lý Toán AI</h1>
            <p className="mt-1 text-sm text-slate-600">
              Quét đề bài, xem hướng dẫn và tiếp tục tự khám phá lời giải cùng gia sư Socratic.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
          <button
            type="button"
            onClick={() => setMode('scanner')}
            aria-pressed={mode === 'scanner'}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-colors ${
              mode === 'scanner'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera size={17} />
            Quét bài tập AI
          </button>
          <button
            type="button"
            onClick={() => setMode('tutor')}
            aria-pressed={mode === 'tutor'}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-colors ${
              mode === 'tutor'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot size={17} />
            Gia sư Socratic
          </button>
        </div>
      </div>

      <div className={mode === 'scanner' ? 'block' : 'hidden'}>
        <CameraScannerView
          dailyScanCount={dailyScanCount}
          maxDailyScans={maxDailyScans}
          tier={tier}
          onIncrementScan={onIncrementScan}
          onUpgradeTier={onUpgradeTier}
          onAskTutor={(question) => {
            setTutorQuestion(question);
            setMode('tutor');
          }}
        />
      </div>
      <div className={mode === 'tutor' ? 'block' : 'hidden'}>
        <SocraticTutorView initialQuestion={tutorQuestion} />
      </div>
    </div>
  );
};
