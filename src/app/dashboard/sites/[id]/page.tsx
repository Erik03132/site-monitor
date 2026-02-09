import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Globe, Clock, Zap, RefreshCw, Calendar, ExternalLink, Activity, AlertTriangle, Check } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ScanButton } from '@/components/ScanButton';

// Define types based on what we know from dashboard/page.tsx
interface Site {
    id: string;
    url: string;
    name: string;
    is_active: boolean;
    created_at: string;
    last_scan_at: string | null;
    scan_interval_minutes: number;
}

interface Change {
    id: string;
    change_type: 'added' | 'removed' | 'modified';
    summary: string;
    detected_at: string;
    new_content?: string;
    old_content?: string;
}

export default async function SiteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch site details
    const { data: site, error: siteError } = await supabase
        .from('sites')
        .select('*')
        .eq('id', id)
        .single();

    if (siteError || !site) {
        notFound();
    }

    // Fetch recent changes for this site
    // Note: We need to join with pages table if changes are linked to pages, not directly to sites
    // Based on dashboard query structure: chunk_changes -> pages -> sites
    const { data: changes } = await supabase
        .from('chunk_changes')
        .select(`
            id,
            change_type,
            summary,
            detected_at,
            pages!inner(
                site_id
            )
        `)
        .eq('pages.site_id', id)
        .order('detected_at', { ascending: false })
        .limit(20);

    const siteData = site as Site;
    // Cast changes to expected type, filtering out the nested page object implies we trust the query
    const changesList = (changes || []).map((c: any) => ({
        id: c.id,
        change_type: c.change_type,
        summary: c.summary,
        detected_at: c.detected_at,
    })) as Change[];

    return (
        <div className="p-4 sm:p-8 relative min-h-full text-white">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen" />

            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 relative z-10">

                {/* Header / Nav */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 sm:mt-0">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-white/40 hover:text-primary transition-colors font-bold group text-xs sm:text-sm uppercase tracking-wider w-fit"
                    >
                        <ArrowLeft className="size-3 sm:size-4 group-hover:-translate-x-1 transition-transform" />
                        Назад
                    </Link>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                        <ScanButton siteId={siteData.id} />
                        <button className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors">
                            Настройки
                        </button>
                    </div>
                </div>

                {/* Main Hero Card */}
                <div className="glass-card rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-5 pointer-events-none">
                        <Globe className="size-32 sm:size-48 text-white" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-6 sm:gap-10">
                        <div className="size-16 sm:size-24 bg-primary/10 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-primary/20 shrink-0">
                            <Globe className="size-8 sm:size-12 text-primary" />
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-none">
                                        {siteData.name || 'Без названия'}
                                    </h1>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${siteData.is_active
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                                        }`}>
                                        {siteData.is_active ? 'Активен' : 'На паузе'}
                                    </span>
                                </div>
                                <a
                                    href={siteData.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm sm:text-base text-white/40 hover:text-primary transition-colors flex items-center gap-1.5 font-medium truncate max-w-full sm:max-w-md md:max-w-2xl"
                                >
                                    {siteData.url}
                                    <ExternalLink className="size-3 sm:size-4 opacity-50" />
                                </a>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
                                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/5">
                                    <div className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5">
                                        <Clock className="size-3" /> Интервал
                                    </div>
                                    <div className="text-sm sm:text-lg font-bold text-white">{siteData.scan_interval_minutes} мин</div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/5">
                                    <div className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5">
                                        <Activity className="size-3" /> Последний скан
                                    </div>
                                    <div className="text-sm sm:text-lg font-bold text-white truncate">
                                        {siteData.last_scan_at ? formatDate(siteData.last_scan_at).split(' ')[0] : '—'}
                                        <span className="text-[10px] sm:text-xs text-white/30 font-normal ml-1">
                                            {siteData.last_scan_at ? formatDate(siteData.last_scan_at).split(' ')[1] : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/5">
                                    <div className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5">
                                        <Calendar className="size-3" /> Создан
                                    </div>
                                    <div className="text-sm sm:text-lg font-bold text-white">{formatDate(siteData.created_at).split(' ')[0]}</div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/5">
                                    <div className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5">
                                        <Zap className="size-3" /> Событий
                                    </div>
                                    <div className="text-sm sm:text-lg font-bold text-white">{changesList.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Changes Log */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                                <Activity className="size-4 text-primary" />
                                История изменений
                            </h3>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            {changesList.length > 0 ? (
                                changesList.map((change) => (
                                    <div key={change.id} className="glass-card p-4 sm:p-5 rounded-xl sm:rounded-2xl hover:border-primary/30 transition-all group">
                                        <div className="flex gap-4">
                                            <div className={`mt-1 size-8 rounded-full flex items-center justify-center shrink-0 border border-white/5 ${change.change_type === 'added' ? 'bg-green-500/10 text-green-500' :
                                                change.change_type === 'removed' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                {change.change_type === 'added' ? <Check className="size-4" /> :
                                                    change.change_type === 'removed' ? <AlertTriangle className="size-4" /> :
                                                        <RefreshCw className="size-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                                    <div className="text-xs sm:text-sm font-bold text-white">
                                                        {change.change_type === 'added' ? 'Добавлен контент' :
                                                            change.change_type === 'removed' ? 'Удален контент' : 'Изменен контент'}
                                                    </div>
                                                    <div className="text-[10px] text-white/30 font-mono uppercase">
                                                        {formatDate(change.detected_at)}
                                                    </div>
                                                </div>
                                                <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
                                                    {change.summary || 'Детальное описание изменений отсутствует...'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="glass-card p-8 sm:p-12 rounded-2xl text-center">
                                    <div className="size-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <RefreshCw className="size-6 text-white/20" />
                                    </div>
                                    <h4 className="text-white font-bold text-sm mb-1">Нет изменений</h4>
                                    <p className="text-white/40 text-xs">Система пока не обнаружила изменений на этом сайте.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar / Stats / Actions */}
                    <div className="space-y-6">
                        <div className="glass-card p-5 sm:p-6 rounded-2xl">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Статус мониторинга</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/70">Текущий статус</span>
                                    <div className="flex items-center gap-2">
                                        <div className={`size-2 rounded-full ${siteData.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                        <span className={`text-xs font-bold ${siteData.is_active ? 'text-green-500' : 'text-red-500'}`}>
                                            {siteData.is_active ? 'MONITORING' : 'STOPPED'}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full w-[60%] rounded-full" />
                                </div>
                                <div className="flex justify-between text-[10px] text-white/30 uppercase font-bold">
                                    <span>Uptime: 99.9%</span>
                                    <span>Next scan: 12m</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-5 sm:p-6 rounded-2xl border-l-2 border-primary/50">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Быстрые команды</h3>
                            <div className="space-y-2">
                                <button className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white text-left flex items-center justify-between transition-all group">
                                    Изменить настройки
                                    <ArrowLeft className="size-3 text-white/30 rotate-180 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-xs font-bold text-white text-left flex items-center justify-between transition-all group">
                                    Удалить сайт
                                    <AlertTriangle className="size-3 text-white/30 group-hover:text-red-400 transition-colors" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
