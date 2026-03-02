import { useState, useCallback, useEffect, useMemo } from 'react';
import { Menu, Palette, Heart } from 'lucide-react';
import DigitProLogo from './components/DigitProLogo';
import { Page, AppSettings } from './types';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLang } from './contexts/LanguageContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Goals from './components/Goals';
import Tasks from './components/Tasks';
import FocusTimer from './components/FocusTimer';
import Habits from './components/Habits';
import Analytics from './components/Analytics';
import FreeAppsSupport from './components/FreeAppsSupport';
import Settings, { getSettings, isPasswordSet } from './components/Settings';
import MyWallet from './components/MyWallet';
import MyDiary from './components/MyDiary';
import MyHealth from './components/MyHealth';
import MyReading from './components/MyReading';
import LockScreen from './components/LockScreen';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ToastContainer from './components/ToastContainer';
import Confetti from './components/Confetti';
import ThemeSelector from './components/ThemeSelector';
import { showMotivationalToast } from './utils/toastStore';
import { playNav, playClick } from './utils/sounds';

function FloatingParticles() {
  const { config } = useTheme();
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      left: Math.random() * 100,
      delay: Math.random() * 20,
      duration: Math.random() * 20 + 15,
      opacity: Math.random() * 0.2 + 0.03,
      colorIdx: Math.floor(Math.random() * 4),
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div
          key={p.id}
          className="bg-particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            backgroundColor: config.preview[p.colorIdx] || config.preview[0],
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pageKey, setPageKey] = useState(0);
  const [themeOpen, setThemeOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(getSettings());
  const [isLocked, setIsLocked] = useState(() => isPasswordSet());
  const [lastActivity, setLastActivity] = useState(Date.now());
  const { config } = useTheme();
  const { t, lang, dir } = useLang();

  const triggerRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const navigateTo = useCallback((page: Page) => {
    if (page !== currentPage) {
      playNav();
      setCurrentPage(page);
      setPageKey(k => k + 1);
    }
  }, [currentPage]);

  // Auto-lock after inactivity
  useEffect(() => {
    if (!appSettings.passwordEnabled || appSettings.autoLockMinutes === 0) return;

    const checkLock = setInterval(() => {
      const elapsed = (Date.now() - lastActivity) / 1000 / 60;
      if (elapsed >= appSettings.autoLockMinutes && !isLocked) {
        setIsLocked(true);
      }
    }, 10000);

    return () => clearInterval(checkLock);
  }, [appSettings, lastActivity, isLocked]);

  // Track user activity
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
    };
  }, []);

  // Lock on page visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && appSettings.passwordEnabled && appSettings.lockOnClose) {
        setIsLocked(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [appSettings]);

  useEffect(() => {
    const timer = setTimeout(() => {
      showMotivationalToast();
    }, 60000);
    return () => clearTimeout(timer);
  }, [refreshKey]);

  const handleSettingsChange = useCallback((s: AppSettings) => {
    setAppSettings(s);
  }, []);

  const handleUnlock = useCallback(() => {
    setIsLocked(false);
    setLastActivity(Date.now());
  }, []);

  if (isLocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard setPage={navigateTo} refresh={refreshKey} />;
      case 'goals': return <Goals onRefresh={triggerRefresh} />;
      case 'tasks': return <Tasks onRefresh={triggerRefresh} />;
      case 'focus': return <FocusTimer onRefresh={triggerRefresh} />;
      case 'habits': return <Habits onRefresh={triggerRefresh} />;
      case 'analytics': return <Analytics refresh={refreshKey} />;
      case 'contact': return <FreeAppsSupport />;
      case 'settings': return <Settings onRefresh={triggerRefresh} onSettingsChange={handleSettingsChange} />;
      case 'myWallet': return <MyWallet />;
      case 'myDiary': return <MyDiary />;
      case 'myHealth': return <MyHealth />;
      case 'myReading': return <MyReading />;
      default: return <Dashboard setPage={navigateTo} refresh={refreshKey} />;
    }
  };

  const pageTitleKey: Record<Page, string> = {
    dashboard: 'pageDashboard',
    goals: 'pageGoals',
    tasks: 'pageTasks',
    focus: 'pageFocus',
    habits: 'pageHabits',
    analytics: 'pageAnalytics',
    contact: 'pageFreeApps',
    settings: 'pageSettings',
    myWallet: 'app_myWallet_name',
    myHealth: 'app_myHealth_name',
    myDiary: 'app_myDiary_name',
    myReading: 'app_myReading_name',
  };

  const pageEmoji: Record<Page, string> = {
    dashboard: '🏠',
    goals: '🎯',
    tasks: '✅',
    focus: '🧠',
    habits: '💪',
    analytics: '📊',
    contact: '📱',
    settings: '⚙️',
    myWallet: '💼',
    myHealth: '❤️',
    myDiary: '📓',
    myReading: '📚',
  };

  const dateLocale = lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-US' : 'ar-SA';

  return (
    <div className="flex h-screen overflow-hidden" dir={dir} style={{ background: 'var(--bg-main)' }}>
      <FloatingParticles />
      <ToastContainer />
      <Confetti />
      {appSettings.showWhatsApp && <FloatingWhatsApp />}
      <ThemeSelector isOpen={themeOpen} onClose={() => setThemeOpen(false)} />

      <Sidebar
        currentPage={currentPage}
        setPage={navigateTo}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onThemeOpen={() => { playClick(); setThemeOpen(true); }}
      />

      <main className="flex-1 overflow-y-auto relative z-10">
        <header className="sticky top-0 z-30" style={{ background: 'var(--bg-header)', backdropFilter: 'blur(30px)', borderBottom: '1px solid var(--border-card)' }}>
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { playNav(); setSidebarOpen(true); }}
                className="lg:hidden p-3 rounded-2xl transition-all btn-press shadow-sm"
                style={{
                  color: 'var(--accent-1)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)'
                }}
              >
                <Menu size={22} />
              </button>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{pageEmoji[currentPage]}</span>
                <div>
                  <h1 className="text-lg font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    {t(pageTitleKey[currentPage] as any)}

                  </h1>
                  <p className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                    {new Date().toLocaleDateString(dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { playClick(); setThemeOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all btn-press"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--accent-1)',
                }}
              >
                <Palette size={16} />
                <span className="text-xs font-bold hidden sm:inline">{config.emoji} {config.name}</span>
              </button>

              {/* DigitPro badge in header */}
              <a
                href="https://t.me/+QpKqwX1hsxtiZGQ0"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl transition-all btn-press card-hover"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.05))',
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                }}
              >
                <DigitProLogo size={20} showText={false} variant="icon" />
                <span className="text-[11px] font-black" style={{
                  background: 'linear-gradient(135deg, #6366F1, #A855F7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>DigitPro</span>
                <Heart size={10} color="#F43F5E" fill="#F43F5E" className="animate-pulse" />
              </a>
            </div>
          </div>
          <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, var(--accent-1), var(--accent-2), transparent)`, opacity: 0.4 }} />
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto page-enter" key={`page-${pageKey}-${currentPage}`}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}
