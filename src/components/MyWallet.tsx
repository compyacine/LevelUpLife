import { useState, useMemo, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, Trash2, Calendar, FileText, X, PieChart } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { playClick, playSuccess, playDelete } from '../utils/sounds';
import { WalletTransaction } from '../types';

export default function MyWallet() {
    const { t, lang } = useLang();

    const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
        const data = localStorage.getItem('digitpro_wallet_transactions');
        return data ? JSON.parse(data) : [];
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    const dateLocale = lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-US' : 'ar-u-nu-latn';

    const defaultCategories = {
        expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertain', 'Other'],
        income: ['Salary', 'Freelance', 'Gift', 'Investment', 'Other']
    };

    useEffect(() => {
        localStorage.setItem('digitpro_wallet_transactions', JSON.stringify(transactions));
    }, [transactions]);

    // Auto categorization logic
    useEffect(() => {
        if (!description) return;
        const lowerDesc = description.toLowerCase();

        const rules: Record<string, { type: 'expense' | 'income', cat: string }> = {
            'uber': { type: 'expense', cat: 'Transport' },
            'taxi': { type: 'expense', cat: 'Transport' },
            'bus': { type: 'expense', cat: 'Transport' },
            'train': { type: 'expense', cat: 'Transport' },
            'gas': { type: 'expense', cat: 'Transport' },

            'restaurant': { type: 'expense', cat: 'Food' },
            'food': { type: 'expense', cat: 'Food' },
            'coffee': { type: 'expense', cat: 'Food' },
            'cafe': { type: 'expense', cat: 'Food' },
            'mcdonalds': { type: 'expense', cat: 'Food' },
            'burger': { type: 'expense', cat: 'Food' },
            'pizza': { type: 'expense', cat: 'Food' },
            'supermarket': { type: 'expense', cat: 'Food' },

            'salary': { type: 'income', cat: 'Salary' },
            'paycheck': { type: 'income', cat: 'Salary' },
            'upwork': { type: 'income', cat: 'Freelance' },
            'freelance': { type: 'income', cat: 'Freelance' },

            'amazon': { type: 'expense', cat: 'Shopping' },
            'clothes': { type: 'expense', cat: 'Shopping' },
            'shoes': { type: 'expense', cat: 'Shopping' },

            'netflix': { type: 'expense', cat: 'Entertain' },
            'spotify': { type: 'expense', cat: 'Entertain' },
            'cinema': { type: 'expense', cat: 'Entertain' },
            'movie': { type: 'expense', cat: 'Entertain' },

            'electric': { type: 'expense', cat: 'Bills' },
            'water': { type: 'expense', cat: 'Bills' },
            'internet': { type: 'expense', cat: 'Bills' },
            'phone': { type: 'expense', cat: 'Bills' },
        };

        for (const [keyword, rule] of Object.entries(rules)) {
            if (lowerDesc.includes(keyword)) {
                if (type !== rule.type) setType(rule.type);
                setCategory(rule.cat);
                break;
            }
        }
    }, [description]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || isNaN(Number(amount)) || !category) return;

        playSuccess();
        const newTx: WalletTransaction = {
            id: Date.now(),
            type,
            amount: Number(amount),
            category,
            description,
            date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
        };

        setTransactions(prev => [newTx, ...prev]);
        setShowAddModal(false);
        setAmount('');
        setDescription('');
        setCategory('');
    };

    const handleDelete = (id: number) => {
        playDelete();
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const totalIncome = useMemo(() =>
        transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        [transactions]);

    const totalExpense = useMemo(() =>
        transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        [transactions]);

    const balance = totalIncome - totalExpense;

    // Group by category for expenses
    const expenseByCategory = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const grouped = expenses.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    return (
        <div className="space-y-6 pb-20">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="t-card p-5 relative overflow-hidden" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
                    <div className="relative z-10">
                        <p className="text-sm opacity-80 font-bold mb-1">{t('totalBalance' as any)}</p>
                        <h2 className="text-3xl font-black">${balance.toFixed(2)}</h2>
                    </div>
                    <Wallet size={80} className="absolute -bottom-4 -right-4 opacity-10 transform -rotate-12" />
                </div>

                <div className="t-card p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{t('totalIncome' as any)}</p>
                        <h3 className="text-xl font-black text-green-500">+${totalIncome.toFixed(2)}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                        <TrendingUp size={24} className="text-green-500" />
                    </div>
                </div>

                <div className="t-card p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{t('totalExpense' as any)}</p>
                        <h3 className="text-xl font-black text-red-500">-${totalExpense.toFixed(2)}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                        <TrendingDown size={24} className="text-red-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Transactions */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{t('recentTransactions' as any)}</h3>
                        <button
                            onClick={() => { playClick(); setShowAddModal(true); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white btn-press shadow-lg"
                            style={{ background: 'var(--gradient-accent)' }}
                        >
                            <Plus size={16} />
                            <span className="hidden sm:inline">{t('addTransaction' as any)}</span>
                        </button>
                    </div>

                    <div className="t-card p-2 sm:p-4 min-h-[400px]">
                        {transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center opacity-50">
                                <Wallet size={48} className="mb-4" />
                                <p className="font-bold">{t('noTransactions' as any)}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map(tx => (
                                    <div key={tx.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl card-hover group" style={{ background: 'var(--bg-main)' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                                style={{ background: tx.type === 'income' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                                                {tx.type === 'income' ? <TrendingUp size={18} className="text-green-500" /> : <TrendingDown size={18} className="text-red-500" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm sm:text-base capitalize" style={{ color: 'var(--text-primary)' }}>{tx.category}</p>
                                                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(tx.date).toLocaleDateString(dateLocale)}</span>
                                                    {tx.description && <span className="flex items-center gap-1 hidden sm:flex truncate max-w-[120px]"><FileText size={10} /> {tx.description}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className={`font-black text-sm sm:text-base ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                                {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                                            </p>
                                            <button
                                                onClick={() => handleDelete(tx.id)}
                                                className="p-1.5 sm:p-2 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10"
                                                title={t('deleteTransaction' as any)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Reports */}
                <div className="space-y-4">
                    <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{t('reports' as any)}</h3>

                    <div className="t-card p-5 space-y-4">
                        <h4 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <PieChart size={16} /> {t('expense' as any)} {t('category' as any)}
                        </h4>

                        {expenseByCategory.length > 0 ? (
                            <div className="space-y-3 mt-4">
                                {expenseByCategory.map((item, idx) => (
                                    <div key={item.name}>
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="font-bold capitalize" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>${item.value.toFixed(2)}</span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-main)' }}>
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${(item.value / totalExpense) * 100}%`,
                                                    background: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4', '#8b5cf6'][idx % 6]
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-center opacity-50 py-4">{t('noTransactions' as any)}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Transaction Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" style={{ background: 'var(--modal-overlay)' }}>
                    <div className="t-card w-full max-w-sm p-6 page-enter relative" style={{ borderTop: '4px solid var(--accent-1)' }}>
                        <button
                            onClick={() => { playClick(); setShowAddModal(false); }}
                            className="absolute top-4 right-4 p-1 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-black mb-5" style={{ color: 'var(--text-primary)' }}>{t('addTransaction' as any)}</h3>

                        <form onSubmit={handleAdd} className="space-y-4">
                            {/* Type Switcher */}
                            <div className="flex p-1 rounded-xl" style={{ background: 'var(--bg-main)' }}>
                                <button
                                    type="button"
                                    onClick={() => setType('expense')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'expense' ? 'shadow-md' : 'opacity-60'}`}
                                    style={{ background: type === 'expense' ? 'var(--bg-card)' : 'transparent', color: type === 'expense' ? '#ef4444' : 'var(--text-primary)' }}
                                >
                                    {t('expense' as any)}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('income')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'income' ? 'shadow-md' : 'opacity-60'}`}
                                    style={{ background: type === 'income' ? 'var(--bg-card)' : 'transparent', color: type === 'income' ? '#22c55e' : 'var(--text-primary)' }}
                                >
                                    {t('income' as any)}
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>{t('amount' as any)} ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="t-input text-lg font-black"
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>{t('description' as any)} (Optional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="t-input"
                                    placeholder="Enter details (Will auto categorise...)"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>{t('category' as any)}</label>
                                <select
                                    required
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="t-input capitalize"
                                >
                                    <option value="" disabled>--- Select ---</option>
                                    {defaultCategories[type].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 mt-2 rounded-xl font-bold text-white btn-press shadow-xl"
                                style={{ background: 'var(--gradient-accent)' }}
                            >
                                {t('saveTransaction' as any)}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
