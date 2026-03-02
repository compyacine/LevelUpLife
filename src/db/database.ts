import { Goal, Task, FocusSession, Habit, HabitLog, UserStats, DailySummary } from '../types';

const KEYS = {
  goals: 'tm_goals',
  tasks: 'tm_tasks',
  focus_sessions: 'tm_focus_sessions',
  habits: 'tm_habits',
  habit_logs: 'tm_habit_logs',
  user_stats: 'tm_user_stats',
  daily_summary: 'tm_daily_summary',
  counters: 'tm_counters',
};

function getStore<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setStore<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getNextId(table: string): number {
  const counters = JSON.parse(localStorage.getItem(KEYS.counters) || '{}');
  const next = (counters[table] || 0) + 1;
  counters[table] = next;
  localStorage.setItem(KEYS.counters, JSON.stringify(counters));
  return next;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function now(): string {
  return new Date().toISOString();
}

// ===== GOALS =====
export function getGoals(): Goal[] {
  return getStore<Goal>(KEYS.goals);
}

export function addGoal(goal: Omit<Goal, 'id' | 'created_at' | 'progress' | 'is_completed'>): Goal {
  const goals = getGoals();
  const newGoal: Goal = {
    ...goal,
    id: getNextId('goals'),
    progress: 0,
    created_at: now(),
    is_completed: 0,
  };
  goals.push(newGoal);
  setStore(KEYS.goals, goals);
  addPoints(10);
  return newGoal;
}

export function updateGoal(id: number, updates: Partial<Goal>): void {
  const goals = getGoals();
  const idx = goals.findIndex(g => g.id === id);
  if (idx !== -1) {
    goals[idx] = { ...goals[idx], ...updates };
    setStore(KEYS.goals, goals);
  }
}

export function deleteGoal(id: number): void {
  setStore(KEYS.goals, getGoals().filter(g => g.id !== id));
  // Also delete associated tasks
  const tasks = getTasks().filter(t => t.goal_id === id);
  tasks.forEach(t => deleteTask(t.id));
}

export function recalcGoalProgress(goalId: number): void {
  const tasks = getTasks().filter(t => t.goal_id === goalId);
  if (tasks.length === 0) return;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const progress = Math.round((completed / tasks.length) * 100);
  updateGoal(goalId, { progress, is_completed: progress === 100 ? 1 : 0 });
}

// ===== TASKS =====
export function getTasks(): Task[] {
  return getStore<Task>(KEYS.tasks);
}

export function addTask(task: Omit<Task, 'id' | 'created_at' | 'status' | 'completed_at'>): Task {
  const tasks = getTasks();
  const newTask: Task = {
    ...task,
    id: getNextId('tasks'),
    status: 'pending',
    created_at: now(),
    completed_at: null,
  };
  tasks.push(newTask);
  setStore(KEYS.tasks, tasks);
  addPoints(5);
  return newTask;
}

export function updateTask(id: number, updates: Partial<Task>): void {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], ...updates };
    setStore(KEYS.tasks, tasks);
  }
}

export function completeTask(id: number): void {
  updateTask(id, { status: 'completed', completed_at: now() });
  const task = getTasks().find(t => t.id === id);
  if (task?.goal_id) recalcGoalProgress(task.goal_id);
  addPoints(20);
  updateDailySummary();
}

export function deleteTask(id: number): void {
  const task = getTasks().find(t => t.id === id);
  setStore(KEYS.tasks, getTasks().filter(t => t.id !== id));
  // Delete associated focus sessions
  setStore(KEYS.focus_sessions, getFocusSessions().filter(f => f.task_id !== id));
  if (task?.goal_id) recalcGoalProgress(task.goal_id);
}

// ===== FOCUS SESSIONS =====
export function getFocusSessions(): FocusSession[] {
  return getStore<FocusSession>(KEYS.focus_sessions);
}

export function addFocusSession(session: Omit<FocusSession, 'id'>): FocusSession {
  const sessions = getFocusSessions();
  const newSession: FocusSession = {
    ...session,
    id: getNextId('focus_sessions'),
  };
  sessions.push(newSession);
  setStore(KEYS.focus_sessions, sessions);
  if (session.completed) addPoints(15);
  updateDailySummary();
  return newSession;
}

// ===== HABITS =====
export function getHabits(): Habit[] {
  return getStore<Habit>(KEYS.habits);
}

export function addHabit(habit: Omit<Habit, 'id' | 'created_at' | 'streak'>): Habit {
  const habits = getHabits();
  const newHabit: Habit = {
    ...habit,
    id: getNextId('habits'),
    streak: 0,
    created_at: now(),
  };
  habits.push(newHabit);
  setStore(KEYS.habits, habits);
  addPoints(5);
  return newHabit;
}

export function updateHabit(id: number, updates: Partial<Habit>): void {
  const habits = getHabits();
  const idx = habits.findIndex(h => h.id === id);
  if (idx !== -1) {
    habits[idx] = { ...habits[idx], ...updates };
    setStore(KEYS.habits, habits);
  }
}

export function deleteHabit(id: number): void {
  setStore(KEYS.habits, getHabits().filter(h => h.id !== id));
  setStore(KEYS.habit_logs, getHabitLogs().filter(l => l.habit_id !== id));
}

// ===== HABIT LOGS =====
export function getHabitLogs(): HabitLog[] {
  return getStore<HabitLog>(KEYS.habit_logs);
}

export function toggleHabitLog(habitId: number, date: string): void {
  const logs = getHabitLogs();
  const existing = logs.findIndex(l => l.habit_id === habitId && l.date === date);
  if (existing !== -1) {
    if (logs[existing].completed) {
      logs[existing].completed = 0;
    } else {
      logs[existing].completed = 1;
    }
  } else {
    logs.push({ id: getNextId('habit_logs'), habit_id: habitId, date, completed: 1 });
    addPoints(10);
  }
  setStore(KEYS.habit_logs, logs);

  // Update streak
  const habitLogs = logs.filter(l => l.habit_id === habitId && l.completed === 1);
  const dates = habitLogs.map(l => l.date).sort().reverse();
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(d);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    if (dates.includes(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  updateHabit(habitId, { streak });
  updateDailySummary();
}

export function isHabitCompletedToday(habitId: number): boolean {
  const logs = getHabitLogs();
  return logs.some(l => l.habit_id === habitId && l.date === today() && l.completed === 1);
}

// ===== USER STATS =====
export function getUserStats(): UserStats {
  const data = localStorage.getItem(KEYS.user_stats);
  if (data) return JSON.parse(data);
  const initial: UserStats = { id: 1, total_points: 0, level: 1, streak_days: 0, last_active_date: today() };
  localStorage.setItem(KEYS.user_stats, JSON.stringify(initial));
  return initial;
}

export function addPoints(pts: number): void {
  const stats = getUserStats();
  stats.total_points += pts;
  stats.level = Math.floor(stats.total_points / 100) + 1;
  
  const lastActive = stats.last_active_date;
  const todayStr = today();
  if (lastActive !== todayStr) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (lastActive === yesterdayStr) {
      stats.streak_days += 1;
    } else if (lastActive !== todayStr) {
      stats.streak_days = 1;
    }
    stats.last_active_date = todayStr;
  }
  
  localStorage.setItem(KEYS.user_stats, JSON.stringify(stats));
}

// ===== DAILY SUMMARY =====
export function getDailySummaries(): DailySummary[] {
  return getStore<DailySummary>(KEYS.daily_summary);
}

export function updateDailySummary(): void {
  const todayStr = today();
  const summaries = getDailySummaries();
  const tasks = getTasks();
  const sessions = getFocusSessions();
  const habits = getHabits();

  const tasksCompleted = tasks.filter(t => t.status === 'completed' && t.completed_at?.startsWith(todayStr)).length;
  const focusMinutes = sessions.filter(s => s.start_time.startsWith(todayStr) && s.completed).reduce((sum, s) => sum + s.duration_minutes, 0);
  const habitsCompleted = habits.filter(h => isHabitCompletedToday(h.id)).length;

  const totalPossible = Math.max(1, tasks.filter(t => t.due_date === todayStr || (t.status === 'completed' && t.completed_at?.startsWith(todayStr))).length + habits.length);
  const score = Math.min(100, Math.round(((tasksCompleted + habitsCompleted) / totalPossible) * 100));

  const existing = summaries.findIndex(s => s.date === todayStr);
  const summary: DailySummary = {
    id: existing !== -1 ? summaries[existing].id : getNextId('daily_summary'),
    date: todayStr,
    tasks_completed: tasksCompleted,
    focus_minutes: focusMinutes,
    habits_completed: habitsCompleted,
    productivity_score: score,
  };

  if (existing !== -1) {
    summaries[existing] = summary;
  } else {
    summaries.push(summary);
  }
  setStore(KEYS.daily_summary, summaries);
}

export function getTodaySummary(): DailySummary {
  updateDailySummary();
  const summaries = getDailySummaries();
  return summaries.find(s => s.date === today()) || {
    id: 0,
    date: today(),
    tasks_completed: 0,
    focus_minutes: 0,
    habits_completed: 0,
    productivity_score: 0,
  };
}

export function getLast7DaysSummaries(): DailySummary[] {
  const summaries = getDailySummaries();
  const result: DailySummary[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const existing = summaries.find(s => s.date === dateStr);
    result.push(existing || {
      id: 0,
      date: dateStr,
      tasks_completed: 0,
      focus_minutes: 0,
      habits_completed: 0,
      productivity_score: 0,
    });
  }
  return result;
}
