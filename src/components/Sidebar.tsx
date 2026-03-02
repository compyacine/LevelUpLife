import { Target, CheckSquare, Timer, Repeat, BarChart3, LayoutDashboard, X, Zap, Flame, Crown, Palette, Settings, Download, Wallet, Activity, Book, BookOpen, Send } from 'lucide-react';
import { Page } from '../types';
import { getUserStats } from '../db/database';
import { playClick } from '../utils/sounds';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';

interface SidebarProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
  onThemeOpen: () => void;
}

export default function Sidebar({ currentPage, setPage, isOpen, onClose, onThemeOpen }: SidebarProps) {
  const stats = getUserStats();
  const progressToNext = (stats.total_points % 100);
  const { config } = useTheme();
  const { t, tArray } = useLang();

  const levelTitles = tArray('levelTitles');
  const levelTitle = levelTitles[Math.min(stats.level - 1, levelTitles.length - 1)] || '';

  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem('digitpro_premium_unlocked') === 'true');
  const [activeExts, setActiveExts] = useState<Record<string, boolean>>(() => {
    const exts = ['taskManager', 'habitTracker', 'myWallet', 'myHealth', 'myDiary', 'myReading'];
    const acc: Record<string, boolean> = {};
    for (const id of exts) {
      acc[id] = localStorage.getItem('digitpro_ext_' + id) === 'true';
    }
    return acc;
  });

  useEffect(() => {
    const handleExtChange = () => {
      const exts = ['taskManager', 'habitTracker', 'myWallet', 'myHealth', 'myDiary', 'myReading'];
      const acc: Record<string, boolean> = {};
      for (const id of exts) {
        acc[id] = localStorage.getItem('digitpro_ext_' + id) === 'true';
      }
      setActiveExts(acc);
      setIsUnlocked(localStorage.getItem('digitpro_premium_unlocked') === 'true');
    };
    window.addEventListener('extensionsChanged', handleExtChange);
    return () => window.removeEventListener('extensionsChanged', handleExtChange);
  }, []);

  const showExt = (id: string) => isUnlocked && activeExts[id];

  const navItems = [
    { page: 'dashboard', labelKey: 'navDashboard', icon: <LayoutDashboard size={20} />, emoji: '🏠' },
    { page: 'goals', labelKey: 'navGoals', icon: <Target size={20} />, emoji: '🎯' },
    ...(showExt('taskManager') ? [{ page: 'tasks', labelKey: 'navTasks', icon: <CheckSquare size={20} />, emoji: '✅' }] : []),
    { page: 'focus', labelKey: 'navFocus', icon: <Timer size={20} />, emoji: '🧠' },
    ...(showExt('habitTracker') ? [{ page: 'habits', labelKey: 'navHabits', icon: <Repeat size={20} />, emoji: '💪' }] : []),
    { page: 'analytics', labelKey: 'navAnalytics', icon: <BarChart3 size={20} />, emoji: '📊' },
    ...(showExt('myWallet') ? [{ page: 'myWallet', labelKey: 'app_myWallet_name', icon: <Wallet size={20} />, emoji: '💼' }] : []),
    ...(showExt('myHealth') ? [{ page: 'myHealth', labelKey: 'app_myHealth_name', icon: <Activity size={20} />, emoji: '❤️' }] : []),
    ...(showExt('myDiary') ? [{ page: 'myDiary', labelKey: 'app_myDiary_name', icon: <Book size={20} />, emoji: '📓' }] : []),
    ...(showExt('myReading') ? [{ page: 'myReading', labelKey: 'app_myReading_name', icon: <BookOpen size={20} />, emoji: '📚' }] : []),
    { page: 'contact', labelKey: 'navFreeApps', icon: <Download size={20} />, emoji: '📱' },
    { page: 'settings', labelKey: 'navSettings', icon: <Settings size={20} />, emoji: '⚙️' },
  ] as { page: Page; labelKey: string; icon: React.ReactNode; emoji: string }[];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden modal-overlay"
          style={{ background: 'var(--modal-overlay)' }}
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed top-0 ltr:left-0 rtl:right-0 h-full w-72 z-50 transform transition-transform duration-500 ease-out flex flex-col flex-shrink-0
        ${isOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto lg:rtl:translate-x-0 lg:ltr:translate-x-0
      `}
        style={{ background: 'var(--bg-sidebar)', borderInlineEnd: '1px solid var(--sidebar-border)' }}
      >
        {/* Logo */}
        <div className="p-6" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--sidebar-border)', padding: '2px' }}
              >
                <img src="/logo.png" alt="LevelUp Life Logo" className="w-full h-full object-cover rounded-xl" onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.parentElement) e.currentTarget.parentElement.innerHTML = '<span style="color:var(--text-primary);font-weight:900;font-size:18px;">LL</span>';
                }} />
              </div>
              <div>
                <h1 className="text-xl font-black" style={{ color: 'var(--sidebar-text)' }}>{t('appName')}</h1>
                <p className="text-[10px] tracking-[0.15em]" style={{ color: 'var(--sidebar-text-muted)' }}>
                  {t('appSlogan')}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 rounded-xl transition-all btn-press" style={{ color: 'var(--sidebar-text-muted)' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* User Level Card */}
        <div className="p-3 mx-4 mt-4 rounded-2xl shimmer card-hover" style={{ background: 'var(--sidebar-active)', border: '1px solid var(--sidebar-border)' }}>
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'var(--gradient-accent)' }}>
              <Crown size={20} style={{ color: 'var(--text-on-accent)' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-black" style={{ color: 'var(--sidebar-text)' }}>
                  {t('level')} {stats.level}
                </p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--sidebar-active)', color: 'var(--sidebar-text)' }}>
                  {levelTitle}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--sidebar-text-muted)' }}>
                {stats.total_points} {t('points')}
              </p>
            </div>
          </div>
          <div className="relative z-10">
            <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div
                className="h-full rounded-full progress-bar-animated progress-bar-glow"
                style={{ width: `${progressToNext}%`, background: 'var(--gradient-accent)' }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[10px] flex items-center gap-1" style={{ color: 'var(--sidebar-text-muted)' }}>
                <Zap size={9} /> {progressToNext}/100 {t('toNextLevel')}
              </p>
              <p className="text-[10px] font-bold" style={{ color: 'var(--sidebar-text)' }}>Lv.{stats.level + 1}</p>
            </div>
          </div>
        </div>

        {/* Streak */}
        {stats.streak_days > 0 && (
          <div className="mx-4 mt-3 p-3 rounded-xl card-hover" style={{ background: 'var(--sidebar-hover)', border: '1px solid var(--sidebar-border)' }}>
            <div className="flex items-center gap-2.5">
              <span className="text-xl streak-fire">🔥</span>
              <div>
                <span className="text-sm font-black" style={{ color: 'var(--sidebar-text)' }}>{stats.streak_days} {t('consecutiveDays')}</span>
                <p className="text-[10px]" style={{ color: 'var(--sidebar-text-muted)' }}>{t('keepGoing')}</p>
              </div>
              <Flame size={16} className="mr-auto animate-pulse" style={{ color: 'var(--sidebar-text-muted)' }} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 mt-3 overflow-y-auto">
          {navItems.map(item => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => { playClick(); setPage(item.page); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold sidebar-item btn-press transition-all"
                style={{
                  background: isActive ? 'var(--sidebar-active)' : 'transparent',
                  color: isActive ? 'var(--sidebar-text)' : 'var(--sidebar-text-muted)',
                  border: isActive ? '1px solid var(--sidebar-border)' : '1px solid transparent',
                  boxShadow: isActive ? '0 4px 15px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <span className="text-lg">{item.emoji}</span>
                <span className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span>{t(item.labelKey as any)}</span>
                {isActive && <div className="w-2 h-2 rounded-full mr-auto animate-pulse" style={{ background: 'var(--sidebar-text)' }} />}
              </button>
            );
          })}
        </nav>

        {/* Theme Selector Button */}
        <div className="px-4 pb-2">
          <button
            onClick={() => { playClick(); onThemeOpen(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold sidebar-item btn-press transition-all"
            style={{
              background: 'var(--sidebar-hover)',
              color: 'var(--sidebar-text)',
              border: '1px solid var(--sidebar-border)',
            }}
          >
            <Palette size={18} />
            <span>{t('changeTheme')}</span>
            <span className="mr-auto text-lg">{config.emoji}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <div className="flex flex-col items-center gap-3">
            {/* Telegram Support Group */}
            <a
              href="https://t.me/+QpKqwX1hsxtiZGQ0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all btn-press card-hover w-full justify-center group"
              style={{
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(59, 130, 246, 0.1))',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #38BDF8, #3B82F6)',
                  boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)',
                }}
              >
                <Send size={20} color="white" />
              </div>
              <div className="flex flex-col items-start w-full">
                <span style={{
                  background: 'linear-gradient(135deg, #38BDF8, #3B82F6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 900,
                  fontSize: '13px',
                }}>
                  {t('supportGroup')}
                </span>
                <span dir="ltr" className="font-mono text-[9px]" style={{ color: 'var(--sidebar-text-muted)' }}>Telegram</span>
              </div>
            </a>
            <div className="flex items-center justify-center gap-2 text-[10px]" style={{ color: 'var(--sidebar-text-muted)' }}>
              <span>{t('dataLocal')}</span>
              <span>•</span>
              <span>{t('madeBy')}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
