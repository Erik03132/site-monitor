import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatDate, cn } from '@/lib/utils';
import { Plus, Globe, Zap, Clock, History, BarChart3, MoreVertical, Check, AlertTriangle, RefreshCw } from 'lucide-react';

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

    // Get all sites
    const { data: sites } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });

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
                            <div className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest leading-none">Premium</div>
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
                    {/* Activity Chart */}
                    <div className="lg:col-span-8">
                        <div className="glass-card rounded-2xl p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-8 sm:mb-10">
                                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                    <BarChart3 className="size-4 sm:size-5 text-primary" />
                                    Активность
                                </h3>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 rounded bg-white/5 text-[10px] text-white/70 hover:bg-white/10 italic">Неделя</button>
                                    <button className="px-3 py-1 rounded bg-primary/10 text-[10px] text-primary border border-primary/20 font-bold">Месяц</button>
                                </div>
                            </div>
                            <div className="relative h-48 sm:h-64 w-full flex items-end justify-between gap-2 sm:gap-4 px-2">
                                {[40, 60, 85, 70, 55, 95, 45].map((h, i) => (
                                    <div key={i} className="flex-1 bg-primary/10 rounded-t-lg relative group transition-all" style={{ height: `${h}%` }}>
                                        <div className="absolute inset-x-0 bottom-0 bg-primary/30 rounded-t-lg transition-all group-hover:bg-primary group-hover:h-full"></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-6 text-[9px] sm:text-[11px] text-white/30 uppercase font-bold tracking-widest px-2">
                                <span>Пон</span><span>Вто</span><span>Сре</span><span>Чет</span><span>Пят</span><span>Суб</span><span>Вос</span>
                            </div>
                        </div>
                    </div>

                    {/* Events List */}
                    <div className="lg:col-span-4">
                        <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
                            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <History className="size-4 sm:size-5 text-primary" />
                                События
                            </h3>
                            <div className="space-y-6 flex-1">
                                {recentChanges && recentChanges.length > 0 ? (
                                    recentChanges.map((change) => (
                                        <div key={change.id} className="flex gap-4 group">
                                            <div className={cn(
                                                "size-8 rounded-full flex items-center justify-center shrink-0 border border-current/10",
                                                change.change_type === 'added' ? 'bg-green-500/10 text-green-500' :
                                                    change.change_type === 'removed' ? 'bg-red-500/10 text-red-500' :
                                                        'bg-primary/10 text-primary'
                                            )}>
                                                {change.change_type === 'added' ? <Check className="size-4" /> :
                                                    change.change_type === 'removed' ? <AlertTriangle className="size-4" /> :
                                                        <RefreshCw className="size-4" />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-white truncate">{change.pages?.sites?.name || change.pages?.sites?.url}</div>
                                                <div className="text-xs text-white/50 line-clamp-1 italic mt-0.5">{change.summary || 'Изменения контента'}</div>
                                                <div className="text-[10px] text-primary font-black mt-1.5 uppercase tracking-wider">{formatDate(change.detected_at)}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center text-white/20 text-sm italic">Нет недавних событий</div>
                                )}
                            </div>
                            <Link href="/dashboard/changes" className="w-full mt-8 block text-center py-3 rounded-xl border border-white/5 text-[10px] font-black text-white/30 hover:text-primary hover:border-primary/30 transition-all uppercase tracking-[0.2em] bg-transparent">
                                Показать все
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sites Table */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-xl">database</span>
                            <h3 className="font-bold text-white text-sm sm:text-base uppercase tracking-wider">Ваши ресурсы</h3>
                        </div>
                        <span className="text-[10px] sm:text-xs text-white/30 font-bold uppercase tracking-widest">{sites?.length || 0} в списке</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.02] text-[9px] sm:text-[11px] uppercase tracking-[0.2em] text-white/40 font-bold">
                                    <th className="px-6 sm:px-8 py-4">Ресурс</th>
                                    <th className="px-6 sm:px-8 py-4 hidden xs:table-cell">Статус</th>
                                    <th className="px-6 sm:px-8 py-4 text-center">Действие</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sites && sites.length > 0 ? (
                                    sites.map((site: SiteItem) => (
                                        <tr key={site.id} className="hover:bg-white/[0.03] transition-colors group">
                                            <td className="px-6 sm:px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded bg-obsidian-light flex items-center justify-center border border-white/5 shrink-0">
                                                        <Globe className="size-4 text-primary" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-bold text-white truncate max-w-[120px] sm:max-w-none">{site.name || 'Без названия'}</div>
                                                        <div className="text-[9px] sm:text-[10px] text-white/30 truncate max-w-[150px] sm:max-w-none hover:text-primary transition-colors cursor-pointer">{site.url}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 sm:px-8 py-5 hidden xs:table-cell">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                                                    site.is_active
                                                        ? 'bg-green-500/5 text-green-500/70 border-green-500/20'
                                                        : 'bg-red-500/5 text-red-500/70 border-red-500/20'
                                                )}>
                                                    {site.is_active ? 'Online' : 'Paused'}
                                                </span>
                                            </td>
                                            <td className="px-6 sm:px-8 py-5 text-right">
                                                <div className="flex justify-end gap-1 sm:gap-2">
                                                    <button title="Scan now" className="size-8 flex items-center justify-center text-white/20 hover:text-primary transition-all bg-transparent hover:bg-primary/5 rounded-lg border-none group/btn">
                                                        <RefreshCw className="size-4 group-active/btn:rotate-180 transition-transform duration-500" />
                                                    </button>
                                                    <Link href={`/dashboard/sites/${site.id}`} className="size-8 flex items-center justify-center text-white/20 hover:text-primary transition-all hover:bg-primary/5 rounded-lg">
                                                        <MoreVertical className="size-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-20 text-center text-white/20 text-sm italic">
                                            Список пуст. Добавьте первый сайт для начала работы.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <footer className="mt-auto py-8 sm:py-10 px-4 sm:px-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 opacity-30">
                <div className="flex items-center gap-6 text-[10px] sm:text-[12px] uppercase tracking-widest font-black">
                    <a className="hover:text-primary transition-colors" href="#">Support</a>
                    <a className="hover:text-primary transition-colors" href="#">Docs</a>
                    <a className="hover:text-primary transition-colors" href="#">API</a>
                </div>
                <div className="text-[10px] sm:text-[12px] text-right font-medium italic">
                    © 2024 Aether Monitor. <span className="text-primary not-italic font-bold">Amber Edition</span>.
                </div>
            </footer>
        </div>
    );
}

