
import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, CheckCircle2, Volume2, VolumeX, Flame, Timer } from 'lucide-react';
import { getTasks, addFocusSession } from '../db/database';
import { playStartTimer, playPauseTimer, playTimerComplete, playTick, isSoundEnabled, setSoundEnabled } from '../utils/sounds';
import { showFocusCompleteToast, triggerConfetti } from '../utils/toastStore';
import { useTheme } from '../contexts/ThemeContext';

interface FocusTimerProps { onRefresh: () => void; }
type TimerMode = 'focus' | 'short_break' | 'long_break';

const focusTips = ['أغلق جميع الإشعارات 📴', 'ركز على مهمة واحدة فقط 🎯', 'خذ نفساً عميقاً 🌬️', 'اجلس بشكل مريح 🪑', 'اشرب الماء 💧', 'ابتعد عن المشتتات 🚫'];

export default function FocusTimer({ onRefresh }: FocusTimerProps) {
  const { config } = useTheme();
  const c = config.preview;

  const PRESETS: Record<TimerMode, { label: string; minutes: number; c1: string; c2: string; icon: React.ReactNode; emoji: string }> = {
    focus: { label: 'تركيز عميق', minutes: 25, c1: c[0], c2: c[1], icon: <Brain size={20} />, emoji: '🧠' },
    short_break: { label: 'استراحة قصيرة', minutes: 5, c1: c[2], c2: c[3] || c[1], icon: <Coffee size={20} />, emoji: '☕' },
    long_break: { label: 'استراحة طويلة', minutes: 15, c1: c[1], c2: c[2], icon: <Coffee size={20} />, emoji: '🌴' },
  };

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(PRESETS.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [sessions, setSessions] = useState(0);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [startTime, setStartTime] = useState<string | null>(null);
  const [tipIdx] = useState(() => Math.floor(Math.random() * focusTips.length));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef(0);

  const tasks = getTasks().filter(t => t.status === 'pending');
  const preset = PRESETS[mode];

  const completeSession = useCallback(() => {
    if (mode === 'focus' && startTime) {
      addFocusSession({ task_id: selectedTaskId, start_time: startTime, end_time: new Date().toISOString(), duration_minutes: PRESETS.focus.minutes, completed: 1 });
      setSessions(s => s + 1);
      onRefresh();
      showFocusCompleteToast(PRESETS.focus.minutes);
      if ((sessions + 1) % 4 === 0) triggerConfetti();
    }
    playTimerComplete();
    setIsRunning(false);
    setStartTime(null);
    if (mode === 'focus') {
      const next = sessions + 1;
      if (next % 4 === 0) { setMode('long_break'); setTimeLeft(PRESETS.long_break.minutes * 60); }
      else { setMode('short_break'); setTimeLeft(PRESETS.short_break.minutes * 60); }
    } else { setMode('focus'); setTimeLeft(PRESETS.focus.minutes * 60); }
  }, [mode, startTime, selectedTaskId, sessions, onRefresh, PRESETS]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { completeSession(); return 0; }
          const now = Date.now();
          if (now - lastTickRef.current > 30000) { playTick(); lastTickRef.current = now; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, completeSession]);

  const toggleTimer = () => { if (!isRunning) { if (!startTime) setStartTime(new Date().toISOString()); playStartTimer(); } else { playPauseTimer(); } setIsRunning(!isRunning); };
  const resetTimer = () => { setIsRunning(false); setStartTime(null); setTimeLeft(PRESETS[mode].minutes * 60); };
  const switchMode = (m: TimerMode) => { setIsRunning(false); setStartTime(null); setMode(m); setTimeLeft(PRESETS[m].minutes * 60); };
  const toggleSound = () => { const n = !soundOn; setSoundOn(n); setSoundEnabled(n); };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalTime = PRESETS[mode].minutes * 60;
  const progress = 1 - timeLeft / totalTime;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-black flex items-center justify-center gap-3" style={{ color: 'var(--text-primary)' }}>
          <span className="text-4xl">{preset.emoji}</span> جلسات التركيز

        </h2>
        <p className="mt-2" style={{ color: 'var(--text-muted)' }}>تقنية بومودورو لزيادة إنتاجيتك</p>
      </div>

      <div className="flex justify-center gap-3">
        {(Object.entries(PRESETS) as [TimerMode, typeof PRESETS.focus][]).map(([key, val]) => (
          <button key={key} onClick={() => switchMode(key)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition-all btn-press"
            style={{ background: mode === key ? `linear-gradient(135deg, ${val.c1}, ${val.c2})` : 'var(--bg-card)', color: mode === key ? 'var(--text-on-accent)' : 'var(--text-muted)', border: mode === key ? 'none' : '1px solid var(--border-card)', boxShadow: mode === key ? `0 8px 25px ${val.c1}30` : 'none' }}>
            {val.icon}<span>{val.label}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <div className={`relative w-80 h-80 sm:w-96 sm:h-96 ${isRunning ? 'timer-running' : ''}`}>
          {isRunning && <div className="absolute inset-[-20px] rounded-full breathing-ring" style={{ borderColor: preset.c1, border: `1px solid ${preset.c1}30` }} />}
          <svg className={`w-full h-full transform -rotate-90 timer-circle ${isRunning ? 'timer-glow' : ''}`} viewBox="0 0 300 300">
            <circle cx="150" cy="150" r="140" strokeWidth="3" fill="none" style={{ stroke: 'var(--progress-bg)' }} />
            {Array.from({ length: 60 }, (_, i) => {
              const angle = (i / 60) * 360 - 90;
              const rad = (angle * Math.PI) / 180;
              const r1 = i % 5 === 0 ? 130 : 134;
              return <line key={i} x1={150 + r1 * Math.cos(rad)} y1={150 + r1 * Math.sin(rad)} x2={150 + 138 * Math.cos(rad)} y2={150 + 138 * Math.sin(rad)} stroke={`${preset.c1}${i % 5 === 0 ? '30' : '10'}`} strokeWidth={i % 5 === 0 ? 2 : 1} />;
            })}
            <circle cx="150" cy="150" r="140" stroke="url(#timerGrad)" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000" style={{ filter: isRunning ? `drop-shadow(0 0 8px ${preset.c1}40)` : 'none' }} />
            <defs><linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={preset.c1} /><stop offset="100%" stopColor={preset.c2} /></linearGradient></defs>
          </svg>
          <div className={`absolute inset-0 flex flex-col items-center justify-center ${isRunning ? 'breathing' : ''}`}>
            <p className="text-sm mb-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              {isRunning && <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: preset.c1 }} />}{preset.label}
            </p>
            <p className="text-7xl font-black font-mono tracking-wider" style={{ color: 'var(--text-primary)', textShadow: isRunning ? `0 0 30px ${preset.c1}30` : 'none' }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>الجلسة #{sessions + 1}</p>
              {sessions > 0 && <div className="flex items-center gap-1 text-xs" style={{ color: c[0] }}><Flame size={12} className="streak-fire" /><span>{sessions}</span></div>}
            </div>
          </div>
        </div>
      </div>

      {mode === 'focus' && isRunning && (
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs t-card rounded-full px-4 py-2 inline-flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            نصيحة: {focusTips[tipIdx]}
          </p>
        </div>
      )}

      <div className="flex justify-center gap-4">
        <button onClick={resetTimer} className="p-4 t-card rounded-2xl transition-all btn-press" style={{ color: 'var(--text-muted)' }}><RotateCcw size={22} /></button>
        <button onClick={toggleTimer} className={`px-10 py-4 rounded-2xl font-black text-lg flex items-center gap-3 transition-all btn-press ${!isRunning ? 'pulse-glow' : ''}`}
          style={{ background: `linear-gradient(135deg, ${preset.c1}, ${preset.c2})`, color: 'var(--text-on-accent)', boxShadow: `0 12px 35px ${preset.c1}30` }}>
          {isRunning ? <Pause size={24} /> : <Play size={24} />}{isRunning ? 'إيقاف مؤقت' : 'ابدأ التركيز'}
        </button>
        <button onClick={toggleSound} className="p-4 t-card rounded-2xl transition-all btn-press" style={{ color: soundOn ? c[0] : 'var(--text-muted)' }}>
          {soundOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
        </button>
      </div>

      <div className="max-w-lg mx-auto grid grid-cols-1 gap-4">
        <div className="t-card p-5 card-hover">
          <h3 className="text-sm font-black mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><CheckCircle2 size={16} style={{ color: c[1] }} /> ربط بمهمة</h3>
          <select value={selectedTaskId || ''} onChange={e => setSelectedTaskId(e.target.value ? Number(e.target.value) : null)} className="t-input w-full">
            <option value="">بدون مهمة محددة</option>
            {tasks.map(t => (<option key={t.id} value={t.id}>{t.title}</option>))}
          </select>
        </div>
        <div className="t-card p-5 card-hover">
          <h3 className="text-sm font-black mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Timer size={16} style={{ color: c[0] }} /> إحصائيات اليوم</h3>
          <div className="grid grid-cols-3 gap-4 text-center stagger-children">
            {[{ v: sessions, l: 'جلسات مكتملة', col: c[0] }, { v: sessions * PRESETS.focus.minutes, l: 'دقائق تركيز', col: c[1] }, { v: sessions * 15, l: 'نقاط مكتسبة', col: c[2] }].map((s, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: `${s.col}10`, border: `1px solid ${s.col}20` }}>
                <p className="text-2xl font-black" style={{ color: s.col }}>{s.v}</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
