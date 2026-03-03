import { useState, useMemo, useEffect, useRef } from 'react';
import { Book, Plus, Search, Trash2, Edit2, Lock, Calendar, Bold, Italic, Underline, List, X } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { playClick, playSuccess, playDelete } from '../utils/sounds';
import { DiaryEntry } from '../types';

export default function MyDiary() {
    const { t, lang } = useLang();

    // Storage for entries and settings
    const [entries, setEntries] = useState<DiaryEntry[]>(() => {
        const data = localStorage.getItem('digitpro_diary_entries');
        return data ? JSON.parse(data) : [];
    });

    const [password, setPassword] = useState(() => localStorage.getItem('digitpro_diary_pwd') || '');
    const [isLocked, setIsLocked] = useState(!!password);
    const [lockInput, setLockInput] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentEntry, setCurrentEntry] = useState<DiaryEntry | null>(null);

    // Form fields
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const editorRef = useRef<HTMLDivElement>(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    const dateLocale = lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-US' : 'ar-u-nu-latn';

    useEffect(() => {
        localStorage.setItem('digitpro_diary_entries', JSON.stringify(entries));
    }, [entries]);

    const handleSetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!lockInput) return;
        playSuccess();
        localStorage.setItem('digitpro_diary_pwd', lockInput);
        setPassword(lockInput);
        setIsLocked(false);
        setLockInput('');
    };

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (lockInput === password) {
            playSuccess();
            setIsLocked(false);
            setLockInput('');
        } else {
            playClick();
            alert('الرقم السري غير صحيح' /* Error Message */);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) return;

        playSuccess();

        if (currentEntry) {
            setEntries(prev => prev.map(entry =>
                entry.id === currentEntry.id
                    ? { ...entry, title, content, date, updated_at: new Date().toISOString() }
                    : entry
            ));
        } else {
            const newEntry: DiaryEntry = {
                id: Date.now(),
                title,
                content,
                date,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            setEntries(prev => [newEntry, ...prev]);
        }

        setShowAddModal(false);
        setCurrentEntry(null);
        setTitle('');
        setContent('');
        setDate(new Date().toISOString().split('T')[0]);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذه المذكرة؟')) {
            playDelete();
            setEntries(prev => prev.filter(e => e.id !== id));
        }
    };

    const handleEdit = (entry: DiaryEntry) => {
        playClick();
        setCurrentEntry(entry);
        setTitle(entry.title);
        setContent(entry.content);
        setDate(entry.date);
        setShowAddModal(true);
        // Delay to allow ref to attach
        setTimeout(() => {
            if (editorRef.current) {
                editorRef.current.innerHTML = entry.content;
            }
        }, 50);
    };

    // Filter entries based on search query
    const filteredEntries = useMemo(() => {
        if (!searchQuery) return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lowerQ = searchQuery.toLowerCase();
        return entries.filter(e =>
            e.title.toLowerCase().includes(lowerQ) ||
            e.content.toLowerCase().includes(lowerQ) ||
            e.date.includes(lowerQ)
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [entries, searchQuery]);

    if (isLocked) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 page-enter">
                <div className="t-card max-w-sm w-full p-8 text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center pulse-scale" style={{ background: 'var(--gradient-accent)' }}>
                        <Lock size={32} color="white" />
                    </div>

                    <div>
                        <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>{t('diaryLocked' as any)}</h2>
                        <p className="text-sm font-bold opacity-60">{password ? t('enterDiaryPassword' as any) : t('createDiaryPassword' as any)}</p>
                    </div>

                    <form onSubmit={password ? handleUnlock : handleSetPassword} className="space-y-4">
                        <input
                            type="password"
                            value={lockInput}
                            onChange={e => setLockInput(e.target.value)}
                            placeholder="••••"
                            className="t-input text-center text-xl tracking-widest font-black"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl font-bold text-white btn-press transition-all"
                            style={{ background: 'var(--gradient-primary)' }}
                        >
                            {password ? 'فتح المذكرات' : 'تعيين رقم سري'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 relative">
            {/* Header / Lock & Unlock / Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50" style={{ color: 'var(--text-primary)' }} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('searchDiary' as any)}
                        className="t-input w-full pl-12 font-bold"
                        style={{ borderRadius: '999px' }}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { playClick(); setIsLocked(true); }}
                        className="p-3.5 rounded-full btn-press"
                        style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-card)' }}
                        title="إغلاق المذكرات"
                    >
                        <Lock size={20} />
                    </button>
                    <button
                        onClick={() => {
                            playClick();
                            setCurrentEntry(null);
                            setTitle('');
                            setContent('');
                            setDate(new Date().toISOString().split('T')[0]);
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white btn-press shadow-xl"
                        style={{ background: 'var(--gradient-accent)' }}
                    >
                        <Plus size={18} />
                        <span>{t('newEntry' as any)}</span>
                    </button>
                </div>
            </div>

            {/* Entries List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:columns-2 gap-4 auto-rows-min">
                {filteredEntries.length === 0 ? (
                    <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center p-12 text-center opacity-50">
                        <Book size={64} className="mb-4" />
                        <p className="font-bold text-lg">{searchQuery ? 'لم يتم العثور على مذكرات مطابقة' : t('noEntries' as any)}</p>
                    </div>
                ) : (
                    filteredEntries.map(entry => (
                        <div key={entry.id} className="t-card p-5 group flex flex-col h-full card-hover">
                            <div className="flex items-start justify-between mb-3 border-b pb-3 border-[var(--border-card)]">
                                <div>
                                    <h3 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{entry.title}</h3>
                                    <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                        <Calendar size={12} />
                                        <span>{new Date(entry.date).toLocaleDateString(dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                </div>

                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-2 absolute top-4 left-4" style={{ direction: 'ltr' }}>
                                    <button onClick={() => handleDelete(entry.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                    <button onClick={() => handleEdit(entry)} className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Securely render HTML content */}
                            <div
                                className="prose prose-sm dark:prose-invert max-w-none flex-1 opacity-90 break-words"
                                style={{ color: 'var(--text-secondary)' }}
                                dangerouslySetInnerHTML={{ __html: entry.content }}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Write/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 modal-overlay" style={{ background: 'var(--modal-overlay)' }}>
                    <div className="t-card w-full max-w-3xl h-[85vh] flex flex-col page-enter" style={{ borderTop: '4px solid var(--accent-1)' }}>

                        <div className="flex items-center justify-between p-4 border-b border-[var(--border-card)]">
                            <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                                {currentEntry ? t('editEntry' as any) : t('newEntry' as any)}
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl opacity-60 hover:opacity-100 transition-opacity">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>{t('diaryTitle' as any)}</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="عنوان اليوم..."
                                        className="t-input font-black text-lg"
                                        autoFocus
                                    />
                                </div>
                                <div className="md:w-48">
                                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>{t('date' as any)}</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        className="t-input font-bold"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col">
                                {/* Toolbar */}
                                <div className="flex items-center gap-1 mb-2 p-2 rounded-xl" style={{ background: 'var(--bg-main)' }}>
                                    <button
                                        type="button"
                                        onClick={() => { document.execCommand('bold', false); editorRef.current?.focus(); }}
                                        className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors" title="Bold">
                                        <Bold size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { document.execCommand('italic', false); editorRef.current?.focus(); }}
                                        className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors" title="Italic">
                                        <Italic size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { document.execCommand('underline', false); editorRef.current?.focus(); }}
                                        className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors" title="Underline">
                                        <Underline size={16} />
                                    </button>
                                    <div className="w-px h-6 bg-gray-500/20 mx-1"></div>
                                    <button
                                        type="button"
                                        onClick={() => { document.execCommand('insertUnorderedList', false); editorRef.current?.focus(); }}
                                        className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors" title="Bullet List">
                                        <List size={16} />
                                    </button>
                                </div>

                                {/* Custom Rich Text Editor */}
                                <div
                                    ref={editorRef}
                                    contentEditable
                                    onInput={(e) => setContent(e.currentTarget.innerHTML)}
                                    className="t-input flex-1 resize-none font-medium leading-relaxed overflow-y-auto"
                                    style={{ minHeight: '300px', cursor: 'text' }}
                                />
                            </div>
                        </div>

                        <div className="p-4 border-t border-[var(--border-card)] flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={!title || !content}
                                className="px-8 py-3 rounded-xl font-bold text-white btn-press transition-all disabled:opacity-50 shadow-xl"
                                style={{ background: 'var(--gradient-accent)' }}
                            >
                                {t('saveEntry' as any)}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
