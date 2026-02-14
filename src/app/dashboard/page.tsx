import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Plus, Globe, Zap, Clock, History, BarChart3, MoreVertical, Check, AlertTriangle, RefreshCw, Database, Search, Eye, ArrowUpRight } from 'lucide-react';
import { ScanButton } from '@/components/ScanButton';
import { SitesList } from '@/components/dashboard/SitesList';
import { cn } from '@/lib/utils';

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

interface SiteItem {
    id: string;
    name: string | null;
    url: string;
    is_active: boolean;
    last_scanned_at: string | null;
    scan_interval_minutes: number;
}

export default async function DashboardPage() {
    const supabase = await createClient();

    // Get auth user
    const { data: { user } } = await supabase.auth.getUser();

    // Get stats
    const { count: sitesCount } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: changesToday } = await supabase
        .from('chunk_changes')
        .select('*', { count: 'exact', head: true })
        .gte('detected_at', today.toISOString());

    // Get recent changes
    const { data: recentChangesResponse } = await supabase
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
        .limit(5);

    const recentChanges = recentChangesResponse as unknown as ChangeItem[];

    // Get keyword mentions
    const { data: mentionsResponse } = await supabase
        .from('keyword_mentions')
        .select(`
            id,
            keyword,
            source_url,
            context,
            created_at
        `)
        .order('created_at', { ascending: false })
        .limit(10);

    // Get all sites
    const { data: sites } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });

    // Combine and sort feed
    const feed = [
        ...(recentChanges || []).map(c => ({ ...c, type: 'site_change' as const, date: c.detected_at })),
        ...(mentionsResponse || []).map(m => ({ ...m, type: 'mention' as const, date: m.created_at }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-40 px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 bg-obsidian/50 backdrop-blur-md">
                <div className="pl-12 lg:pl-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Рабочий стол</h1>
                    <p className="text-xs sm:text-sm text-white/40">Мониторинг ресурсов в реальном времени</p>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
                    <div className="relative hidden sm:block">
                        <span className="material-symbols-outlined text-white/60 cursor-pointer hover:text-primary transition-colors">notifications</span>
                        <span className="absolute -top-1 -right-1 size-2 bg-primary rounded-full"></span>
                    </div>
                    <Link href="/dashboard/sites/new" className="amber-button px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold text-obsidian flex items-center gap-2">
                        <Plus className="size-4" />
                        <span className="hidden xs:inline">Добавить сайт</span>
                        <span className="xs:hidden">Добавить</span>
                    </Link>
                    <div className="flex items-center gap-3 sm:border-l border-white/10 sm:pl-6">
                        <div className="text-right hidden xs:block">
                            <div className="text-xs sm:text-sm font-semibold text-white truncate max-w-[100px]">{user?.email?.split('@')[0] || 'User'}</div>
                            <div className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest leading-none">Премиум</div>
                        </div>
                        <div className="size-8 sm:size-10 rounded-full border border-primary/30 p-0.5 bg-primary/10 flex items-center justify-center font-bold text-primary text-xs sm:text-base shrink-0">
                            {user?.email?.[0].toUpperCase() || 'U'}
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="glass-card p-5 sm:p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
                            <Globe className="size-12 sm:size-16" />
                        </div>
                        <div className="flex items-center gap-3 mb-3 sm:mb-4">
                            <div className="size-8 sm:size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Globe className="size-4 sm:size-5 text-primary" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-white/60">Сайтов</span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{sitesCount || 0}</div>
                        <div className="text-[10px] sm:text-xs text-primary flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] sm:text-xs">check_circle</span>
                            Активные ресурсы
                        </div>
                    </div>

                    <div className="glass-card p-5 sm:p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-10 group-hover:opacity-20 transition-opacity text-green-500">
                            <Zap className="size-12 sm:size-16" />
                        </div>
                        <div className="flex items-center gap-3 mb-3 sm:mb-4">
                            <div className="size-8 sm:size-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <Zap className="size-4 sm:size-5 text-green-500" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-white/60">За сегодня</span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{changesToday || 0}</div>
                        <div className="text-[10px] sm:text-xs text-green-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] sm:text-xs">trending_up</span>
                            Изменений
                        </div>
                    </div>

                    <div className="glass-card p-5 sm:p-6 rounded-2xl relative overflow-hidden group sm:col-span-2 lg:col-span-1">
                        <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-10 group-hover:opacity-20 transition-opacity text-purple-500">
                            <Clock className="size-12 sm:size-16" />
                        </div>
                        <div className="flex items-center gap-3 mb-3 sm:mb-4">
                            <div className="size-8 sm:size-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Clock className="size-4 sm:size-5 text-purple-500" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-white/60">Интервал</span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                            15<span className="text-base sm:text-lg text-white/40 ml-1 font-normal uppercase">мин</span>
                        </div>
                        <div className="text-[10px] sm:text-xs text-purple-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] sm:text-xs">sync</span>
                            Частота проверок
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                    {/* Live News Feed (Full Width) */}
                    <div className="col-span-12">
                        <div className="glass-card rounded-2xl p-6 sm:p-8 h-full min-h-[400px] flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center animate-pulse">
                                        <RefreshCw className="size-4 text-primary" />
                                    </div>
                                    Живая лента событий
                                </h3>
                                <div className="flex gap-2">
                                    <span className="text-[10px] uppercase tracking-widest text-primary font-black border border-primary/20 px-2 py-1 rounded bg-primary/5">В ЭФИРЕ</span>
                                </div>
                            </div>

                            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {feed.length > 0 ? (
                                    feed.map((item: any) => (
                                        <div key={`${item.type}-${item.id}`} className="group relative pl-6 pb-2 border-l border-white/10 last:border-0 hover:border-primary/50 transition-colors">
                                            <div className={`absolute -left-[5px] top-0 size-2.5 rounded-full border-2 border-[#050507] ${item.type === 'site_change' ? 'bg-blue-500' : 'bg-primary'
                                                } group-hover:scale-125 transition-transform`} />

                                            <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl p-4 transition-all">
                                                <div className="flex justify-between items-start gap-4 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${item.type === 'site_change' ? 'bg-blue-500/10 text-blue-400' : 'bg-primary/10 text-primary'
                                                            }`}>
                                                            {item.type === 'site_change' ? 'Сайт' : 'Инсайт'}
                                                        </span>
                                                        <span className="text-xs text-white/40 font-mono">
                                                            {formatDate(item.date)}
                                                        </span>
                                                    </div>
                                                    {item.type === 'site_change' && (
                                                        <Link href={`/dashboard/sites/${item.pages?.sites?.id}`} className="text-[10px] text-white/40 hover:text-white transition-colors flex items-center gap-1">
                                                            Детали <ArrowUpRight className="size-3" />
                                                        </Link>
                                                    )}
                                                </div>

                                                {item.type === 'site_change' ? (
                                                    <div>
                                                        <div className="text-sm font-bold text-white mb-1">
                                                            Обновление на {item.pages?.sites?.name || item.pages?.sites?.url}
                                                        </div>
                                                        <p className="text-xs text-white/60 line-clamp-2">
                                                            {item.summary || 'Зафиксированы изменения контента на странице.'}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="text-sm font-bold text-white mb-1">
                                                            Найдено: <span className="text-primary">"{item.keyword}"</span>
                                                        </div>
                                                        <p className="text-xs text-white/60 line-clamp-2 mb-2 italic">
                                                            "...{item.context}..."
                                                        </p>
                                                        <a href={item.source_url} target="_blank" rel="noopener" className="text-[10px] text-blue-400 hover:underline truncate block">
                                                            {item.source_url}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-white/20">
                                        <History className="size-12 mb-4 opacity-20" />
                                        <p className="text-sm italic">Лента событий пуста</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Your Resources */}
                <SitesList sites={sites || []} />
            </main>

            <footer className="mt-auto py-8 sm:py-10 px-4 sm:px-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 opacity-30">
                <div className="flex items-center gap-6 text-[10px] sm:text-[12px] uppercase tracking-widest font-black">
                    <a className="hover:text-primary transition-colors" href="#">Поддержка</a>
                    <a className="hover:text-primary transition-colors" href="#">Доки</a>
                    <a className="hover:text-primary transition-colors" href="#">API</a>
                </div>
                <div className="text-[10px] sm:text-[12px] text-right font-medium italic">
                    © 2024 Aether Monitor. <span className="text-primary not-italic font-bold">Amber Edition</span>.
                </div>
            </footer>
        </div>
    );
}

