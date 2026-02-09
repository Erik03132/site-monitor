
import { Key, Plus, Search } from 'lucide-react';
import Link from 'next/link';

export default function KeywordsPage() {
    return (
        <div className="p-4 sm:p-8 relative min-h-full text-white">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen" />

            <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 relative z-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 sm:mt-0">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Ключевые слова</h1>
                        <p className="text-xs sm:text-sm text-white/40">Мониторинг упоминаний и SEO-позиций.</p>
                    </div>
                    <button className="amber-button px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold text-obsidian flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto justify-center">
                        <Plus className="size-4" />
                        Добавить слово
                    </button>
                </div>

                {/* Empty State / Content */}
                <div className="glass-card p-10 sm:p-20 rounded-[24px] text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="size-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5 animate-pulse-slow">
                        <Key className="size-10 text-white/20" />
                    </div>
                    <h3 className="text-white font-bold text-lg sm:text-xl mb-2">Отслеживание ключевых слов</h3>
                    <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed mb-8">
                        Добавьте ключевые слова, чтобы отслеживать их появление или исчезновение на целевых страницах. Вы получите уведомление при любом изменении.
                    </p>

                    <div className="w-full max-w-md relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-white/20 group-hover:text-primary/50 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Поиск по ключевым словам..."
                            disabled
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none cursor-not-allowed opacity-50"
                        />
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Функция находится в разработке</p>
                </div>
            </div>
        </div>
    );
}
