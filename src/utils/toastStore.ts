// Global toast notification store
export type ToastType = 'success' | 'achievement' | 'levelup' | 'streak' | 'warning' | 'info' | 'motivational' | 'points';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
  emoji?: string;
  points?: number;
  duration?: number;
}

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
let nextId = 1;
const listeners: Set<Listener> = new Set();

function notify() {
  listeners.forEach(l => l([...toasts]));
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToasts() {
  return toasts;
}

export function addToast(toast: Omit<Toast, 'id'>) {
  const id = nextId++;
  const newToast = { ...toast, id };
  toasts = [newToast, ...toasts].slice(0, 5);
  notify();

  setTimeout(() => {
    removeToast(id);
  }, toast.duration || 4000);

  return id;
}

export function removeToast(id: number) {
  toasts = toasts.filter(t => t.id !== id);
  notify();
}

// Confetti trigger
let confettiCallback: (() => void) | null = null;
export function setConfettiCallback(cb: () => void) {
  confettiCallback = cb;
}
export function triggerConfetti() {
  confettiCallback?.();
}

// Motivational messages
const motivationalMessages = [
  { title: 'أحسنت! 🌟', message: 'استمر في العمل الرائع!' },
  { title: 'رائع! 🔥', message: 'أنت على الطريق الصحيح!' },
  { title: 'ممتاز! 💪', message: 'كل خطوة تقربك من هدفك!' },
  { title: 'مذهل! ⭐', message: 'إنتاجيتك في تصاعد!' },
  { title: 'بطل! 🏆', message: 'لا شيء يوقفك!' },
  { title: 'عظيم! 🎯', message: 'تركيزك يصنع المعجزات!' },
  { title: 'واصل! 🚀', message: 'النجاح عادة، وأنت تبنيها!' },
  { title: 'مبدع!', message: 'أنت تتجاوز نفسك كل يوم!' },
  { title: 'قوي! 💎', message: 'الالتزام مفتاح النجاح!' },
  { title: 'هائل! 🎉', message: 'أداؤك يتحسن باستمرار!' },
];

export function getRandomMotivation() {
  return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
}

// Achievement messages
export function showTaskCompleteToast(taskName: string) {
  const msg = getRandomMotivation();
  addToast({
    type: 'success',
    title: msg.title,
    message: `أنجزت: ${taskName}`,
    emoji: '✅',
    points: 20,
    duration: 3500,
  });
}

export function showGoalCompleteToast(goalName: string) {
  addToast({
    type: 'achievement',
    title: '🏆 إنجاز عظيم!',
    message: `أكملت الهدف: ${goalName}`,
    emoji: '🎯',
    points: 50,
    duration: 5000,
  });
  triggerConfetti();
}

export function showLevelUpToast(level: number) {
  addToast({
    type: 'levelup',
    title: '🎊 ارتقيت للمستوى التالي!',
    message: `أنت الآن في المستوى ${level}`,
    emoji: '⚡',
    duration: 6000,
  });
  triggerConfetti();
}

export function showStreakToast(days: number) {
  addToast({
    type: 'streak',
    title: `🔥 سلسلة ${days} يوم!`,
    message: 'التزامك المتواصل يصنع الفرق!',
    emoji: '🔥',
    duration: 4000,
  });
}

export function showHabitToast(habitName: string) {
  addToast({
    type: 'success',
    title: 'عادة مكتملة!',
    message: habitName,
    emoji: '💚',
    points: 10,
    duration: 3000,
  });
}

export function showFocusCompleteToast(minutes: number) {
  addToast({
    type: 'achievement',
    title: '🧠 جلسة تركيز مكتملة!',
    message: `أنجزت ${minutes} دقيقة من التركيز العميق`,
    emoji: '⏱️',
    points: 15,
    duration: 4500,
  });
}

export function showPointsToast(points: number, reason: string) {
  addToast({
    type: 'points',
    title: `+${points} نقطة!`,
    message: reason,
    emoji: '💰',
    points,
    duration: 2500,
  });
}

export function showMotivationalToast() {
  const msg = getRandomMotivation();
  addToast({
    type: 'motivational',
    title: msg.title,
    message: msg.message,
    duration: 5000,
  });
}
