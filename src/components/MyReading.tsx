import { useState, useEffect, useRef } from 'react';
import { BookOpen, Plus, Play, Pause, Square, Award, Target, BookMarked, X, Save, Clock, BrainCircuit, ChevronRight, Flame, Trash2, Edit3 } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { playClick, playSuccess, playDelete } from '../utils/sounds';
import { ReadingBook } from '../types';

export default function MyReading() {
    const { t, lang } = useLang();

    const [books, setBooks] = useState<ReadingBook[]>(() => {
        const saved = localStorage.getItem('digitpro_reading_books');
        return saved ? JSON.parse(saved) : [];
    });

    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('digitpro_reading_stats');
        return saved ? JSON.parse(saved) : { todayMinutes: 0, streak: 0, lastDate: '', totalHours: 0 };
    });

    const [view, setView] = useState<'library' | 'timer' | 'summary'>('library');
    const [activeBook, setActiveBook] = useState<ReadingBook | null>(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newCat, setNewCat] = useState<ReadingBook['category']>('self-development');
    const [newProg, setNewProg] = useState(0);

    const [timePassedSeconds, setTimePassedSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<number | null>(null);

    const [summaryNotes, setSummaryNotes] = useState('');
    const [summaryLessons, setSummaryLessons] = useState(['', '', '']);
    const [summaryProg, setSummaryProg] = useState(0);

    // Validate dates for daily challenge
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        if (stats.lastDate && stats.lastDate !== today) {
            const last = new Date(stats.lastDate);
            const diff = Math.floor((new Date().getTime() - last.getTime()) / (1000 * 3600 * 24));
            if (diff > 1) {
                setStats((s: any) => ({ ...s, streak: 0, todayMinutes: 0, lastDate: today }));
            } else {
                setStats((s: any) => ({ ...s, todayMinutes: 0, lastDate: today }));
            }
        } else if (!stats.lastDate) {
            setStats((s: any) => ({ ...s, lastDate: today, todayMinutes: 0 }));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('digitpro_reading_books', JSON.stringify(books));
    }, [books]);

    useEffect(() => {
        localStorage.setItem('digitpro_reading_stats', JSON.stringify(stats));
    }, [stats]);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = window.setInterval(() => {
                setTimePassedSeconds(t => t + 1);
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isRunning]);

    const handleAddBook = () => {
        if (!newTitle.trim()) return;
        playSuccess();
        const newBook: ReadingBook = {
            id: Date.now(),
            title: newTitle,
            category: newCat,
            progress: newProg,
            totalMinutes: 0,
            notes: '',
            topLessons: ['', '', ''],
            isFinished: newProg >= 100,
            addedAt: new Date().toISOString()
        };
        setBooks([newBook, ...books]);
        setShowAddModal(false);
        setNewTitle('');
        setNewProg(0);
        setNewCat('self-development');
    };

    const handleStartTimer = (b: ReadingBook) => {
        playClick();
        setActiveBook(b);
        setTimePassedSeconds(0);
        setIsRunning(true);
        setView('timer');
    };

    const handleStopTimer = () => {
        playClick();
        setIsRunning(false);
    };

    const handleFinishSession = () => {
        playSuccess();
        setIsRunning(false);
        const mins = Math.floor(timePassedSeconds / 60);

        if (mins > 0 && activeBook) {
            setBooks(books.map(b => b.id === activeBook.id ? { ...b, totalMinutes: b.totalMinutes + mins } : b));

            setStats((s: any) => {
                let newStreak = s.streak;
                if (s.todayMinutes < 20 && s.todayMinutes + mins >= 20) {
                    newStreak += 1;
                }
                return {
                    ...s,
                    todayMinutes: s.todayMinutes + mins,
                    totalHours: s.totalHours + (mins / 60),
                    streak: newStreak
                };
            });
        }

        setView('library');
        setActiveBook(null);
    };

    const handleOpenSummary = (b: ReadingBook) => {
        playClick();
        setActiveBook(b);
        setSummaryNotes(b.notes || '');
        setSummaryLessons(b.topLessons || ['', '', '']);
        setSummaryProg(b.progress || 0);
        setView('summary');
    };

    const handleSaveSummary = () => {
        if (!activeBook) return;
        playSuccess();
        const isFinished = summaryProg >= 100;
        setBooks(books.map(b => b.id === activeBook.id ? {
            ...b,
            notes: summaryNotes,
            topLessons: summaryLessons,
            progress: summaryProg,
            isFinished
        } : b));
        setView('library');
        setActiveBook(null);
    };

    const deleteBook = (id: number) => {
        playDelete();
        setBooks(books.filter(b => b.id !== id));
    };

    // Derived properties
    const booksFinished = books.filter(b => b.isFinished).length;
    const challengePercent = Math.min(100, Math.round((stats.todayMinutes / 20) * 100));

    const formatTime = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const renderAchievements = () => {
        const items = [
            { key: 'ach_10books', icon: <BookMarked color="#EC4899" />, done: booksFinished >= 10 },
            { key: 'ach_100hours', icon: <Clock color="#8B5CF6" />, done: stats.totalHours >= 100 },
            { key: 'ach_streak', icon: <Flame color="#EF4444" />, done: stats.streak >= 30 }
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {items.map((item, i) => (
                    <div key={i} className={`t-card p-4 flex items-center gap-3 transition-opacity ${item.done ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                            {item.icon}
                        </div>
                        <div>
                            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{t(item.key as any)}</p>
                            <div className="text-xs font-bold" style={{ color: item.done ? '#10B981' : 'var(--text-muted)' }}>
                                {item.done ? (lang === 'ar' ? 'مكتمل' : lang === 'en' ? 'Unlocked' : 'Déverrouillé') : (lang === 'ar' ? 'مغلق' : lang === 'en' ? 'Locked' : 'Verrouillé')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-8 pt-20 max-w-6xl mx-auto page-enter pb-32">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'var(--gradient-primary)', boxShadow: '0 8px 25px var(--shadow-accent)' }}>
                    <BookOpen size={32} style={{ color: 'var(--text-on-accent)' }} />
                </div>
                <div className="text-center sm:text-left" style={lang === 'ar' ? { textAlign: 'right' } : {}}>
                    <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{t('app_myReading_name' as any)}</h1>
                    <p className="font-bold" style={{ color: 'var(--text-secondary)' }}>{t('app_myReading_desc' as any)}</p>
                </div>
            </div>

            {view === 'library' && (
                <div className="space-y-8">
                    {/* Daily Challenge */}
                    <div className="t-card p-6" style={{ background: 'var(--bg-card)' }}>
                        <h3 className="text-xl font-black mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <Target size={24} style={{ color: 'var(--accent-1)' }} />
                            {t('dailyChallengeMessage' as any)}
                        </h3>
                        <div className="relative h-4 mt-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                            <div className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out"
                                style={{ width: `${challengePercent}%`, background: 'var(--gradient-primary)' }} />
                        </div>
                        <p className="text-sm font-bold mt-2" style={{ color: 'var(--text-muted)' }}>
                            {stats.todayMinutes} / 20 {lang === 'ar' ? 'دقيقة' : lang === 'en' ? 'min' : 'min'}
                        </p>
                    </div>

                    {/* Achievements */}
                    <div>
                        <h3 className="text-xl font-black mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <Award size={24} style={{ color: '#F59E0B' }} />
                            {t('achievements' as any)}
                        </h3>
                        {renderAchievements()}
                    </div>

                    {/* Library Section */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <BookOpen size={24} style={{ color: 'var(--accent-2)' }} />
                                {t('myLibrary' as any)}
                            </h3>
                            <button onClick={() => { playClick(); setShowAddModal(true); }} className="t-button py-2 px-4 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg hover:shadow-xl transition-all">
                                <Plus size={18} /> {t('addBook' as any)}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {books.map(b => (
                                <div key={b.id} className="t-card p-5 hover:transform hover:scale-[1.02] transition-all relative group">
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => deleteBook(b.id)} className="p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <h4 className="font-black text-lg mb-1 pr-8 truncate" style={{ color: 'var(--text-primary)' }}>{b.title}</h4>
                                    <p className="text-xs font-bold mb-4" style={{ color: 'var(--accent-1)' }}>
                                        {t(b.category === 'self-development' ? 'cat_selfdev' as any : ('cat_' + b.category) as any) || b.category}
                                    </p>

                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                            <span>{t('readingProgress' as any)}</span>
                                            <span>{b.progress}%</span>
                                        </div>
                                        <div className="h-2 rounded-full" style={{ background: 'var(--bg-input)' }}>
                                            <div className="h-full rounded-full transition-all" style={{ width: `${b.progress}%`, background: 'var(--gradient-primary)' }} />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => handleStartTimer(b)} className="flex-1 py-2 rounded-lg font-bold text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center gap-1" style={{ color: 'var(--text-primary)' }}>
                                            <Clock size={16} /> {lang === 'ar' ? 'مؤقت' : 'Timer'}
                                        </button>
                                        <button onClick={() => handleOpenSummary(b)} className="flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1" style={{ background: 'var(--accent-1)', color: 'white' }}>
                                            <BrainCircuit size={16} /> {lang === 'ar' ? 'ملخص' : 'Summary'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {books.length === 0 && (
                                <div className="col-span-full py-12 text-center text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
                                    {lang === 'ar' ? 'لا توجد كتب في مكتبتك بعد.' : lang === 'en' ? 'No books in your library yet.' : 'Aucun livre dans votre bibliothèque.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {view === 'timer' && activeBook && (
                <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                    <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>{activeBook.title}</h2>
                    <p className="text-sm font-bold mb-12" style={{ color: 'var(--text-secondary)' }}>{t('readingTimer' as any)}</p>

                    <div className="w-64 h-64 rounded-full flex flex-col items-center justify-center shadow-2xl pulse-scale relative" style={{ background: 'var(--bg-card)', border: '8px solid var(--accent-1)' }}>
                        <span className="text-6xl font-black font-mono tracking-wider" style={{ color: 'var(--text-primary)' }}>
                            {formatTime(timePassedSeconds)}
                        </span>
                        <span className="text-xs font-bold mt-2" style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'دقيقة : ثانية' : 'min : sec'}</span>
                    </div>

                    <div className="flex items-center gap-6 mt-16">
                        <button onClick={isRunning ? handleStopTimer : () => { playClick(); setIsRunning(true); }} className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all hover:scale-105" style={{ background: isRunning ? '#F59E0B' : 'var(--accent-1)', color: 'white' }}>
                            {isRunning ? <Pause size={28} /> : <Play size={28} className={lang === 'ar' ? 'rotate-180' : ''} />}
                        </button>
                        <button onClick={handleFinishSession} className="w-16 h-16 rounded-2xl flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-all hover:scale-105 shadow-lg shadow-red-500/30">
                            <Square size={28} />
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{t('finishSession' as any)} ➔ <Square size={12} className="inline" /></p>
                    </div>
                </div>
            )}

            {view === 'summary' && activeBook && (
                <div className="animate-fade-in">
                    <button onClick={() => { playClick(); setView('library'); }} className="mb-6 flex items-center gap-2 font-bold hover:underline" style={{ color: 'var(--text-secondary)' }}>
                        <ChevronRight size={20} className={lang === 'ar' ? '' : 'rotate-180'} />
                        {lang === 'ar' ? 'عودة للمكتبة' : lang === 'en' ? 'Back to Library' : 'Retour à la bibliothèque'}
                    </button>

                    <h2 className="text-2xl font-black mb-8 pb-4 border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-card)' }}>
                        {activeBook.title} - {t('smartSummary' as any)}
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{t('readingProgress' as any)} ({summaryProg}%)</label>
                                <input type="range" min="0" max="100" value={summaryProg} onChange={e => setSummaryProg(Number(e.target.value))} className="w-full accent-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                    <Edit3 size={18} style={{ color: 'var(--accent-1)' }} /> {t('notesAndThoughts' as any)}
                                </label>
                                <textarea
                                    value={summaryNotes}
                                    onChange={e => setSummaryNotes(e.target.value)}
                                    className="t-input w-full min-h-[200px] resize-y"
                                    placeholder={lang === 'ar' ? 'ما رأيك في الكتاب؟ اكتب أفكارك هنا...' : 'What do you think? Write thoughts here...'}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-lg font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <Award size={20} style={{ color: '#F59E0B' }} /> {t('topLessons' as any)}
                            </h4>
                            {[0, 1, 2].map(i => (
                                <div key={i}>
                                    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{t(`lesson${i + 1}` as any)}</label>
                                    <input
                                        type="text"
                                        value={summaryLessons[i]}
                                        onChange={e => {
                                            const n = [...summaryLessons];
                                            n[i] = e.target.value;
                                            setSummaryLessons(n);
                                        }}
                                        className="t-input w-full"
                                        placeholder="..."
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button onClick={handleSaveSummary} className="t-button py-3 px-8 rounded-xl font-bold flex items-center gap-2 shadow-lg">
                            <Save size={20} /> {t('saveBook' as any)}
                        </button>
                    </div>
                </div>
            )}

            {/* Add Book Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--modal-overlay)' }}>
                    <div className="t-card max-w-md w-full p-6 animate-fade-in relative shadow-2xl">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" style={lang === 'ar' ? { right: 'auto', left: '16px' } : {}}>
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>{t('addBook' as any)}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{t('bookTitle' as any)}</label>
                                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="t-input w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{t('bookCategory' as any)}</label>
                                <select value={newCat} onChange={e => setNewCat(e.target.value as any)} className="t-input w-full bg-transparent">
                                    <option value="self-development" className="dark:bg-gray-800">{t('cat_selfdev' as any)}</option>
                                    <option value="money" className="dark:bg-gray-800">{t('cat_money' as any)}</option>
                                    <option value="novels" className="dark:bg-gray-800">{t('cat_novels' as any)}</option>
                                    <option value="languages" className="dark:bg-gray-800">{t('cat_languages' as any)}</option>
                                    <option value="other" className="dark:bg-gray-800">{t('cat_other' as any)}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{t('readingProgress' as any)} ({newProg}%)</label>
                                <input type="range" min="0" max="100" value={newProg} onChange={e => setNewProg(Number(e.target.value))} className="w-full accent-purple-500" />
                            </div>
                        </div>

                        <button onClick={handleAddBook} disabled={!newTitle.trim()} className="t-button w-full mt-8 py-3 rounded-xl font-black shadow-lg disabled:opacity-50">
                            {lang === 'ar' ? 'إضافة للمكتبة' : 'Add to Library'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
