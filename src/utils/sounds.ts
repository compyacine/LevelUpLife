// Advanced Sound System using Web Audio API
let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  localStorage.setItem('tm_sound_enabled', JSON.stringify(enabled));
}

export function isSoundEnabled(): boolean {
  const stored = localStorage.getItem('tm_sound_enabled');
  if (stored !== null) soundEnabled = JSON.parse(stored);
  return soundEnabled;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15, delay = 0) {
  if (!soundEnabled) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch { /* silent fail */ }
}

// Click sound - subtle
export function playClick() {
  playTone(600, 0.08, 'sine', 0.06);
}

// Success/Complete sound - two ascending tones
export function playSuccess() {
  playTone(523, 0.15, 'sine', 0.12, 0);
  playTone(659, 0.15, 'sine', 0.12, 0.12);
  playTone(784, 0.25, 'sine', 0.15, 0.24);
}

// Task complete - satisfying ding
export function playTaskComplete() {
  playTone(880, 0.12, 'sine', 0.1, 0);
  playTone(1109, 0.2, 'sine', 0.12, 0.1);
}

// Level up fanfare!
export function playLevelUp() {
  const notes = [523, 659, 784, 1047, 784, 1047, 1319];
  notes.forEach((freq, i) => {
    playTone(freq, 0.18, 'sine', 0.12, i * 0.1);
    playTone(freq * 1.5, 0.18, 'triangle', 0.05, i * 0.1);
  });
}

// Achievement unlock
export function playAchievement() {
  playTone(659, 0.1, 'sine', 0.1, 0);
  playTone(784, 0.1, 'sine', 0.1, 0.1);
  playTone(988, 0.1, 'sine', 0.1, 0.2);
  playTone(1319, 0.3, 'sine', 0.15, 0.3);
  playTone(1319, 0.3, 'triangle', 0.06, 0.3);
}

// Streak sound
export function playStreak() {
  playTone(440, 0.12, 'sine', 0.1, 0);
  playTone(554, 0.12, 'sine', 0.1, 0.1);
  playTone(659, 0.12, 'sine', 0.1, 0.2);
  playTone(880, 0.25, 'sine', 0.15, 0.3);
}

// Timer tick
export function playTick() {
  playTone(1000, 0.03, 'sine', 0.03);
}

// Timer complete - bell-like
export function playTimerComplete() {
  playTone(880, 0.5, 'sine', 0.15, 0);
  playTone(880, 0.5, 'sine', 0.1, 0.6);
  playTone(1109, 0.5, 'sine', 0.15, 1.2);
  playTone(880, 0.8, 'sine', 0.12, 1.8);
  // Add shimmer
  playTone(1760, 0.3, 'triangle', 0.04, 0);
  playTone(1760, 0.3, 'triangle', 0.04, 0.6);
  playTone(2217, 0.3, 'triangle', 0.04, 1.2);
}

// Error/Warning sound
export function playError() {
  playTone(200, 0.2, 'sawtooth', 0.08, 0);
  playTone(180, 0.3, 'sawtooth', 0.06, 0.2);
}

// Delete sound
export function playDelete() {
  playTone(400, 0.1, 'sine', 0.08, 0);
  playTone(300, 0.15, 'sine', 0.06, 0.08);
}

// Points earned
export function playPoints() {
  playTone(1047, 0.08, 'sine', 0.08, 0);
  playTone(1319, 0.12, 'sine', 0.1, 0.06);
}

// Habit check
export function playHabitCheck() {
  playTone(660, 0.1, 'sine', 0.1, 0);
  playTone(990, 0.15, 'sine', 0.12, 0.08);
}

// Navigation
export function playNav() {
  playTone(500, 0.06, 'sine', 0.04);
}

// Start timer
export function playStartTimer() {
  playTone(440, 0.1, 'sine', 0.08, 0);
  playTone(660, 0.1, 'sine', 0.08, 0.08);
  playTone(880, 0.15, 'sine', 0.1, 0.16);
}

// Pause timer
export function playPauseTimer() {
  playTone(660, 0.12, 'sine', 0.08, 0);
  playTone(440, 0.15, 'sine', 0.06, 0.1);
}

// Motivational chime (for quotes/tips)
export function playMotivational() {
  playTone(523, 0.2, 'sine', 0.06, 0);
  playTone(659, 0.2, 'sine', 0.06, 0.15);
  playTone(784, 0.3, 'sine', 0.08, 0.3);
  playTone(1047, 0.4, 'triangle', 0.04, 0.45);
}
