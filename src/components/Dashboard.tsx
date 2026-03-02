import { useEffect, useState } from 'react';
import { CheckSquare, Timer, Target, Repeat, TrendingUp, Zap, Star, ArrowLeft, Flame, Award } from 'lucide-react';
import { getTodaySummary, getGoals, getTasks, getHabits, getUserStats, getFocusSessions } from '../db/database';
import { Page } from '../types';
import { playClick } from '../utils/sounds';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LanguageContext';

interface DashboardProps {
  setPage: (page: Page) => void;
  refresh: number;
}

function AnimatedCounter({ value, suffix = '' }: { value: number | string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const numVal = typeof value === 'string' ? parseInt(value) || 0 : value;

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * numVal);
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [numVal]);

  return <span>{display}{suffix}</span>;
}

export default function Dashboard({ setPage, refresh: _ }: DashboardProps) {
  const summary = getTodaySummary();
  const goals = getGoals();
  const tasks = getTasks();
  const habits = getHabits();
  const stats = getUserStats();
  const sessions = getFocusSessions();
  const { config } = useTheme();
  const { t, tQuotes } = useLang();

  const activeGoals = goals.filter(g => !g.is_completed);
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.due_date === todayStr);
  const todaySessions = sessions.filter(s => s.start_time.startsWith(todayStr));

  const quotes = tQuotes();
  const [quoteIdx] = useState(() => Math.floor(Math.random() * quotes.length));
  const quote = quotes[quoteIdx] || quotes[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return { text: t('greetingNight'), sub: t('greetingLateSub') };
    if (hour < 12) return { text: t('greetingMorning'), sub: t('greetingMorningSub') };
    if (hour < 17) return { text: t('greetingAfternoon'), sub: t('greetingAfternoonSub') };
    if (hour < 21) return { text: t('greetingEvening'), sub: t('greetingEveningSub') };
    return { text: t('greetingNight'), sub: t('greetingNightSub') };
  };
  const greeting = getGreeting();
  const colors = config.preview;

  const statCards = [
    {
      title: t('tasksCompleted'),
      value: summary.tasks_completed,
      subtitle: `${t('fromTasks')}: ${todayTasks.length || pendingTasks.length}`,
      icon: <CheckSquare size={22} />,
      color: colors[0],
    },
    {
      title: t('focusMinutes'),
      value: summary.focus_minutes,
      subtitle: `${todaySessions.length} ${t('sessionToday')}`,
      icon: <Timer size={22} />,
      color: colors[1],
    },
    {
      title: t('habitsCompleted'),
      value: summary.habits_completed,
      subtitle: `${t('fromHabits')}: ${habits.length}`,
      icon: <Repeat size={22} />,
      color: colors[2],
    },
    {
      title: t('productivity'),
      value: summary.productivity_score,
      subtitle: `${t('level')} ${stats.level}`,
      icon: <TrendingUp size={22} />,
      color: colors[3] || colors[0],
      suffix: '%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 shimmer" style={{ background: `linear-gradient(135deg, ${colors[0]}15, ${colors[1]}10, ${colors[2]}08)`, border: `1px solid ${colors[0]}20` }}>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{greeting.text}</h2>
              <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>{greeting.sub}</p>
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: `${colors[0]}15`, border: `1px solid ${colors[0]}25` }}>
                  <Award size={14} style={{ color: colors[0] }} />
                  <span className="text-xs font-black" style={{ color: colors[0] }}>{t('level')} {stats.level}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: `${colors[1]}15`, border: `1px solid ${colors[1]}25` }}>
                  <Star size={14} style={{ color: colors[1] }} />
                  <span className="text-xs font-black" style={{ color: colors[1] }}>{stats.total_points} {t('points')}</span>
                </div>
                {stats.streak_days > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: `${colors[2]}15`, border: `1px solid ${colors[2]}25` }}>
                    <Flame size={14} className="streak-fire" style={{ color: colors[2] }} />
                    <span className="text-xs font-black" style={{ color: colors[2] }}>{stats.streak_days} {t('day')}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="hidden md:block text-6xl float">
              {summary.productivity_score >= 80 ? '🏆' : summary.productivity_score >= 50 ? '⭐' : '🚀'}
            </div>
          </div>
        </div>
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl" style={{ background: `${colors[0]}08` }} />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full blur-3xl" style={{ background: `${colors[2]}08` }} />
      </div>

      {/* Motivational Quote */}
      {quote && (
        <div className="relative overflow-hidden t-card p-5 card-hover">
          <div className="flex items-start gap-4 relative z-10">
            <span className="text-3xl float">💡</span>
            <div>
              <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>"{quote.text}"</p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>— {quote.author}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-children">
        {statCards.map((card, i) => (
          <div key={i} className="relative overflow-hidden t-card p-5 card-hover group cursor-default" style={{ background: `linear-gradient(135deg, ${card.color}08, var(--bg-card))` }}>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}CC)`, color: 'white' }}>
                  {card.icon}
                </div>
                <Zap size={14} className="transition-colors duration-500" style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="text-3xl font-black number-pop" style={{ color: 'var(--text-primary)' }}>
                <AnimatedCounter value={card.value} suffix={card.suffix} />
              </p>
              <p className="text-sm font-bold mt-1" style={{ color: 'var(--text-secondary)' }}>{card.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Goals */}
        <div className="t-card p-6 card-hover">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Target size={18} style={{ color: colors[0] }} /> {t('activeGoals')}
            </h3>
            <button onClick={() => { playClick(); setPage('goals'); }} className="flex items-center gap-1 text-xs font-bold transition-colors btn-press" style={{ color: colors[0] }}>
              {t('viewAll')} <ArrowLeft size={12} />
            </button>
          </div>
          {activeGoals.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-3 float">🎯</div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('noActiveGoals')}</p>
              <button onClick={() => setPage('goals')} className="text-sm mt-2 hover:underline btn-press" style={{ color: colors[0] }}>{t('addFirstGoal')}</button>
            </div>
          ) : (
            <div className="space-y-3 stagger-children">
              {activeGoals.slice(0, 4).map(goal => (
                <div key={goal.id} className="flex items-center gap-3 p-3 rounded-xl transition-all group/goal cursor-default" style={{ background: 'var(--bg-input)' }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: goal.priority === 3 ? '#EF4444' : goal.priority === 2 ? '#F59E0B' : colors[0] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{goal.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: 'var(--progress-bg)' }}>
                        <div className="h-full rounded-full progress-bar-animated" style={{ width: `${goal.progress}%`, background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})` }} />
                      </div>
                      <span className="text-xs font-black" style={{ color: colors[0] }}>{goal.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="t-card p-6 card-hover">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <CheckSquare size={18} style={{ color: colors[1] }} /> {t('upcomingTasks')}
            </h3>
            <button onClick={() => { playClick(); setPage('tasks'); }} className="flex items-center gap-1 text-xs font-bold transition-colors btn-press" style={{ color: colors[1] }}>
              {t('viewAll')} <ArrowLeft size={12} />
            </button>
          </div>
          {pendingTasks.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-3 float">✅</div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('noPendingTasks')}</p>
              <button onClick={() => setPage('tasks')} className="text-sm mt-2 hover:underline btn-press" style={{ color: colors[1] }}>{t('addFirstTask')}</button>
            </div>
          ) : (
            <div className="space-y-2 stagger-children">
              {pendingTasks.slice(0, 5).map(task => {
                const isOverdue = task.due_date && task.due_date < todayStr;
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl transition-all cursor-default" style={{ background: isOverdue ? '#EF444410' : 'var(--bg-input)', border: isOverdue ? '1px solid #EF444420' : 'none' }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: task.priority === 3 ? '#EF4444' : task.priority === 2 ? '#F59E0B' : colors[1] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {task.due_date || t('noDate')} • {task.estimated_minutes || '?'} {t('minute')}
                        {isOverdue && <span className="text-red-500 mr-2 font-bold">{t('overdue')}</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="t-card p-6">
        <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          {t('quickActions')} <Zap size={16} className="animate-pulse" style={{ color: colors[0] }} />
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
          {[
            { label: t('newGoal'), page: 'goals' as Page, emoji: '🎯', color: colors[0] },
            { label: t('newTask'), page: 'tasks' as Page, emoji: '✅', color: colors[1] },
            { label: t('startFocus'), page: 'focus' as Page, emoji: '🧠', color: colors[2] },
            { label: t('trackHabits'), page: 'habits' as Page, emoji: '💪', color: colors[3] || colors[0] },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => { playClick(); setPage(action.page); }}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-300 btn-press card-hover"
              style={{ background: `${action.color}10`, border: `1px solid ${action.color}20`, color: action.color }}
            >
              <span className="text-3xl">{action.emoji}</span>
              <span className="text-xs font-black">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
