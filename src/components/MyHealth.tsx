import { useState, useMemo, useEffect } from 'react';
import { Activity, Droplet, Flame, BarChart3, Plus, Minus, HeartPulse, Moon, Apple, Dumbbell } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { playClick, playSuccess } from '../utils/sounds';
import { HealthData } from '../types';

export default function MyHealth() {
    const { t } = useLang();

    // Storage for health data
    const [healthDataList, setHealthDataList] = useState<HealthData[]>(() => {
        const data = localStorage.getItem('digitpro_health_data');
        return data ? JSON.parse(data) : [];
    });

    const todaystr = new Date().toISOString().split('T')[0];

    // Get or create today's data
    const todayData = useMemo(() => {
        return healthDataList.find(d => d.date === todaystr) || { date: todaystr, steps: 0, calories: 0, waterGlasses: 0 };
    }, [healthDataList, todaystr]);

    const [stepsInput, setStepsInput] = useState(todayData.steps.toString());

    // Additional metrics states
    const [bloodSugarInput, setBloodSugarInput] = useState(todayData.bloodSugar?.toString() || '');
    const [bloodPressureInput, setBloodPressureInput] = useState(todayData.bloodPressure || '');
    const [weightInput, setWeightInput] = useState(todayData.weight?.toString() || '');
    const [visionInput, setVisionInput] = useState(todayData.vision || '');
    const [sleepHoursInput, setSleepHoursInput] = useState(todayData.sleepHours?.toString() || '');
    const [exerciseMinutesInput, setExerciseMinutesInput] = useState(todayData.exerciseMinutes?.toString() || '');
    const [healthyDiet, setHealthyDiet] = useState(todayData.healthyDiet || false);

    const DAILY_WATER_GOAL = 8;
    const DAILY_STEPS_GOAL = 10000;

    // 1 step approx = 0.04 calories
    const stepsToCalories = (s: number) => Math.round(s * 0.04);

    useEffect(() => {
        localStorage.setItem('digitpro_health_data', JSON.stringify(healthDataList));
    }, [healthDataList]);

    // Update a field for today
    const updateToday = (updates: Partial<HealthData>) => {
        setHealthDataList(prev => {
            const exists = prev.find(d => d.date === todaystr);
            if (exists) {
                return prev.map(d => d.date === todaystr ? { ...d, ...updates } : d);
            }
            return [...prev, { date: todaystr, steps: 0, calories: 0, waterGlasses: 0, ...updates }];
        });
    };

    const handleUpdateSteps = (e: React.FormEvent) => {
        e.preventDefault();
        const steps = parseInt(stepsInput);
        if (!isNaN(steps) && steps >= 0) {
            playSuccess();
            const calories = stepsToCalories(steps);
            updateToday({ steps, calories });
        }
    };

    const handleDrinkWater = (amount: number) => {
        playClick();
        const newAmount = Math.max(0, todayData.waterGlasses + amount);
        updateToday({ waterGlasses: newAmount });
    };

    const handleSaveExtra = (e: React.FormEvent) => {
        e.preventDefault();
        playSuccess();
        updateToday({
            bloodSugar: bloodSugarInput ? Number(bloodSugarInput) : undefined,
            bloodPressure: bloodPressureInput || undefined,
            weight: weightInput ? Number(weightInput) : undefined,
            vision: visionInput || undefined,
            sleepHours: sleepHoursInput ? Number(sleepHoursInput) : undefined,
            exerciseMinutes: exerciseMinutesInput ? Number(exerciseMinutesInput) : undefined,
            healthyDiet
        });
    };

    // Generate last 7 days for the chart
    const weeklyData = useMemo(() => {
        const days: HealthData[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const ds = d.toISOString().split('T')[0];
            const data = healthDataList.find(x => x.date === ds);
            days.push({
                date: ds,
                steps: data?.steps || 0,
                calories: data?.calories || 0,
                waterGlasses: data?.waterGlasses || 0,
            });
        }
        return days;
    }, [healthDataList]);

    const maxWeeklySteps = Math.max(...weeklyData.map(d => d.steps), 1000);

    return (
        <div className="space-y-6 pb-20">

            {/* Top Counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Steps */}
                <div className="t-card p-5 relative overflow-hidden" style={{ background: 'var(--bg-main)' }}>
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <p className="text-sm font-bold opacity-60 mb-1" style={{ color: 'var(--text-primary)' }}>{t('stepsCount' as any)}</p>
                            <h2 className="text-3xl font-black text-blue-500">{todayData.steps.toLocaleString()}</h2>
                        </div>
                        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                            <Activity size={24} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (todayData.steps / DAILY_STEPS_GOAL) * 100)}%` }} />
                        </div>
                    </div>
                </div>

                {/* Calories */}
                <div className="t-card p-5 relative overflow-hidden" style={{ background: 'var(--bg-main)' }}>
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <p className="text-sm font-bold opacity-60 mb-1" style={{ color: 'var(--text-primary)' }}>{t('caloriesBurned' as any)}</p>
                            <h2 className="text-3xl font-black text-orange-500">{todayData.calories.toLocaleString()}</h2>
                        </div>
                        <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                            <Flame size={24} />
                        </div>
                    </div>
                </div>

                {/* Water */}
                <div className="t-card p-5 relative overflow-hidden" style={{ background: 'var(--bg-main)' }}>
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <p className="text-sm font-bold opacity-60 mb-1" style={{ color: 'var(--text-primary)' }}>{t('waterGlasses' as any)}</p>
                            <h2 className="text-3xl font-black text-cyan-500">{todayData.waterGlasses} / {DAILY_WATER_GOAL}</h2>
                        </div>
                        <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500">
                            <Droplet size={24} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                            <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (todayData.waterGlasses / DAILY_WATER_GOAL) * 100)}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Actions panel */}
                <div className="space-y-6">

                    {/* Add Steps */}
                    <div className="t-card p-5 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="text-blue-500" />
                            <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{t('stepsTracking' as any)}</h3>
                        </div>
                        <form onSubmit={handleUpdateSteps} className="flex gap-3">
                            <input
                                type="number"
                                min="0"
                                value={stepsInput}
                                onChange={e => setStepsInput(e.target.value)}
                                className="t-input flex-1 text-xl font-bold font-mono"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 rounded-xl font-bold text-white btn-press transition-all shadow-xl whitespace-nowrap"
                                style={{ background: 'var(--gradient-primary)' }}
                            >
                                {t('saveHealthData' as any)}
                            </button>
                        </form>
                    </div>

                    {/* Add Water */}
                    <div className="t-card p-5 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <Droplet className="text-cyan-500" />
                                <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{t('waterReminder' as any)}</h3>
                            </div>
                        </div>

                        <div className="flex items-center justify-around p-4 rounded-xl" style={{ background: 'var(--bg-main)' }}>
                            <button onClick={() => handleDrinkWater(-1)} className="p-4 rounded-full bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500 text-white transition-colors" style={{ color: 'var(--text-primary)' }}>
                                <Minus size={24} />
                            </button>

                            <div className="text-center">
                                <span className="text-4xl font-black text-cyan-500">{todayData.waterGlasses}</span>
                                <span className="text-sm font-bold opacity-60 block mt-1" style={{ color: 'var(--text-primary)' }}>{t('waterGlasses' as any)}</span>
                            </div>

                            <button onClick={() => handleDrinkWater(1)} className="p-4 rounded-full bg-cyan-500 btn-press shadow-xl text-white">
                                <Plus size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Vitals Form */}
                    <div className="t-card p-5 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <HeartPulse className="text-red-500" />
                            <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{t('healthVitals' as any)}</h3>
                        </div>
                        <form onSubmit={handleSaveExtra} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{t('bloodSugar' as any)}</label>
                                    <input type="number" value={bloodSugarInput} onChange={e => setBloodSugarInput(e.target.value)} placeholder={t('bloodSugarUnit' as any)} className="t-input w-full" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{t('bloodPressure' as any)}</label>
                                    <input type="text" value={bloodPressureInput} onChange={e => setBloodPressureInput(e.target.value)} placeholder={t('bloodPressureFormat' as any)} className="t-input w-full" />
                                </div>
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{t('weight' as any)}</label>
                                        <div className="flex bg-[var(--bg-main)] rounded-xl items-center pr-3">
                                            <input type="number" step="0.1" value={weightInput} onChange={e => setWeightInput(e.target.value)} className="t-input flex-1 border-0 bg-transparent" placeholder="0" />
                                            <span className="text-xs font-bold text-[var(--text-muted)]">{t('weightUnit' as any)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{t('vision' as any)}</label>
                                    <input type="text" value={visionInput} onChange={e => setVisionInput(e.target.value)} placeholder={t('visionFormat' as any)} className="t-input w-full" />
                                </div>
                            </div>

                            <hr style={{ borderColor: 'var(--border-card)' }} />

                            <div className="flex items-center gap-3 mb-2">
                                <Apple className="text-green-500" />
                                <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{t('lifestyle' as any)}</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Moon size={14} /> {t('sleepHours' as any)}</label>
                                    <input type="number" step="0.5" value={sleepHoursInput} onChange={e => setSleepHoursInput(e.target.value)} placeholder="8" className="t-input w-full" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Dumbbell size={14} /> {t('exerciseMinutes' as any)}</label>
                                    <input type="number" value={exerciseMinutesInput} onChange={e => setExerciseMinutesInput(e.target.value)} placeholder="30" className="t-input w-full" />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-main)' }}>
                                <input type="checkbox" id="dietCheck" checked={healthyDiet} onChange={e => setHealthyDiet(e.target.checked)} className="w-5 h-5 accent-green-500" />
                                <label htmlFor="dietCheck" className="font-bold cursor-pointer flex-1" style={{ color: 'var(--text-primary)' }}>{t('dietFollowed' as any)}</label>
                            </div>

                            <button type="submit" className="w-full py-3 rounded-xl font-bold text-white btn-press transition-all shadow-xl" style={{ background: 'var(--gradient-accent)' }}>
                                {t('saveHealthData' as any)}
                            </button>
                        </form>
                    </div>

                </div>

                {/* Reports Panel */}
                <div className="t-card p-5">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart3 className="text-purple-500" />
                        <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{t('weeklyHealthReport' as any)}</h3>
                    </div>

                    <div className="space-y-6">
                        {/* Steps Chart */}
                        <div>
                            <p className="text-sm font-bold opacity-60 mb-4" style={{ color: 'var(--text-primary)' }}>{t('stepsTracking' as any)} (7 Days)</p>
                            <div className="flex items-end gap-2 h-32">
                                {weeklyData.map((d, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                        {/* Tooltip */}
                                        <div className="absolute -top-8 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                                            {d.steps.toLocaleString()} {t('stepsCount' as any)}
                                        </div>

                                        {/* Bar */}
                                        <div className="w-full bg-blue-500/20 rounded-t-md relative flex items-end overflow-hidden h-full">
                                            <div
                                                className="w-full bg-blue-500 rounded-t-md transition-all duration-700 hover:bg-blue-400 group-hover:scale-105"
                                                style={{ height: `${Math.max(5, (d.steps / maxWeeklySteps) * 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold opacity-50 block truncate w-full text-center" style={{ color: 'var(--text-primary)' }}>
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(d.date).getDay()]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stats Summary */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border-card)]">
                            <div className="p-3 rounded-xl" style={{ background: 'var(--bg-main)' }}>
                                <p className="text-xs font-bold opacity-60 mb-1" style={{ color: 'var(--text-primary)' }}>{t('avgSteps' as any)}</p>
                                <p className="text-xl font-black text-blue-500">
                                    {Math.round(weeklyData.reduce((s, d) => s + d.steps, 0) / 7).toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl" style={{ background: 'var(--bg-main)' }}>
                                <p className="text-xs font-bold opacity-60 mb-1" style={{ color: 'var(--text-primary)' }}>{t('totalWater' as any)}</p>
                                <p className="text-xl font-black text-cyan-500">
                                    {weeklyData.reduce((s, d) => s + d.waterGlasses, 0)} {t('waterGlasses' as any)}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
