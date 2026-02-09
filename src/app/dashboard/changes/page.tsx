import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft, Clock, RefreshCw, Check, AlertTriangle, Filter } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils'; // Keep assuming cn is in utils

// Define interface for changes
interface ChangeItem {
    id: string;
    change_type: string;
    new_content: string | null;
    summary: string | null;
    detected_at: string;
    pages: {
        url: string;
        title: string;
        sites: {
            id: string;
            name: string | null;
            url: string;
        };
    };
}

export default async function ChangesPage() {
    const supabase = await createClient();

    // Fetch changes
    const { data: changesResponse } = await supabase
        .from('chunk_changes')
        .select(`
            id,
            change_type,
            new_content,
            summary,
            detected_at,
            pages!inner(
                url,
                title,
                sites!inner(id, name, url)
            )
        `)
        .order('detected_at', { ascending: false })
        .limit(50); // Higher limit for the full list

    const changes = changesResponse as unknown as ChangeItem[];

    return (
        <div className="p-4 sm:p-8 relative min-h-full text-white">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen" />

            <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 relative z-10">

                {/* Header / Nav */}
                <div className="flex items-center justify-between gap-4 mt-6 sm:mt-0">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-white/40 hover:text-primary transition-colors font-bold group text-xs sm:text-sm uppercase tracking-wider w-fit"
                    >
                        <ArrowLeft className="size-3 sm:size-4 group-hover:-translate-x-1 transition-transform" />
                        Назад
                    </Link>
                    <button className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/10 hover:bg-white/5 text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors">
                        <Filter className="size-3 sm:size-4" />
                        <span className="hidden xs:inline">Фильтр</span>
                    </button>
                </div>

                {/* Hero / Title */}
                <div className="glass-card rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-5 pointer-events-none">
                        <Clock className="size-32 sm:size-48 text-white" />
                    </div>

                    <div className="relative z-10 flex items-center gap-6 sm:gap-8">
                        <div className="size-16 sm:size-20 bg-primary/10 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-primary/20 shrink-0">
                            <Clock className="size-8 sm:size-10 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-none mb-2">
                                История событий
                            </h1>
                            <p className="text-xs sm:text-sm text-white/50 font-medium max-w-md leading-relaxed">
                                Полный хронологический список всех обнаруженных изменений на ваших ресурсах.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Changes List */}
                <div className="space-y-4">
                    {changes && changes.length > 0 ? (
                        changes.map((change) => (
                            <div key={change.id} className="glass-card p-5 sm:p-6 rounded-2xl hover:border-primary/20 transition-all group">
                                <div className="flex gap-4 sm:gap-6">
                                    {/* Status Icon */}
                                    <div className={cn(
                                        "size-10 sm:size-12 rounded-2xl flex items-center justify-center shrink-0 border border-current/10 mt-1",
                                        change.change_type === 'added' ? 'bg-green-500/10 text-green-500' :
                                            change.change_type === 'removed' ? 'bg-red-500/10 text-red-500' :
                                                'bg-primary/10 text-primary'
                                    )}>
                                        {change.change_type === 'added' ? <Check className="size-5 sm:size-6" /> :
                                            change.change_type === 'removed' ? <AlertTriangle className="size-5 sm:size-6" /> :
                                                <RefreshCw className="size-5 sm:size-6" />}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Link href={`/dashboard/sites/${change.pages.sites.id}`} className="text-xs sm:text-sm font-bold text-white hover:text-primary transition-colors truncate">
                                                    {change.pages.sites.name || change.pages.sites.url}
                                                </Link>
                                                <span className="text-white/20 text-[10px]">•</span>
                                                <span className="text-[10px] sm:text-xs text-white/40 truncate">{change.pages.title || change.pages.url}</span>
                                            </div>
                                            <div className="text-[10px] bg-white/5 px-2 py-1 rounded border border-white/5 text-white/40 font-mono uppercase whitespace-nowrap self-start sm:self-auto">
                                                {formatDate(change.detected_at)}
                                            </div>
                                        </div>

                                        <div className="text-xs sm:text-sm font-medium text-white/80 mb-2">
                                            {change.change_type === 'added' ? 'Добавлен новый контент' :
                                                change.change_type === 'removed' ? 'Удаленная информация' : 'Обновление содержимого'}
                                        </div>

                                        <p className="text-[11px] sm:text-xs text-white/50 leading-relaxed font-normal bg-black/20 p-3 sm:p-4 rounded-xl border border-white/5 font-mono">
                                            {change.summary || 'Детальное описание изменений отсутствует...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-card p-16 sm:p-24 rounded-[32px] text-center flex flex-col items-center justify-center">
                            <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                                <Clock className="size-8 text-white/20" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">История пуста</h3>
                            <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
                                За последнее время событий не зафиксировано. Как только что-то произойдет, оно появится здесь.
                            </p>
                        </div>
                    )}
                </div>

                {changes && changes.length >= 50 && (
                    <div className="text-center pt-4">
                        <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all uppercase tracking-widest border border-white/5">
                            Загрузить еще
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
