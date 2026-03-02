import { useState } from 'react';
import { Plus, Trash2, Edit3, Flame, X, Check, Calendar, Award, Repeat } from 'lucide-react';
import { getHabits, addHabit, updateHabit, deleteHabit, toggleHabitLog, isHabitCompletedToday, getHabitLogs } from '../db/database';
import { Habit } from '../types';
import { playClick, playHabitCheck, playSuccess, playDelete, playStreak } from '../utils/sounds';
import { showHabitToast, showStreakToast, showPointsToast } from '../utils/toastStore';
import { useTheme } from '../contexts/ThemeContext';

interface HabitsProps { onRefresh: () => void; }

export default function Habits({ onRefresh }: HabitsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetFrequency, setTargetFrequency] = useState(7);
  const { config } = useTheme();
  const c = config.preview;

  const habits = getHabits();
  const habitLogs = getHabitLogs();
  const today = new Date().toISOString().split('T')[0];

  const resetForm = () => { setTitle(''); setDescription(''); setTargetFrequency(7); setEditingHabit(null); setShowForm(false); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (editingHabit) { updateHabit(editingHabit.id, { title, description, target_frequency: targetFrequency }); }
    else { addHabit({ title, description, target_frequency: targetFrequency }); showPointsToast(5, 'إضافة عادة جديدة'); }
    playSuccess(); resetForm(); onRefresh();
  };

  const handleEdit = (habit: Habit) => { setEditingHabit(habit); setTitle(habit.title); setDescription(habit.description); setTargetFrequency(habit.target_frequency); setShowForm(true); };
  const handleDelete = (id: number) => { if (confirm('هل أنت متأكد من حذف هذه العادة؟')) { playDelete(); deleteHabit(id); onRefresh(); } };

  const handleToggle = (habit: Habit) => {
    const was = isHabitCompletedToday(habit.id);
    toggleHabitLog(habit.id, today);
    if (!was) {
      playHabitCheck(); showHabitToast(habit.title);
      const upd = getHabits().find(h => h.id === habit.id);
      if (upd && upd.streak > 0 && upd.streak % 7 === 0) { playStreak(); showStreakToast(upd.streak); }
    }
    onRefresh();
  };

  const getLast7Days = () => { const d = []; for (let i = 6; i >= 0; i--) { const dt = new Date(); dt.setDate(dt.getDate() - i); d.push(dt.toISOString().split('T')[0]); } return d; };
  const last7Days = getLast7Days();
  const dayNames = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

  const getWeeklyCompletion = (habitId: number) => {
    const s = new Date(); s.setDate(s.getDate() - s.getDay());
    const wd: string[] = [];
    for (let i = 0; i < 7; i++) { const d = new Date(s); d.setDate(d.getDate() + i); wd.push(d.toISOString().split('T')[0]); }
    return habitLogs.filter(l => l.habit_id === habitId && wd.includes(l.date) && l.completed === 1).length;
  };

  const completedToday = habits.filter(h => isHabitCompletedToday(h.id)).length;
  const completionPct = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <span className="text-4xl">💪</span> العادات اليومية
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>ابنِ عادات إيجابية وتابع التزامك</p>
        </div>
        <button onClick={() => { playClick(); resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all btn-press"
          style={{ background: `linear-gradient(135deg, ${c[2]}, ${c[3] || c[0]})`, color: 'var(--text-on-accent)', boxShadow: `0 8px 25px ${c[2]}30` }}>
          <Plus size={18} /> عادة جديدة
        </button>
      </div>

      {/* Today's Progress */}
      <div className="relative overflow-hidden rounded-3xl p-6 shimmer" style={{ background: `linear-gradient(135deg, ${c[2]}12, ${c[0]}08)`, border: `1px solid ${c[2]}20`, boxShadow: `0 0 30px ${c[2]}10` }}>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-sm font-black" style={{ color: c[2] }}>إنجاز اليوم 🌟</p>
            <p className="text-4xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>{completedToday} / {habits.length}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {completionPct === 100 ? '🎉 أحسنت! أنجزت جميع العادات!' : completionPct >= 50 ? '💪 استمر، أنت في المنتصف!' : '🚀 ابدأ يومك بقوة!'}
            </p>
          </div>
          <div className="w-24 h-24 relative">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" strokeWidth="3" fill="none" style={{ stroke: 'var(--progress-bg)' }} />
              <circle cx="20" cy="20" r="16" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray={`${completionPct} 100`} className="transition-all duration-1000" style={{ stroke: c[2] }} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-black" style={{ color: c[2] }}>{completionPct}%</span>
          </div>
        </div>
        {completionPct === 100 && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><Award size={120} style={{ color: `${c[2]}08` }} /></div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" style={{ background: 'var(--modal-overlay)' }} onClick={() => resetForm()}>
          <div className="rounded-3xl p-7 w-full max-w-md modal-content shadow-2xl" style={{ background: 'var(--bg-glass-strong)', backdropFilter: 'blur(30px)', border: '1px solid var(--border-card)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{editingHabit ? '✏️ تعديل العادة' : '💪 عادة جديدة'}</h3>
              <button onClick={resetForm} className="p-2 rounded-xl btn-press" style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>اسم العادة *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: قراءة 30 دقيقة" className="t-input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>الوصف</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="وصف العادة..." className="t-input w-full resize-none h-20" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>🎯 الهدف الأسبوعي (مرات/أسبوع)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(n => (
                    <button key={n} type="button" onClick={() => setTargetFrequency(n)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all btn-press"
                      style={{ background: targetFrequency === n ? c[2] : 'var(--bg-input)', color: targetFrequency === n ? 'white' : 'var(--text-muted)', boxShadow: targetFrequency === n ? `0 4px 12px ${c[2]}30` : 'none' }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl font-black transition-all btn-press" style={{ background: `linear-gradient(135deg, ${c[2]}, ${c[3] || c[0]})`, color: 'var(--text-on-accent)', boxShadow: `0 8px 25px ${c[2]}30` }}>
                {editingHabit ? '💾 حفظ التعديلات' : 'إضافة العادة'}
              </button>
            </form>
          </div>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-4 float">💪</div>
          <p className="text-xl font-black" style={{ color: 'var(--text-muted)' }}>لا توجد عادات بعد</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>ابدأ ببناء عاداتك الإيجابية!</p>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {habits.map(habit => {
            const done = isHabitCompletedToday(habit.id);
            const weeklyComp = getWeeklyCompletion(habit.id);
            const weeklyPct = Math.round((weeklyComp / habit.target_frequency) * 100);
            return (
              <div key={habit.id} className="t-card p-5 transition-all card-hover" style={{ borderColor: done ? `${c[2]}40` : 'var(--border-card)', boxShadow: done ? `0 0 20px ${c[2]}10` : 'none' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <button onClick={() => handleToggle(habit)}
                      className={`mt-0.5 w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all btn-press ${done ? 'check-pop habit-complete-burst' : ''}`}
                      style={{ background: done ? c[2] : 'transparent', borderColor: done ? c[2] : 'var(--border-input)', boxShadow: done ? `0 4px 15px ${c[2]}30` : 'none' }}>
                      {done ? <Check size={18} color="white" /> : null}
                    </button>
                    <div>
                      <h3 className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>{habit.title}</h3>
                      {habit.description && <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{habit.description}</p>}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {habit.streak > 0 && (
                          <span className="flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-lg" style={{ color: '#F97316', background: '#F9731610', border: '1px solid #F9731620' }}>
                            <Flame size={13} className="streak-fire" /> {habit.streak} يوم 🔥
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ color: 'var(--text-muted)', background: 'var(--bg-input)' }}>
                          <Calendar size={11} /> {weeklyComp}/{habit.target_frequency} هذا الأسبوع
                        </span>
                        {weeklyPct >= 100 && <span className="text-xs font-black px-2 py-1 rounded-lg" style={{ color: c[0], background: `${c[0]}10`, border: `1px solid ${c[0]}20` }}>🏆 هدف محقق!</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(habit)} className="p-2 rounded-xl btn-press" style={{ color: 'var(--text-muted)' }}><Edit3 size={14} /></button>
                    <button onClick={() => handleDelete(habit.id)} className="p-2 rounded-xl btn-press hover:text-red-400" style={{ color: 'var(--text-muted)' }}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex gap-2">
                  {last7Days.map(date => {
                    const isComp = habitLogs.some(l => l.habit_id === habit.id && l.date === date && l.completed === 1);
                    const dayIndex = new Date(date).getDay();
                    const isToday = date === today;
                    return (
                      <div key={date} className="flex-1 text-center">
                        <p className="text-[10px] mb-1.5 font-bold" style={{ color: isToday ? c[2] : 'var(--text-muted)' }}>{dayNames[dayIndex]}</p>
                        <div className="w-full aspect-square rounded-xl flex items-center justify-center transition-all"
                          style={{ background: isComp ? `linear-gradient(135deg, ${c[2]}30, ${c[0]}20)` : isToday ? 'var(--bg-input)' : 'var(--progress-bg)', border: isComp ? `1px solid ${c[2]}40` : isToday ? `2px dashed ${c[2]}30` : '1px solid var(--border-card)', boxShadow: isComp ? `0 4px 10px ${c[2]}10` : 'none' }}>
                          {isComp ? <Check size={14} style={{ color: c[2] }} /> : isToday ? <Repeat size={12} style={{ color: `${c[2]}40` }} /> : null}
                        </div>
                        {isToday && <div className="w-1.5 h-1.5 rounded-full mx-auto mt-1.5 animate-pulse" style={{ background: c[2] }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
