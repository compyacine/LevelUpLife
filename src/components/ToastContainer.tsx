import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X, Trophy, Flame, Zap, Gift, Star } from 'lucide-react';
import { subscribe, removeToast, Toast, ToastType } from '../utils/toastStore';

const typeConfig: Record<ToastType, { bg: string; border: string; icon: React.ReactNode }> = {
  success: { bg: 'linear-gradient(135deg, #065f4640, #047857CC)', border: '#10b98150', icon: <CheckCircle size={22} color="#6ee7b7" /> },
  achievement: { bg: 'linear-gradient(135deg, #78350f40, #92400eCC)', border: '#f59e0b50', icon: <Trophy size={22} color="#fcd34d" /> },
  levelup: { bg: 'linear-gradient(135deg, #4c1d9540, #5b21b6CC)', border: '#8b5cf650', icon: <Zap size={22} color="#c4b5fd" /> },
  streak: { bg: 'linear-gradient(135deg, #7c2d1240, #9a3412CC)', border: '#f9731650', icon: <Flame size={22} color="#fdba74" /> },
  warning: { bg: 'linear-gradient(135deg, #7f1d1d40, #991b1bCC)', border: '#ef444450', icon: <AlertCircle size={22} color="#fca5a5" /> },
  info: { bg: 'linear-gradient(135deg, #1e3a5f40, #1e40afCC)', border: '#3b82f650', icon: <Info size={22} color="#93c5fd" /> },
  motivational: { bg: 'linear-gradient(135deg, #134e4a40, #0f766eCC)', border: '#14b8a650', icon: <Gift size={22} color="#5eead4" /> },
  points: { bg: 'linear-gradient(135deg, #78350f40, #854d0eCC)', border: '#eab30850', icon: <Star size={22} color="#fde68a" /> },
};

function ToastItem({ toast, index }: { toast: Toast; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const cfg = typeConfig[toast.type];

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    const dur = toast.duration || 4000;
    const timer = setTimeout(() => { setIsVisible(false); setTimeout(() => removeToast(toast.id), 400); }, dur - 400);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration]);

  return (
    <div className={`transform transition-all duration-500 ease-out ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-75'}`} style={{ transitionDelay: `${index * 50}ms` }}>
      <div className="relative overflow-hidden rounded-2xl p-4 pr-5 min-w-[320px] max-w-[420px] shadow-2xl" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, backdropFilter: 'blur(20px)' }}>
        <div className="absolute inset-0 overflow-hidden"><div className="toast-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12" /></div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'rgba(255,255,255,0.1)' }}><div className="h-full rounded-full toast-progress" style={{ background: 'rgba(255,255,255,0.3)', animationDuration: `${toast.duration || 4000}ms` }} /></div>
        <div className="flex items-start gap-3 relative z-10">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center toast-icon-bounce" style={{ background: 'rgba(255,255,255,0.1)' }}>
            {toast.emoji ? <span className="text-xl">{toast.emoji}</span> : cfg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-white">{toast.title}</h4>
              {toast.points && <span className="px-2 py-0.5 rounded-full text-[10px] font-black text-yellow-300 toast-points-pop" style={{ background: 'rgba(255,255,255,0.1)' }}>+{toast.points} ✦</span>}
            </div>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{toast.message}</p>
          </div>
          <button onClick={() => { setIsVisible(false); setTimeout(() => removeToast(toast.id), 300); }} className="flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-white/10">
            <X size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => { const unsub = subscribe(setToasts); return () => { unsub(); }; }, []);
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 left-4 z-[100] flex flex-col gap-3" dir="rtl">
      {toasts.map((toast, i) => <ToastItem key={toast.id} toast={toast} index={i} />)}
    </div>
  );
}
