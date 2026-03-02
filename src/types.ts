export interface Goal {
  id: number;
  title: string;
  description: string;
  target_date: string;
  priority: number;
  progress: number;
  created_at: string;
  is_completed: number;
}

export interface Task {
  id: number;
  goal_id: number | null;
  title: string;
  description: string;
  due_date: string;
  estimated_minutes: number;
  status: 'pending' | 'completed';
  priority: number;
  created_at: string;
  completed_at: string | null;
}

export interface FocusSession {
  id: number;
  task_id: number | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  completed: number;
}

export interface Habit {
  id: number;
  title: string;
  description: string;
  target_frequency: number;
  streak: number;
  created_at: string;
}

export interface HabitLog {
  id: number;
  habit_id: number;
  date: string;
  completed: number;
}

export interface UserStats {
  id: number;
  total_points: number;
  level: number;
  streak_days: number;
  last_active_date: string;
}

export interface DailySummary {
  id: number;
  date: string;
  tasks_completed: number;
  focus_minutes: number;
  habits_completed: number;
  productivity_score: number;
}

export interface WalletTransaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
}

export interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  date: string;
  created_at: string;
  updated_at: string;
  mood?: 'happy' | 'sad' | 'neutral' | 'excited' | 'stressed' | 'grateful';
}

export interface HealthData {
  date: string; // YYYY-MM-DD
  steps: number;
  calories: number;
  waterGlasses: number;
  bloodSugar?: number; // mg/dL
  bloodPressure?: string; // e.g. "120/80"
  weight?: number; // kg
  vision?: string; // e.g. "6/6"
  healthyDiet?: boolean;
  sleepHours?: number;
  exerciseMinutes?: number;
}
export interface ReadingBook {
  id: number;
  title: string;
  category: 'self-development' | 'money' | 'novels' | 'languages' | 'other';
  progress: number; // 0-100%
  totalMinutes: number;
  notes: string;
  topLessons: string[]; // up to 3
  isFinished: boolean;
  addedAt: string;
}

export type Page = 'dashboard' | 'goals' | 'tasks' | 'focus' | 'habits' | 'analytics' | 'contact' | 'settings' | 'myWallet' | 'myHealth' | 'myDiary' | 'myReading';

export interface AppSettings {
  showWhatsApp: boolean;
  passwordEnabled: boolean;
  passwordHash: string;
  lockOnClose: boolean;
  autoLockMinutes: number;
}
