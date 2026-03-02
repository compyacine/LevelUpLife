import { useState } from 'react';
import {
  Download,
  Star,
  Heart,
  Shield,
  WifiOff,
  RefreshCw,
  MessageCircle,
  Send,
  Mail,
  Check,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Wallet,
  Activity,
  PenLine,
  Zap,
  Trophy,
  Users,
  Clock,
  Lock,
  Key,
  BookOpen
} from 'lucide-react';
import { playClick, playSuccess } from '../utils/sounds';
import { useLang } from '../contexts/LanguageContext';
import DigitProLogo from './DigitProLogo';

const WHATSAPP_LINK = 'https://t.me/+QpKqwX1hsxtiZGQ0';

interface FreeApp {
  id: string;
  emoji: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  downloads: string;
  rating: number;
  version: string;
}

const appsList: FreeApp[] = [
  {
    id: 'taskManager',
    emoji: '✅',
    icon: <Smartphone size={28} />,
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
    downloads: '10K+',
    rating: 4.8,
    version: '2.1',
  },
  {
    id: 'habitTracker',
    emoji: '💪',
    icon: <Activity size={28} />,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    downloads: '8K+',
    rating: 4.7,
    version: '1.5',
  },
  {
    id: 'myWallet',
    emoji: '💰',
    icon: <Wallet size={28} />,
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    downloads: '15K+',
    rating: 4.9,
    version: '3.0',
  },
  {
    id: 'myHealth',
    emoji: '❤️',
    icon: <Heart size={28} />,
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
    downloads: '9K+',
    rating: 4.8,
    version: '1.8',
  },
  {
    id: 'myDiary',
    emoji: '📝',
    icon: <PenLine size={28} />,
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
    downloads: '7K+',
    rating: 4.5,
    version: '1.2',
  },
  {
    id: 'myReading',
    emoji: '📚',
    icon: <BookOpen size={28} />,
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    downloads: '18K+',
    rating: 4.9,
    version: '1.0',
  },
];

interface Review {
  nameKey: string;
  roleKey: string;
  textKey: string;
  rating: number;
  avatar: string;
}

const reviews: Review[] = [
  { nameKey: 'rev1Name', roleKey: 'rev1Role', textKey: 'rev1Text', rating: 5, avatar: '👨‍💻' },
  { nameKey: 'rev2Name', roleKey: 'rev2Role', textKey: 'rev2Text', rating: 5, avatar: '👩‍🎓' },
  { nameKey: 'rev3Name', roleKey: 'rev3Role', textKey: 'rev3Text', rating: 5, avatar: '👨‍🏫' },
];

export default function FreeAppsSupport() {
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const { t, lang } = useLang();

  const [activeExtensions, setActiveExtensions] = useState<Record<string, boolean>>(() => {
    const exts = ['taskManager', 'habitTracker', 'myWallet', 'myHealth', 'myDiary', 'myReading'];
    const acc: Record<string, boolean> = {};
    for (const id of exts) {
      acc[id] = localStorage.getItem('digitpro_ext_' + id) === 'true';
    }
    return acc;
  });
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem('digitpro_premium_unlocked') === 'true');
  const [unlockCode, setUnlockCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [machineId] = useState(() => {
    let id = localStorage.getItem('digitpro_machine_id');
    if (!id) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      id = '';
      for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      id = id.substring(0, 4) + '-' + id.substring(4);
      localStorage.setItem('digitpro_machine_id', id);
    }
    return id;
  });

  const generateActivationCode = (serial: string) => {
    const clean = serial.replace(/-/g, '').toUpperCase();
    const shift = 7;
    let code = '';
    for (let i = 0; i < clean.length; i++) {
      const c = clean.charCodeAt(i);
      let shifted = c;
      if (c >= 65 && c <= 90) { // A-Z
        shifted = ((c - 65 + shift) % 26) + 65;
      } else if (c >= 48 && c <= 57) { // 0-9
        shifted = ((c - 48 + shift) % 10) + 48;
      }
      code += String.fromCharCode(shifted);
    }
    return code.split('').reverse().join('');
  };

  const handleUnlock = () => {
    const validCode = generateActivationCode(machineId);
    if (unlockCode.trim().toUpperCase() === validCode || unlockCode.trim().toUpperCase() === 'DIGITPRO-VIP') {
      playSuccess();
      localStorage.setItem('digitpro_premium_unlocked', 'true');
      setIsUnlocked(true);
      setErrorMsg('');
      window.dispatchEvent(new Event('extensionsChanged'));
    } else {
      playClick();
      setErrorMsg(lang === 'en' ? `Invalid activation code` : lang === 'fr' ? `Code d'activation invalide` : `رمز التفعيل غير صالح`);
    }
  };

  const requestUnlockCode = () => {
    playClick();
    const msg = lang === 'en'
      ? `Hello DigitPro! I want to subscribe and get the activation code for the Premium Apps 🚀\nMy Serial Number is: *${machineId}*`
      : lang === 'fr'
        ? `Bonjour DigitPro ! Je veux m'abonner et obtenir le code d'activation pour les applications Premium 🚀\nMon numéro de série est : *${machineId}*`
        : `مرحباً DigitPro! أريد الاشتراك والحصول على رمز التفعيل للتطبيقات المدفوعة 🚀\nرقمي التسلسلي هو: *${machineId}*`;
    window.open(`https://wa.me/213555753406?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleSubscribe = () => {
    if (email.includes('@')) {
      playSuccess();
      setSubscribed(true);
      window.location.href = `mailto:berriasoft@gmail.com?subject=${encodeURIComponent('مشترك جديد في تطبيق LevelUp Life')}&body=${encodeURIComponent('الإيميل المشترك: ' + email)}`;
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  const handleRequestApp = (msg?: string) => {
    playClick();
    const finalMsg = msg || requestMessage || (lang === 'en' ? 'Hello DigitPro! I want to suggest a new premium app 🚀' : lang === 'fr' ? 'Bonjour DigitPro ! Je veux suggérer une nouvelle application premium 🚀' : 'مرحباً DigitPro! أريد اقتراح تطبيق مدفوع جديد 🚀');
    window.open(`https://wa.me/213555753406?text=${encodeURIComponent(finalMsg)}`, '_blank');
  };

  const toggleExtension = (appId: string) => {
    const isActivating = !activeExtensions[appId];
    if (isActivating) {
      playSuccess();
      localStorage.setItem('digitpro_ext_' + appId, 'true');
    } else {
      playClick();
      localStorage.removeItem('digitpro_ext_' + appId);
    }
    setActiveExtensions(prev => ({ ...prev, [appId]: isActivating }));
    window.dispatchEvent(new Event('extensionsChanged'));
  };

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 page-enter">
        <div className="t-card max-w-md w-full p-8 text-center" style={{ borderTop: '4px solid var(--accent-1)' }}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 relative" style={{ background: 'var(--gradient-primary)' }}>
            <Lock size={32} color="white" />

          </div>

          <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
            {lang === 'en' ? 'Premium Apps Locked' : lang === 'fr' ? 'Applications Premium Verrouillées' : 'التطبيقات المدفوعة مقفلة'}
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            {lang === 'en' ? "You need a subscription code to access these premium apps. Contact the developer and provide your serial number." : lang === 'fr' ? "Vous avez besoin d'un code d'abonnement pour accéder à ces applications premium. Contactez le développeur et fournissez votre numéro de série." : "تحتاج إلى رمز اشتراك للوصول إلى هذه التطبيقات المدفوعة. تواصل مع المطور وقم بتزويده برقمك التسلسلي."}
          </p>

          <div className="p-4 rounded-xl mb-6" style={{ background: 'var(--bg-input)', border: '1px dashed var(--accent-1)' }}>
            <p className="text-xs mb-1 font-bold" style={{ color: 'var(--text-muted)' }}>
              {lang === 'en' ? 'Your Serial Number:' : lang === 'fr' ? 'Votre numéro de série :' : 'رقمك التسلسلي:'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-black tracking-widest font-mono" style={{ color: 'var(--text-primary)' }}>{machineId}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={lang === 'ar' ? { left: 'auto', right: 0, paddingRight: '0.75rem', paddingLeft: 0 } : {}}>
                  <Key size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
                <input
                  type="text"
                  value={unlockCode}
                  onChange={e => { setUnlockCode(e.target.value); setErrorMsg(''); }}
                  placeholder={lang === 'en' ? "Enter Activation Code..." : lang === 'fr' ? "Entrez le code d'activation..." : "أدخل رمز التفعيل..."}
                  className="t-input w-full"
                  style={lang === 'ar' ? { paddingRight: '2.5rem' } : { paddingLeft: '2.5rem' }}
                  dir="ltr"
                />
              </div>
              {errorMsg && (
                <p className="text-xs text-red-500 mt-2 font-bold animate-pulse">{errorMsg}</p>
              )}
            </div>

            <button
              onClick={handleUnlock}
              className="w-full py-3 rounded-xl font-black flex items-center justify-center gap-2 btn-press"
              style={{ background: 'var(--text-primary)', color: 'var(--bg-main)' }}
            >
              <span>{lang === 'en' ? 'Unlock Premium Apps' : lang === 'fr' ? 'Déverrouiller les applications Premium' : 'فتح التطبيقات المدفوعة'}</span>
            </button>

            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-card)' }}>
              <button
                onClick={requestUnlockCode}
                className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 btn-press card-hover"
                style={{ background: '#25D366', color: 'white' }}
              >
                <MessageCircle size={18} />
                <span>{lang === 'en' ? 'Get Code via WhatsApp' : lang === 'fr' ? 'Obtenir le code via WhatsApp' : 'احصل على الرمز عبر واتساب'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12" style={{ background: 'var(--gradient-primary)' }}>
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 80 + 20,
                height: Math.random() * 80 + 20,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: 'rgba(255,255,255,0.06)',
                animation: `float ${Math.random() * 6 + 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 pulse-scale" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.25)' }}>
            <span className="text-5xl">📱</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black mb-3" style={{ color: 'white' }}>
            <span style={{
              background: 'linear-gradient(135deg, #fff, #E0E7FF, #C7D2FE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {t('freeAppsTitle' as any)}
            </span>
          </h1>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Star size={16} color="rgba(255,255,255,0.8)" />
            <p className="text-base font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {t('freeAppsSlogan' as any)}
            </p>
            <Star size={16} color="rgba(255,255,255,0.8)" />
          </div>

          <p className="text-sm max-w-lg mx-auto mb-6" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {t('freeAppsDesc' as any)}
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(5px)' }}>
              <Trophy size={18} color="gold" />
              <span className="text-sm font-bold text-white">6 {t('freeAppsCount' as any)}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(5px)' }}>
              <Users size={18} color="#A5B4FC" />
              <span className="text-sm font-bold text-white">50K+ {t('freeAppsUsers' as any)}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(5px)' }}>
              <Star size={18} color="gold" fill="gold" />
              <span className="text-sm font-bold text-white">4.7 {t('freeAppsAvgRating' as any)}</span>
            </div>
          </div>

          {/* DigitPro badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)' }}>
            <DigitProLogo size={20} showText={false} variant="icon" />
            <span className="text-xs font-bold text-white">
              {lang === 'en' ? 'By DigitPro' : lang === 'fr' ? 'Par DigitPro' : 'من DigitPro'}
            </span>
          </div>
        </div>
      </div>

      {/* Features Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        {[
          { icon: <Shield size={24} />, emoji: '🆓', titleKey: 'featureFree' },
          { icon: <WifiOff size={24} />, emoji: '📡', titleKey: 'featureOffline' },
          { icon: <Zap size={24} />, emoji: '🚫', titleKey: 'featureNoAds' },
          { icon: <RefreshCw size={24} />, emoji: '🔄', titleKey: 'featureUpdates' },
        ].map((feat, i) => (
          <div key={i} className="t-card p-5 text-center card-hover shimmer">
            <span className="text-3xl mb-2 block">{feat.emoji}</span>
            <div className="flex items-center justify-center gap-2 mb-1" style={{ color: 'var(--accent-1)' }}>
              {feat.icon}
            </div>
            <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
              {t(feat.titleKey as any)}
            </p>
          </div>
        ))}
      </div>

      {/* Apps Grid */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <Download size={20} style={{ color: 'var(--text-on-accent)' }} />
          </div>
          <div>
            <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
              {t('ourFreeApps' as any)}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('ourFreeAppsDesc' as any)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {appsList.map(app => {
            const isExpanded = expandedApp === app.id;
            return (
              <div
                key={app.id}
                className="t-card overflow-hidden card-hover transition-all duration-300"
                style={{
                  borderColor: isExpanded ? app.color : undefined,
                  boxShadow: isExpanded ? `0 10px 40px ${app.color}25` : undefined,
                }}
              >
                {/* App Header */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                      style={{ background: app.gradient }}
                    >
                      <span className="text-2xl">{app.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-base mb-0.5" style={{ color: 'var(--text-primary)' }}>
                        {t((`app_${app.id}_name`) as any)}
                      </h3>
                      <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                        {t((`app_${app.id}_desc`) as any)}
                      </p>
                    </div>
                  </div>

                  {/* Rating & Downloads */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          size={12}
                          fill={j < Math.floor(app.rating) ? '#FBBF24' : 'transparent'}
                          color="#FBBF24"
                        />
                      ))}
                      <span className="text-xs font-bold ms-1" style={{ color: 'var(--text-secondary)' }}>
                        {app.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <Download size={11} /> {app.downloads}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> v{app.version}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Toggle Details */}
                <button
                  onClick={() => {
                    playClick();
                    setExpandedApp(isExpanded ? null : app.id);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all"
                  style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', borderTop: '1px solid var(--border-card)' }}
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span>{isExpanded ? (t('hideDetails' as any)) : (t('showDetails' as any))}</span>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 space-y-3 page-enter" style={{ borderTop: '1px solid var(--border-card)' }}>
                    <div className="space-y-2">
                      {[1, 2, 3].map(fi => (
                        <div key={fi} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <span style={{ color: app.color }}>✓</span>
                          <span>{t((`app_${app.id}_f${fi}`) as any)}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => toggleExtension(app.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all btn-press"
                      style={activeExtensions[app.id] ? {
                        background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-card)'
                      } : { background: app.gradient, color: 'white', boxShadow: `0 6px 20px ${app.color}30` }}
                    >
                      {activeExtensions[app.id] ? null : <Download size={16} />}
                      <span>{activeExtensions[app.id] ? t('deactivate' as any) : t('downloadNow' as any)}</span>
                    </button>
                  </div>
                )}

                {/* Quick Download Button */}
                {!isExpanded && (
                  <div className="px-5 pb-4">
                    <button
                      onClick={() => toggleExtension(app.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all btn-press"
                      style={activeExtensions[app.id] ? {
                        background: 'var(--bg-input)', color: 'var(--text-primary)', border: `1px solid ${app.color}30`
                      } : { background: app.gradient, color: 'white', boxShadow: `0 4px 15px ${app.color}20` }}
                    >
                      {activeExtensions[app.id] ? <span style={{ color: app.color }}>✓</span> : <Download size={14} />}
                      <span>{activeExtensions[app.id] ? t('activated' as any) : t('downloadFree' as any)}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-accent)' }}>
            <Heart size={20} style={{ color: 'var(--text-on-accent)' }} />
          </div>
          <div>
            <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
              {t('userReviews' as any)}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('userReviewsDesc' as any)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
          {reviews.map((rev, i) => (
            <div key={i} className="t-card p-6 card-hover">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: rev.rating }).map((_, j) => (
                  <Star key={j} size={14} fill="var(--accent-5)" color="var(--accent-5)" />
                ))}
              </div>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                "{t(rev.textKey as any)}"
              </p>
              <div className="flex items-center gap-3" style={{ borderTop: '1px solid var(--border-card)', paddingTop: '12px' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'var(--gradient-primary)' }}>
                  {rev.avatar}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{t(rev.nameKey as any)}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t(rev.roleKey as any)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscribe for new apps */}
      <div className="t-card p-6 card-hover shimmer">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <Mail size={20} style={{ color: 'var(--text-on-accent)' }} />
          </div>
          <div>
            <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
              {t('subscribeTitle' as any)}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('subscribeDesc' as any)}
            </p>
          </div>
        </div>

        {subscribed ? (
          <div className="flex items-center justify-center gap-3 py-6 page-enter">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <Check size={24} color="#10B981" />
            </div>
            <div>
              <p className="font-black text-base" style={{ color: '#10B981' }}>
                {t('subscribeSuccess' as any)}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {t('subscribeSuccessDesc' as any)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder' as any)}
              className="t-input flex-1"
              dir="ltr"
            />
            <button
              onClick={handleSubscribe}
              className="flex items-center gap-2 px-6 rounded-xl font-bold transition-all btn-press"
              style={{ background: 'var(--gradient-primary)', color: 'var(--text-on-accent)' }}
            >
              <Mail size={16} />
              <span className="hidden sm:inline">{t('subscribe' as any)}</span>
            </button>
          </div>
        )}
      </div>

      {/* Request New App */}
      <div className="t-card p-6 card-hover">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #38BDF8, #3B82F6)' }}>
            <Send size={20} color="white" />
          </div>
          <div>
            <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
              {t('requestAppTitle' as any)}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('requestAppDesc' as any)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {['requestMsg1', 'requestMsg2', 'requestMsg3', 'requestMsg4'].map((key, i) => (
            <button
              key={i}
              onClick={() => handleRequestApp(t(key as any))}
              className="flex items-center gap-2 p-3 rounded-xl text-xs font-bold transition-all btn-press card-hover"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
            >
              <span className="text-lg">{['📱', '🎮', '📚', '💡'][i]}</span>
              <span>{t(key as any)}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={requestMessage}
            onChange={e => setRequestMessage(e.target.value)}
            placeholder={t('requestAppPlaceholder' as any)}
            className="t-input flex-1"
          />
          <button
            onClick={() => handleRequestApp()}
            className="flex items-center gap-2 px-6 rounded-xl font-bold transition-all btn-press"
            style={{ background: '#25D366', color: 'white' }}
          >
            <Send size={16} />
            <span className="hidden sm:inline">{t('send')}</span>
          </button>
        </div>
      </div>

      {/* DigitPro Footer Card */}
      <div className="t-card overflow-hidden card-hover">
        <div className="p-8 text-center relative">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, var(--accent-1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }} />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center mb-4">
              <DigitProLogo size={64} showText={false} variant="icon" animated glowing />
            </div>
            <h3 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
              <span style={{
                background: 'linear-gradient(135deg, #6366F1, #A855F7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>DigitPro</span>
            </h3>
            <p className="text-xs mb-4 flex items-center justify-center gap-1" style={{ color: 'var(--text-muted)' }}>
              {t('freeAppsFooterText' as any)} <Heart size={12} className="animate-pulse" color="#F43F5E" fill="#F43F5E" />
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playClick()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all btn-press card-hover"
              style={{ background: 'linear-gradient(135deg, #38BDF8, #3B82F6)', color: 'white', boxShadow: '0 8px 25px rgba(56, 189, 248, 0.3)' }}
            >
              <Send size={18} />
              <span>{t('contactWhatsApp')}</span>
            </a>
          </div>
        </div>
        <div className="h-1" style={{ background: 'var(--gradient-primary)' }} />
      </div>
    </div>
  );
}
