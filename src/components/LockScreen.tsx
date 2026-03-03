import { useState, useEffect, useCallback, useRef } from 'react';
import { Lock, Eye, EyeOff, Fingerprint, ShieldCheck, AlertTriangle, Delete, Timer, Check } from 'lucide-react';
import { verifyPassword } from './Settings';
import { playClick, playSuccess, playError } from '../utils/sounds';
import DigitProLogo from './DigitProLogo';

interface LockScreenProps {
  onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [unlocking, setUnlocking] = useState(false);
  const [time, setTime] = useState(new Date());
  const inputRef = useRef<HTMLInputElement>(null);

  // Update time
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Lock timer countdown
  useEffect(() => {
    if (lockTimer > 0) {
      const t = setInterval(() => {
        setLockTimer(prev => {
          if (prev <= 1) {
            setLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(t);
    }
  }, [lockTimer]);

  // Focus input
  useEffect(() => {
    if (!locked) inputRef.current?.focus();
  }, [locked]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }, []);

  const handleSubmit = useCallback(() => {
    if (locked || !pin.trim()) return;

    if (verifyPassword(pin)) {
      playSuccess();
      setUnlocking(true);
      setTimeout(() => onUnlock(), 800);
    } else {
      playError();
      triggerShake();
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin('');

      if (newAttempts >= 5) {
        setLocked(true);
        setLockTimer(30);
        setError('تم قفل التطبيق لمدة 30 ثانية ⏳');
      } else if (newAttempts >= 3) {
        setError(`كلمة المرور خاطئة!(${5 - newAttempts} محاولات متبقية) ⚠️`);
      } else {
        setError('كلمة المرور غير صحيحة ❌');
      }
    }
  }, [pin, locked, attempts, onUnlock, triggerShake]);

  const handlePinPad = (num: string) => {
    if (locked) return;
    playClick();
    setError('');
    if (num === 'del') {
      setPin(prev => prev.slice(0, -1));
    } else if (num === 'enter') {
      handleSubmit();
    } else if (pin.length < 20) {
      setPin(prev => prev + num);
    }
  };

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('ar-u-nu-latn', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex lg:flex-row flex-col items-center justify-center lg:gap-20 gap-10 p-6 transition-all duration-800 ${unlocking ? 'lock-screen-exit' : 'lock-screen-enter'}`}
      style={{ background: 'var(--bg-main)' }}
      dir="rtl"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full lock-particle"
            style={{
              width: Math.random() * 5 + 1,
              height: Math.random() * 5 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `var(--accent-${(i % 5) + 1})`,
              opacity: Math.random() * 0.2 + 0.05,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 12 + 8}s`,
            }}
          />
        ))}
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.07] breathing pointer-events-none" style={{ background: 'var(--accent-1)' }} />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.05] breathing pointer-events-none" style={{ background: 'var(--accent-2)', animationDelay: '3s' }} />

      {/* Time & Date Display */}
      <div className="lg:text-right text-center lg:mb-0 mb-4 relative z-10 lg:min-w-[400px]">
        <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black mb-4 t-gradient-text tabular-nums leading-none" style={{ letterSpacing: '-0.02em', filter: 'drop-shadow(0 0 30px var(--shadow-accent))' }}>
          {formatTime(time)}
        </h1>
        <div className="flex flex-col lg:items-start items-center gap-2">
          <p className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            {formatDate(time)}
          </p>
          <div className="h-1 w-24 rounded-full mt-2" style={{ background: 'var(--gradient-primary)', opacity: 0.6 }} />
        </div>
      </div>

      {/* Lock Card Section */}
      <div className={`relative z-10 w-full max-w-md mx-auto lg:mx-0 ${shake ? 'lock-shake' : ''}`}>
        <div
          className="rounded-[40px] p-8 space-y-6 shimmer relative overflow-hidden"
          style={{
            background: 'var(--bg-glass-strong)',
            border: '1px solid var(--border-card)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(50px)',
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-br from-white/5 to-transparent" />

          {/* Lock Icon Section */}
          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-700 ${locked ? '' : 'pulse-glow'} shadow-2xl`}
              style={{
                background: locked ? 'rgba(244, 63, 94, 0.1)' : unlocking ? 'rgba(16, 185, 129, 0.1)' : 'var(--gradient-primary)',
                border: `1px solid ${locked ? 'rgba(244, 63, 94, 0.2)' : unlocking ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)'}`,
                transform: unlocking ? 'scale(1.1) rotate(360deg)' : 'scale(1)',
              }}
            >
              {locked ? (
                <Timer size={40} color="#F43F5E" className="animate-pulse" />
              ) : unlocking ? (
                <Check size={40} color="#10B981" className="check-pop" />
              ) : (
                <Lock size={40} style={{ color: 'var(--text-on-accent)' }} />
              )}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {locked ? '🔒 مقفل مؤقتاً' : unlocking ? '✅ تم التحقق' : '🔐 التحقق من الهوية'}
              </h2>
              <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
                {locked ? `يرجى الانتظار ${lockTimer} ثانية` : unlocking ? 'يتم الآن إلغاء القفل...' : 'أدخل الرقم السري للوصول لبياناتك'}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-xs font-bold card-enter"
              style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E', border: '1px solid rgba(244, 63, 94, 0.2)' }}
            >
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          {!unlocking && (
            <>
              <div className="relative group">
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={pin}
                  onChange={e => { setPin(e.target.value); setError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                  placeholder={locked ? 'محمي...' : '••••'}
                  disabled={locked}
                  className="t-input w-full text-center text-3xl font-black py-5 rounded-[22px] transition-all"
                  dir="ltr"
                  autoFocus
                  style={{
                    letterSpacing: (showPassword || pin.length === 0) ? '0.05em' : '0.4em',
                    opacity: locked ? 0.5 : 1,
                    background: 'var(--bg-input)',
                    border: '2px solid var(--border-input)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => { playClick(); setShowPassword(!showPassword); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 btn-press p-2 rounded-xl transition-colors hover:bg-white/5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
                <div className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--accent-1)' }}>
                  <Fingerprint size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* PIN Dots */}
              <div className="flex items-center justify-center gap-3 py-2">
                {pin.length === 0 ? (
                  <div className="flex items-center gap-2 opacity-60">
                    <ShieldCheck size={14} style={{ color: 'var(--accent-1)' }} />
                    <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>نظام حماية DigitPro نشط</p>
                  </div>
                ) : (
                  <div className="flex gap-2.5">
                    {Array.from({ length: Math.min(pin.length, 12) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-3.5 h-3.5 rounded-full transition-all duration-500 scale-100"
                        style={{
                          background: 'var(--gradient-primary)',
                          boxShadow: '0 0 15px var(--shadow-accent)',
                          animation: 'dotPop 0.4s cubic-bezier(0.68, -0.6, 0.3, 1.6) forwards',
                        }}
                      />
                    ))}
                    {pin.length > 12 && (
                      <span className="text-xs font-black px-2 py-0.5 rounded-lg" style={{ background: 'var(--badge-bg)', color: 'var(--accent-1)' }}>+{pin.length - 12}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-3">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'enter'].map(key => (
                  <button
                    key={key}
                    onClick={() => handlePinPad(key)}
                    disabled={locked}
                    className={`h-16 sm:h-20 rounded-[24px] font-black text-2xl transition-all btn-press flex items-center justify-center border-2 ${locked ? 'opacity-20 translate-y-2' : ''}`}
                    style={{
                      background: key === 'enter' ? 'var(--gradient-primary)' : key === 'del' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      borderColor: key === 'enter' ? 'transparent' : key === 'del' ? 'rgba(244, 63, 94, 0.2)' : 'var(--border-input)',
                      color: key === 'enter' ? 'var(--text-on-accent)' : key === 'del' ? '#F43F5E' : 'var(--text-primary)',
                      boxShadow: key === 'enter' ? '0 10px 30px var(--shadow-accent)' : 'none',
                    }}
                  >
                    {key === 'del' ? <Delete size={28} /> : key === 'enter' ? <Check size={28} /> : key}
                  </button>
                ))}
              </div>

              {/* Locked Timer */}
              {locked && lockTimer > 0 && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold" style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                    <Timer size={14} className="animate-spin" />
                    <span>إعادة المحاولة بعد {lockTimer} ثانية</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 flex flex-col items-center gap-2">
          <DigitProLogo size={28} variant="badge" showText animated />
          <p className="text-[10px] font-bold flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            🔒 LevelUp Life • محمي بواسطة <span style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 900 }}>DigitPro</span>
          </p>
        </div>
      </div>
    </div>
  );
}
