
'use client'

import { useState, useEffect } from 'react';
import { Key, Plus, Search, Trash2, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Keyword {
    id: string;
    keyword: string;
    is_active: boolean;
    created_at: string;
}

export default function KeywordsPage() {
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newKeyword, setNewKeyword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchKeywords = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/keywords');
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setKeywords(data.keywords || []);
        } catch (err: any) {
            setError(err.message || 'Ошибка загрузки ключевых слов');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKeywords();
    }, []);

    const handleAddKeyword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyword.trim() || isAdding) return;

        setIsAdding(true);
        setError(null);
        try {
            const response = await fetch('/api/keywords', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword: newKeyword.trim() }),
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setKeywords([data.keyword, ...keywords]);
            setNewKeyword('');
        } catch (err: any) {
            setError(err.message || 'Ошибка добавления слова');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteKeyword = async (id: string) => {
        try {
            const response = await fetch(`/api/keywords/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setKeywords(keywords.filter(k => k.id !== id));
        } catch (err: any) {
            setError(err.message || 'Ошибка удаления слова');
        }
    };

    const filteredKeywords = keywords.filter(k =>
        k.keyword.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-8 relative min-h-full text-white">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen" />

            <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 relative z-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 sm:mt-0 pr-12 sm:pr-0">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Ключевые слова</h1>
                        <p className="text-xs sm:text-sm text-white/40">Мониторинг упоминаний и SEO-позиций.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchKeywords}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            title="Обновить"
                        >
                            <RefreshCw className={cn("size-4 text-white/60", isLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* Add Keyword Form */}
                <div className="glass-card p-4 sm:p-6 rounded-[24px]">
                    <form onSubmit={handleAddKeyword} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 group">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                placeholder="Введите слово или фразу для отслеживания..."
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isAdding || !newKeyword.trim()}
                            className="amber-button px-6 py-3 rounded-xl text-sm font-bold text-obsidian flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            {isAdding ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Plus className="size-4" />
                            )}
                            Добавить
                        </button>
                    </form>
                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-medium animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="size-4" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Search & Stats */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                    <div className="relative group w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/20 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Поиск по словам..."
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/5 rounded-lg text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/10 transition-all"
                        />
                    </div>
                    <div className="text-[10px] text-white/20 uppercase tracking-widest font-black">
                        Всего: {keywords.length} слов
                    </div>
                </div>

                {/* Content */}
                {isLoading && keywords.length === 0 ? (
                    <div className="glass-card p-20 rounded-[24px] flex flex-col items-center justify-center">
                        <Loader2 className="size-10 text-primary animate-spin mb-4" />
                        <p className="text-white/40 text-sm font-medium">Загрузка слов...</p>
                    </div>
                ) : filteredKeywords.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredKeywords.map((k) => (
                            <div
                                key={k.id}
                                className="glass-card p-5 rounded-[20px] group transition-all hover:border-primary/20 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors" />

                                <div className="flex items-start justify-between gap-4 relative z-10">
                                    <div className="flex gap-4">
                                        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
                                            <Key className="size-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-sm mb-1 leading-tight">{k.keyword}</h3>
                                            <p className="text-[10px] text-white/30 font-medium">
                                                Добавлено {new Date(k.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteKeyword(k.id)}
                                        className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-90"
                                        title="Удалить"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-10 sm:p-20 rounded-[24px] text-center flex flex-col items-center justify-center min-h-[300px]">
                        <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                            <Key className="size-8 text-white/10" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">
                            {searchQuery ? 'Ничего не найдено' : 'Нет ключевых слов'}
                        </h3>
                        <p className="text-white/40 text-sm max-w-xs mx-auto leading-relaxed mb-6">
                            {searchQuery
                                ? `По запросу "${searchQuery}" ничего не найдено. Попробуйте изменить поиск.`
                                : 'Добавьте ваше первое ключевое слово, чтобы начать отслеживать изменения.'
                            }
                        </p>
                        {!searchQuery && (
                            <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black">
                                Aether Monitor Engine
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
