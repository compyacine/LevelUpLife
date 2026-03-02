import { BarChart3, TrendingUp, CheckSquare, Repeat, Flame, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { getLast7DaysSummaries, getGoals, getTasks, getHabits, getUserStats, getFocusSessions } from '../db/database';
import { useTheme } from '../contexts/ThemeContext';

interface AnalyticsProps { refresh: number; }

export default function Analytics({ refresh: _ }: AnalyticsProps) {
  const { config } = useTheme();
  const c = config.preview;

  const summaries = getLast7DaysSummaries();
  const goals = getGoals();
  const tasks = getTasks();
  getHabits();
  const stats = getUserStats();
  const sessions = getFocusSessions();

  const totalFocusMinutes = sessions.filter(s => s.completed).reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalTasksCompleted = tasks.filter(t => t.status === 'completed').length;
  const completedGoals = goals.filter(g => g.is_completed).length;
  const totalSessions = sessions.filter(s => s.completed).length;

  const chartData = summaries.map(s => {
    const date = new Date(s.date);
    const dayNames = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    return { day: dayNames[date.getDay()], tasks: s.tasks_completed, focus: s.focus_minutes, habits: s.habits_completed, score: s.productivity_score };
  });

  const taskStatusData = [
    { name: 'مكتملة', value: tasks.filter(t => t.status === 'completed').length, color: c[0] },
    { name: 'معلقة', value: tasks.filter(t => t.status === 'pending').length, color: c[2] },
  ].filter(d => d.value > 0);

  const goalStatusData = [
    { name: 'مكتملة', value: completedGoals, color: c[0] },
    { name: 'نشطة', value: goals.length - completedGoals, color: c[2] },
  ].filter(d => d.value > 0);

  const overviewCards = [
    { label: 'إجمالي النقاط', value: stats.total_points, color: c[0], emoji: '🏆' },
    { label: 'المستوى', value: stats.level, color: c[1], emoji: '👑' },
    { label: 'الأهداف المنجزة', value: `${completedGoals}/${goals.length}`, color: c[2], emoji: '🎯' },
    { label: 'المهام المنجزة', value: totalTasksCompleted, color: c[3] || c[0], emoji: '✅' },
    { label: 'دقائق التركيز', value: totalFocusMinutes, color: c[0], emoji: '⏱️' },
    { label: 'جلسات التركيز', value: totalSessions, color: c[1], emoji: '⚡' },
  ];

  const achievements = [
    { name: 'أول هدف', desc: 'أنشئ هدفك الأول', earned: goals.length > 0, emoji: '🎯' },
    { name: 'منجز المهام', desc: 'أنجز 10 مهام', earned: totalTasksCompleted >= 10, emoji: '✅' },
    { name: 'متأمل', desc: 'أكمل 5 جلسات تركيز', earned: totalSessions >= 5, emoji: '🧠' },
    { name: 'ملتزم', desc: 'حافظ على سلسلة 3 أيام', earned: stats.streak_days >= 3, emoji: '🔥' },
    { name: 'خبير', desc: 'وصل للمستوى 5', earned: stats.level >= 5, emoji: '👑' },
    { name: 'بطل الوقت', desc: '100 دقيقة تركيز', earned: totalFocusMinutes >= 100, emoji: '⏱️' },
  ];

  const tooltipStyle = { background: 'var(--bg-glass-strong)', border: '1px solid var(--border-card)', borderRadius: '16px', color: 'var(--text-primary)', padding: '12px 16px', backdropFilter: 'blur(10px)' };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
          <span className="text-4xl">📊</span> نظرة عامة
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>تابع إحصائياتك وتقدمك</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 stagger-children">
        {overviewCards.map((card, i) => (
          <div key={i} className="t-card p-4 text-center card-hover" style={{ background: `linear-gradient(135deg, ${card.color}08, var(--bg-card))` }}>
            <div className="text-2xl mb-2">{card.emoji}</div>
            <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
            <p className="text-[10px] mt-1 font-bold" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="t-card p-5 card-hover" style={{ background: `linear-gradient(135deg, ${c[0]}08, var(--bg-card))` }}>
          <div className="flex items-center gap-4">
            <div className="text-4xl streak-fire">🔥</div>
            <div>
              <p className="text-2xl font-black" style={{ color: c[0] }}>{stats.streak_days} يوم</p>
              <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>سلسلة الالتزام</p>
            </div>
            <Flame size={40} className="mr-auto" style={{ color: `${c[0]}15` }} />
          </div>
        </div>
        <div className="t-card p-5 card-hover" style={{ background: `linear-gradient(135deg, ${c[1]}08, var(--bg-card))` }}>
          <div className="flex items-center gap-4">
            <div className="text-4xl float">👑</div>
            <div className="flex-1">
              <p className="text-2xl font-black" style={{ color: c[1] }}>المستوى {stats.level}</p>
              <div className="w-full rounded-full h-2 mt-2 overflow-hidden" style={{ background: 'var(--progress-bg)' }}>
                <div className="h-full rounded-full progress-bar-animated" style={{ width: `${stats.total_points % 100}%`, background: `linear-gradient(90deg, ${c[1]}, ${c[2]})` }} />
              </div>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{stats.total_points % 100}/100 للمستوى التالي</p>
            </div>
            <Star size={40} style={{ color: `${c[1]}15` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="t-card p-6 card-hover">
          <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp size={18} style={{ color: c[0] }} /> نقاط الإنتاجية (7 أيام)
          </h3>
          {chartData.some(d => d.score > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs><linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={c[0]} stopOpacity={0.4} /><stop offset="95%" stopColor={c[0]} stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="score" stroke={c[0]} strokeWidth={3} fill="url(#scoreGrad)" name="النقاط" dot={{ fill: c[0], r: 4, strokeWidth: 2, stroke: 'var(--bg-main)' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center" style={{ color: 'var(--text-muted)' }}>
              <BarChart3 size={48} className="mb-3" style={{ color: 'var(--border-card)' }} />
              <p className="text-sm">لا توجد بيانات كافية بعد</p>
            </div>
          )}
        </div>

        <div className="t-card p-6 card-hover">
          <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <CheckSquare size={18} style={{ color: c[1] }} /> المهام ودقائق التركيز
          </h3>
          {chartData.some(d => d.tasks > 0 || d.focus > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="tasks" fill={c[1]} name="المهام" radius={[6, 6, 0, 0]} />
                <Bar dataKey="focus" fill={c[2]} name="دقائق التركيز" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center" style={{ color: 'var(--text-muted)' }}>
              <BarChart3 size={48} className="mb-3" style={{ color: 'var(--border-card)' }} /><p className="text-sm">لا توجد بيانات كافية بعد</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="t-card p-6 card-hover">
          <h3 className="text-lg font-black mb-4" style={{ color: 'var(--text-primary)' }}>📋 توزيع المهام</h3>
          {taskStatusData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={150} height={150}>
                <PieChart><Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" strokeWidth={0}>{taskStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie></PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {taskStatusData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-lg" style={{ background: d.color }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                    <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="h-36 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}><p>لا توجد مهام بعد</p></div>}
        </div>
        <div className="t-card p-6 card-hover">
          <h3 className="text-lg font-black mb-4" style={{ color: 'var(--text-primary)' }}>🎯 توزيع الأهداف</h3>
          {goalStatusData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={150} height={150}>
                <PieChart><Pie data={goalStatusData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" strokeWidth={0}>{goalStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie></PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {goalStatusData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-lg" style={{ background: d.color }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                    <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="h-36 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}><p>لا توجد أهداف بعد</p></div>}
        </div>
      </div>

      <div className="t-card p-6 card-hover">
        <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Repeat size={18} style={{ color: c[2] }} /> العادات (7 أيام)
        </h3>
        {chartData.some(d => d.habits > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="habits" fill={c[2]} name="العادات المنجزة" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            <BarChart3 size={48} className="mb-3" style={{ color: 'var(--border-card)' }} /><p className="text-sm">لا توجد بيانات كافية بعد</p>
          </div>
        )}
      </div>

      <div className="t-card p-6">
        <h3 className="text-lg font-black mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          🏅 الإنجازات <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>({achievements.filter(a => a.earned).length}/{achievements.length})</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 stagger-children">
          {achievements.map((ach, i) => (
            <div key={i} className="text-center p-4 rounded-2xl transition-all card-hover"
              style={{ background: ach.earned ? `linear-gradient(135deg, ${c[0]}12, ${c[1]}08)` : 'var(--bg-input)', border: ach.earned ? `1px solid ${c[0]}30` : '1px solid var(--border-card)', opacity: ach.earned ? 1 : 0.4, filter: ach.earned ? 'none' : 'grayscale(1)', boxShadow: ach.earned ? `0 0 20px ${c[0]}10` : 'none' }}>
              <div className="text-3xl mb-2">{ach.emoji}</div>
              <p className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>{ach.name}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{ach.desc}</p>
              {ach.earned && <p className="text-[10px] mt-1 font-black" style={{ color: c[0] }}>✓ محقق</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
