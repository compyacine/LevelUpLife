import { useState } from 'react';
import { Plus, Trash2, Edit3, Calendar, Clock, Flag, X, Check, Target, CheckSquare } from 'lucide-react';
import { getTasks, addTask, updateTask, completeTask, deleteTask, getGoals } from '../db/database';
import { Task } from '../types';
import { playClick, playTaskComplete, playSuccess, playDelete } from '../utils/sounds';
import { showTaskCompleteToast, showPointsToast } from '../utils/toastStore';
import { useTheme } from '../contexts/ThemeContext';

interface TasksProps { onRefresh: () => void; }

export default function Tasks({ onRefresh }: TasksProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalId, setGoalId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);
  const [priority, setPriority] = useState(1);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'today'>('all');
  const { config } = useTheme();
  const c = config.preview;

  const tasks = getTasks();
  const goals = getGoals();
  const today = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    if (filter === 'today') return t.due_date === today;
    return true;
  }).sort((a, b) => { if (a.status !== b.status) return a.status === 'pending' ? -1 : 1; return b.priority - a.priority; });

  const resetForm = () => { setTitle(''); setDescription(''); setGoalId(null); setDueDate(''); setEstimatedMinutes(25); setPriority(1); setEditingTask(null); setShowForm(false); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (editingTask) { updateTask(editingTask.id, { title, description, goal_id: goalId, due_date: dueDate, estimated_minutes: estimatedMinutes, priority }); }
    else { addTask({ title, description, goal_id: goalId, due_date: dueDate, estimated_minutes: estimatedMinutes, priority }); showPointsToast(5, 'إضافة مهمة جديدة'); }
    playSuccess(); resetForm(); onRefresh();
  };

  const handleEdit = (task: Task) => { setEditingTask(task); setTitle(task.title); setDescription(task.description); setGoalId(task.goal_id); setDueDate(task.due_date); setEstimatedMinutes(task.estimated_minutes); setPriority(task.priority); setShowForm(true); };
  const handleComplete = (task: Task) => { if (task.status === 'completed') { updateTask(task.id, { status: 'pending', completed_at: null }); } else { completeTask(task.id); playTaskComplete(); showTaskCompleteToast(task.title); } onRefresh(); };
  const handleDelete = (id: number) => { playDelete(); deleteTask(id); onRefresh(); };

  const priorityColor = (p: number) => p === 3 ? '#EF4444' : p === 2 ? '#F59E0B' : c[1];
  const priorityLabel = (p: number) => p === 3 ? '🔴 عالية' : p === 2 ? '🟡 متوسطة' : '🔵 منخفضة';

  const filterCounts = { all: tasks.length, pending: tasks.filter(t => t.status === 'pending').length, completed: tasks.filter(t => t.status === 'completed').length, today: tasks.filter(t => t.due_date === today).length };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <span className="text-4xl">✅</span> المهام
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>نظّم مهامك وتابع إنجازها</p>
        </div>
        <button onClick={() => { playClick(); resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all btn-press" style={{ background: `linear-gradient(135deg, ${c[1]}, ${c[2]})`, color: 'var(--text-on-accent)', boxShadow: `0 8px 25px ${c[1]}30` }}>
          <Plus size={18} /> مهمة جديدة
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {([{ key: 'all' as const, label: '📋 الكل' }, { key: 'pending' as const, label: '⏳ معلقة' }, { key: 'completed' as const, label: '✅ مكتملة' }, { key: 'today' as const, label: '📅 اليوم' }]).map(f => (
          <button key={f.key} onClick={() => { playClick(); setFilter(f.key); }}
            className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all btn-press"
            style={{ background: filter === f.key ? `${c[1]}20` : 'var(--bg-card)', border: filter === f.key ? `1px solid ${c[1]}40` : '1px solid var(--border-card)', color: filter === f.key ? c[1] : 'var(--text-muted)' }}>
            {f.label} ({filterCounts[f.key]})
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" style={{ background: 'var(--modal-overlay)' }} onClick={() => resetForm()}>
          <div className="rounded-3xl p-7 w-full max-w-md modal-content shadow-2xl" style={{ background: 'var(--bg-glass-strong)', backdropFilter: 'blur(30px)', border: '1px solid var(--border-card)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{editingTask ? '✏️ تعديل المهمة' : '✅ مهمة جديدة'}</h3>
              <button onClick={resetForm} className="p-2 rounded-xl btn-press" style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>عنوان المهمة *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: قراءة الفصل الأول" className="t-input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>الوصف</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="تفاصيل المهمة..." className="t-input w-full resize-none h-20" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>🎯 الهدف المرتبط</label>
                <select value={goalId || ''} onChange={e => setGoalId(e.target.value ? Number(e.target.value) : null)} className="t-input w-full">
                  <option value="">بدون هدف</option>
                  {goals.filter(g => !g.is_completed).map(g => (<option key={g.id} value={g.id}>{g.title}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>📅 الموعد</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="t-input w-full text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>⏱ المدة</label>
                  <input type="number" value={estimatedMinutes} onChange={e => setEstimatedMinutes(Number(e.target.value))} min={5} className="t-input w-full text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>🚩 الأولوية</label>
                  <select value={priority} onChange={e => setPriority(Number(e.target.value))} className="t-input w-full text-sm">
                    <option value={1}>منخفضة</option><option value={2}>متوسطة</option><option value={3}>عالية</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl font-black transition-all btn-press" style={{ background: `linear-gradient(135deg, ${c[1]}, ${c[2]})`, color: 'var(--text-on-accent)', boxShadow: `0 8px 25px ${c[1]}30` }}>
                {editingTask ? '💾 حفظ التعديلات' : 'إضافة المهمة'}
              </button>
            </form>
          </div>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-4 float"><CheckSquare size={64} className="mx-auto" style={{ color: 'var(--text-muted)' }} /></div>
          <p className="text-xl font-black" style={{ color: 'var(--text-muted)' }}>لا توجد مهام</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>أضف مهمتك الأولى!</p>
        </div>
      ) : (
        <div className="space-y-2 stagger-children">
          {filteredTasks.map(task => {
            const goal = goals.find(g => g.id === task.goal_id);
            const isOverdue = task.due_date && task.due_date < today && task.status === 'pending';
            return (
              <div key={task.id} className="t-card p-4 transition-all card-hover group" style={{ opacity: task.status === 'completed' ? 0.7 : 1, borderColor: isOverdue ? '#EF444430' : 'var(--border-card)', background: isOverdue ? '#EF444408' : 'var(--bg-card)' }}>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleComplete(task)}
                    className="w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0 btn-press"
                    style={{ background: task.status === 'completed' ? c[1] : 'transparent', borderColor: task.status === 'completed' ? c[1] : 'var(--border-input)', boxShadow: task.status === 'completed' ? `0 4px 12px ${c[1]}30` : 'none' }}>
                    {task.status === 'completed' ? <Check size={14} color="white" /> : null}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold" style={{ color: 'var(--text-primary)', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</h3>
                      {goal && (
                        <span className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold" style={{ color: c[0], background: `${c[0]}12`, border: `1px solid ${c[0]}20` }}>
                          <Target size={9} /> {goal.title}
                        </span>
                      )}
                    </div>
                    {task.description && <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{task.description}</p>}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-black" style={{ background: `${priorityColor(task.priority)}15`, color: priorityColor(task.priority), border: `1px solid ${priorityColor(task.priority)}25` }}>
                        <Flag size={8} className="inline mr-0.5" />{priorityLabel(task.priority)}
                      </span>
                      {task.due_date && <span className="text-xs flex items-center gap-1" style={{ color: isOverdue ? '#EF4444' : 'var(--text-muted)', fontWeight: isOverdue ? 700 : 400 }}><Calendar size={10} /> {task.due_date} {isOverdue && '⚠️'}</span>}
                      {task.estimated_minutes > 0 && <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Clock size={10} /> {task.estimated_minutes}د</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button onClick={() => handleEdit(task)} className="p-2 rounded-xl btn-press" style={{ color: 'var(--text-muted)' }}><Edit3 size={14} /></button>
                    <button onClick={() => handleDelete(task.id)} className="p-2 rounded-xl btn-press hover:text-red-400" style={{ color: 'var(--text-muted)' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
