import { useState } from 'react';
import { Plus, Trash2, Edit3, Calendar, Flag, X, Check, Trophy } from 'lucide-react';
import { getGoals, addGoal, updateGoal, deleteGoal, getTasks } from '../db/database';
import { Goal } from '../types';
import { playClick, playSuccess, playDelete } from '../utils/sounds';
import { showGoalCompleteToast, showPointsToast } from '../utils/toastStore';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LanguageContext';

interface GoalsProps { onRefresh: () => void; }

export default function Goals({ onRefresh }: GoalsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState(1);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const { config } = useTheme();
  const c = config.preview;
  const { t } = useLang();

  const goals = getGoals();
  const tasks = getTasks();

  const filteredGoals = goals.filter(g => {
    if (filter === 'active') return !g.is_completed;
    if (filter === 'completed') return g.is_completed === 1;
    return true;
  });

  const resetForm = () => { setTitle(''); setDescription(''); setTargetDate(''); setPriority(1); setEditingGoal(null); setShowForm(false); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (editingGoal) { updateGoal(editingGoal.id, { title, description, target_date: targetDate, priority }); }
    else { addGoal({ title, description, target_date: targetDate, priority }); showPointsToast(10, 'إضافة هدف جديد'); }
    playSuccess(); resetForm(); onRefresh();
  };

  const handleEdit = (goal: Goal) => { setEditingGoal(goal); setTitle(goal.title); setDescription(goal.description); setTargetDate(goal.target_date); setPriority(goal.priority); setShowForm(true); };
  const handleDelete = (id: number) => { if (confirm(t('deleteGoalConfirm'))) { playDelete(); deleteGoal(id); onRefresh(); } };
  const handleToggleComplete = (goal: Goal) => { const n = goal.is_completed ? 0 : 1; updateGoal(goal.id, { is_completed: n, progress: n ? 100 : goal.progress }); if (n) { showGoalCompleteToast(goal.title); playSuccess(); } onRefresh(); };

  const priorityLabel = (p: number) => p === 3 ? t('priorityHighShort') : p === 2 ? t('priorityMediumShort') : t('priorityLowShort');
  const priorityColor = (p: number) => p === 3 ? '#EF4444' : p === 2 ? '#F59E0B' : c[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <span className="text-4xl">🎯</span> {t('majorGoals')}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>حدد أهدافك طويلة المدى وتابع تقدمك</p>
        </div>
        <button onClick={() => { playClick(); resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all btn-press" style={{ background: `linear-gradient(135deg, ${c[0]}, ${c[1]})`, color: 'var(--text-on-accent)', boxShadow: `0 8px 25px ${c[0]}30` }}>
          <Plus size={18} /> هدف جديد
        </button>
      </div>

      <div className="flex gap-2">
        {(['all', 'active', 'completed'] as const).map(f => (
          <button key={f} onClick={() => { playClick(); setFilter(f); }} className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all btn-press"
            style={{ background: filter === f ? `${c[0]}20` : 'var(--bg-card)', border: filter === f ? `1px solid ${c[0]}40` : '1px solid var(--border-card)', color: filter === f ? c[0] : 'var(--text-muted)' }}>
            {f === 'all' ? '🔵 الكل' : f === 'active' ? '🟢 نشطة' : '✅ مكتملة'} ({goals.filter(g => f === 'all' ? true : f === 'active' ? !g.is_completed : g.is_completed === 1).length})
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" style={{ background: 'var(--modal-overlay)' }} onClick={() => resetForm()}>
          <div className="rounded-3xl p-7 w-full max-w-md modal-content shadow-2xl" style={{ background: 'var(--bg-glass-strong)', backdropFilter: 'blur(30px)', border: '1px solid var(--border-card)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{editingGoal ? '✏️ تعديل الهدف' : '🎯 هدف جديد'}</h3>
              <button onClick={resetForm} className="p-2 rounded-xl btn-press" style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>عنوان الهدف *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: تعلم البرمجة" className="t-input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>الوصف</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="وصف مختصر للهدف..." className="t-input w-full resize-none h-24" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>📅 تاريخ الإنجاز</label>
                  <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="t-input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>🚩 الأولوية</label>
                  <select value={priority} onChange={e => setPriority(Number(e.target.value))} className="t-input w-full">
                    <option value={1}>🟢 منخفضة</option>
                    <option value={2}>🟡 متوسطة</option>
                    <option value={3}>🔴 عالية</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl font-black text-base transition-all btn-press" style={{ background: `linear-gradient(135deg, ${c[0]}, ${c[1]})`, color: 'var(--text-on-accent)', boxShadow: `0 8px 25px ${c[0]}30` }}>
                {editingGoal ? '💾 حفظ التعديلات' : 'إضافة الهدف'}
              </button>
            </form>
          </div>
        </div>
      )}

      {filteredGoals.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-4 float">🎯</div>
          <p className="text-xl font-black" style={{ color: 'var(--text-muted)' }}>لا توجد أهداف بعد</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>ابدأ بإضافة هدفك الأول!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
          {filteredGoals.map(goal => {
            const goalTasks = tasks.filter(t => t.goal_id === goal.id);
            const completedTasks = goalTasks.filter(t => t.status === 'completed').length;
            const daysLeft = goal.target_date ? Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / 86400000) : null;

            return (
              <div key={goal.id} className="t-card p-6 card-hover transition-all" style={{ boxShadow: goal.is_completed ? `0 0 20px ${c[0]}15` : 'none', borderColor: goal.is_completed ? `${c[0]}40` : 'var(--border-card)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <button onClick={() => { playClick(); handleToggleComplete(goal); }}
                      className="mt-0.5 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all btn-press"
                      style={{ background: goal.is_completed ? c[0] : 'transparent', borderColor: goal.is_completed ? c[0] : 'var(--border-input)', boxShadow: goal.is_completed ? `0 4px 12px ${c[0]}30` : 'none' }}>
                      {goal.is_completed ? <Check size={14} color="white" /> : null}
                    </button>
                    <div>
                      <h3 className="font-black text-lg" style={{ color: 'var(--text-primary)', textDecoration: goal.is_completed ? 'line-through' : 'none', opacity: goal.is_completed ? 0.6 : 1 }}>
                        {goal.is_completed && <Trophy size={14} className="inline ml-1" style={{ color: c[0] }} />}
                        {goal.title}
                      </h3>
                      {goal.description && <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{goal.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(goal)} className="p-2 rounded-xl btn-press" style={{ color: 'var(--text-muted)' }}><Edit3 size={14} /></button>
                    <button onClick={() => handleDelete(goal.id)} className="p-2 rounded-xl btn-press hover:text-red-400" style={{ color: 'var(--text-muted)' }}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span className="px-3 py-1 rounded-lg text-xs font-black" style={{ background: `${priorityColor(goal.priority)}15`, color: priorityColor(goal.priority), border: `1px solid ${priorityColor(goal.priority)}25` }}>
                    <Flag size={10} className="inline mr-1" />{priorityLabel(goal.priority)}
                  </span>
                  {goal.target_date && (
                    <span className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg" style={{ color: daysLeft !== null && daysLeft < 0 ? '#EF4444' : 'var(--text-muted)', background: daysLeft !== null && daysLeft < 0 ? '#EF444410' : 'var(--bg-input)' }}>
                      <Calendar size={10} /> {goal.target_date}
                      {daysLeft !== null && daysLeft >= 0 && <span style={{ color: c[0] }} className="mr-1">({daysLeft} يوم)</span>}
                      {daysLeft !== null && daysLeft < 0 && <span className="text-red-400 mr-1">متأخر!</span>}
                    </span>
                  )}
                  {goalTasks.length > 0 && <span className="text-xs px-2 py-1 rounded-lg" style={{ color: 'var(--text-muted)', background: 'var(--bg-input)' }}>{completedTasks}/{goalTasks.length} مهمة</span>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-full h-3 overflow-hidden" style={{ background: 'var(--progress-bg)' }}>
                    <div className={`h-full rounded-full progress-bar-animated ${goal.progress > 0 ? 'progress-bar-glow' : ''}`}
                      style={{ width: `${goal.progress}%`, background: `linear-gradient(90deg, ${c[0]}, ${c[1]})` }} />
                  </div>
                  <span className="text-sm font-black min-w-[3rem] text-left" style={{ color: c[0] }}>{goal.progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
