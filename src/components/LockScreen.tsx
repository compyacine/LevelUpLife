
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
    return d.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div
      className={`fixed inset - 0 z - [9999] flex flex - col items - center justify - center transition - all duration - 800 ${unlocking ? 'lock-screen-exit' : 'lock-screen-enter'} `}
      style={{
        background: 'var(--bg-main)',
      }}
      dir="rtl"
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full lock-particle"
            style={{
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              left: `${Math.random() * 100}% `,
              top: `${Math.random() * 100}% `,
              background: `var(--accent - ${(i % 5) + 1})`,
              opacity: Math.random() * 0.15 + 0.03,
              animationDelay: `${Math.random() * 5} s`,
              animationDuration: `${Math.random() * 10 + 5} s`,
            }}
          />
        ))}
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-[100px] opacity-10 breathing" style={{ background: 'var(--accent-1)' }} />
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full blur-[80px] opacity-10 breathing" style={{ background: 'var(--accent-2)', animationDelay: '2s' }} />

      {/* Time Display */}
      <div className="text-center mb-8 relative z-10">
        <h1 className="text-6xl sm:text-7xl font-black mb-2 t-gradient-text tabular-nums" style={{ letterSpacing: '0.05em' }}>
          {formatTime(time)}
        </h1>
        <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
          {formatDate(time)}
        </p>
      </div>

      {/* Lock Card */}
      <div
        className={`relative z - 10 w - full max - w - sm mx - auto px - 6 ${shake ? 'lock-shake' : ''} `}
      >
        <div
          className="rounded-3xl p-6 space-y-5 shimmer"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(30px)',
          }}
        >
          {/* Lock Icon */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={`w - 20 h - 20 rounded - full flex items - center justify - center transition - all duration - 500 ${locked ? '' : 'pulse-glow'} `}
              style={{
                background: locked ? 'rgba(244, 63, 94, 0.15)' : unlocking ? 'rgba(16, 185, 129, 0.15)' : 'var(--gradient-primary)',
                boxShadow: locked ? '0 8px 30px rgba(244, 63, 94, 0.3)' : unlocking ? '0 8px 30px rgba(16, 185, 129, 0.3)' : '0 8px 30px var(--shadow-accent)',
              }}
            >
              {locked ? (
                <Timer size={32} color="#F43F5E" className="animate-pulse" />
              ) : unlocking ? (
                <ShieldCheck size={32} color="#10B981" className="check-pop" />
              ) : (
                <Lock size={32} style={{ color: 'var(--text-on-accent)' }} />
              )}
            </div>
            <div className="text-center">
              <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                {locked ? '🔒 تم القفل مؤقتاً' : unlocking ? '✅ مرحباً بك!' : '🔐 أدخل كلمة المرور'}
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {locked
                  ? `انتظر ${lockTimer} ثانية`
                  : unlocking
                    ? 'جارٍ فتح التطبيق...'
                    : 'التطبيق محمي بكلمة مرور'}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-xs font-bold card-enter"
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                color: '#F43F5E',
                border: '1px solid rgba(244, 63, 94, 0.2)',
              }}
            >
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          {/* Password Input */}
          {!unlocking && (
            <>
              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={pin}
                  onChange={e => { setPin(e.target.value); setError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                  placeholder={locked ? 'مقفل...' : 'أدخل كلمة المرور'}
                  disabled={locked}
                  className="t-input w-full text-center text-lg font-bold pl-12 pr-12"
                  dir="rtl"
                  autoFocus
                  style={{
                    letterSpacing: showPassword ? 'normal' : '0.3em',
                    opacity: locked ? 0.5 : 1,
                  }}
                />
                <button
                  type="button"
                  onClick={() => { playClick(); setShowPassword(!showPassword); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 btn-press p-1 rounded-lg"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--accent-1)' }}
                >
                  <Fingerprint size={18} />
                </div>
              </div>

              {/* PIN Dots */}
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: Math.min(pin.length, 12) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      background: 'var(--accent-1)',
                      boxShadow: '0 0 8px var(--shadow-accent)',
                      animation: 'dotPop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
                      animationDelay: `${i * 0.05} s`,
                    }}
                  />
                ))}
                {pin.length === 0 && (
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    أدخل كلمة المرور أعلاه أو استخدم لوحة الأرقام
                  </p>
                )}
                {pin.length > 12 && (
                  <span className="text-[10px] font-bold" style={{ color: 'var(--accent-1)' }}>+{pin.length - 12}</span>
                )}
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'enter'].map(key => (
                  <button
                    key={key}
                    onClick={() => handlePinPad(key)}
                    disabled={locked}
                    className={`h - 14 rounded - 2xl font - black text - xl transition - all btn - press flex items - center justify - center ${locked ? 'opacity-30' : ''} `}
                    style={{
                      background: key === 'enter'
                        ? 'var(--gradient-primary)'
                        : key === 'del'
                          ? 'rgba(244, 63, 94, 0.1)'
                          : 'var(--bg-input)',
                      border: `1px solid ${key === 'enter' ? 'transparent' : key === 'del' ? 'rgba(244, 63, 94, 0.2)' : 'var(--border-input)'} `,
                      color: key === 'enter'
                        ? 'var(--text-on-accent)'
                        : key === 'del'
                          ? '#F43F5E'
                          : 'var(--text-primary)',
                      boxShadow: key === 'enter' ? '0 4px 15px var(--shadow-accent)' : 'none',
                    }}
                  >
                    {key === 'del' ? <Delete size={20} /> : key === 'enter' ? <Check size={20} /> : key}
                  </button>
                ))}
              </div>

              {/* Locked Timer */}
              {locked && lockTimer > 0 && (
                <div className="text-center">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E', border: '1px solid rgba(244, 63, 94, 0.2)' }}
                  >
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
            🔒 LevelUp Life • محمي بواسطة
            <span style={{
              background: 'linear-gradient(135deg, #6366F1, #A855F7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 900,
            }}>DigitPro</span>
          </p>
        </div>
      </div>
    </div>
  );
}
