import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { playClick } from '../utils/sounds';

const TELEGRAM_LINK = 'https://t.me/+QpKqwX1hsxtiZGQ0';

export default function FloatingWhatsApp() {
  const [showBadge, setShowBadge] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowBadge(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const openGroup = () => {
    playClick();
    window.open(TELEGRAM_LINK, '_blank');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={openGroup}
        className="fixed bottom-6 left-6 z-[999] w-14 h-14 rounded-full flex items-center justify-center transition-all btn-press group"
        style={{
          background: 'linear-gradient(135deg, #38BDF8, #3B82F6)',
          color: 'white',
          boxShadow: '0 8px 30px rgba(56, 189, 248, 0.4)',
        }}
        title="انضم لمجموعة الدعم"
      >
        <Send size={24} className="group-hover:scale-110 transition-transform" />

        {/* Notification badge */}
        {showBadge && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center animate-bounce">
            <span className="text-[10px] font-black text-white">1</span>
          </div>
        )}
      </button>

      {/* Tooltip */}
      {showBadge && (
        <div
          className="fixed bottom-8 left-24 z-[998] px-4 py-2 rounded-xl text-xs font-bold animate-pulse"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-primary)',
            boxShadow: '0 4px 20px var(--shadow-card)',
          }}
        >
          <span style={{
            background: 'linear-gradient(135deg, #38BDF8, #3B82F6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 900,
          }}>LevelUp Life - Support Group</span>
          <div
            className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45"
            style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border-card)', borderBottom: '1px solid var(--border-card)' }}
          />
        </div>
      )}
    </>
  );
}

