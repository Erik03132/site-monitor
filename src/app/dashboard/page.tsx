import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Plus, Globe, Zap, Clock, History, MoreVertical, Check, AlertTriangle, RefreshCw, Database, Newspaper, Search, Activity } from 'lucide-react';
import { ScanButton } from '@/components/ScanButton';
import { cn } from '@/lib/utils';

interface EventItem {
    id: string;
    type: 'site_change' | 'global_mention';
    title: string;
    source: string;
    description: string | null;
    timestamp: string;
    url: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
}

export default async function DashboardPage() {
    const supabase = await createClient();

    // 1. Get auth user
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Fetch Local Changes
    const { data: localChangesResponse } = await supabase
        .from('chunk_changes')
        .select(`
            id,
            change_type,
            summary,
            detected_at,
            pages!inner(
                title,
                sites!inner(name, url)
            )
        `)
        .order('detected_at', { ascending: false })
        .limit(20);

    // 3. Fetch Global Mentions
    const { data: globalMentionsResponse } = await supabase
        .from('global_mentions')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(20);

    // 4. Merge and unify events
    const allEvents: EventItem[] = [
        ...(localChangesResponse || []).map(ch => ({
            id: ch.id,
            type: 'site_change' as const,
            title: ch.pages?.sites?.name || ch.pages?.title || 'Изменение на сайте',
            source: ch.pages?.sites?.url || 'Local Site',
            description: ch.summary || 'Зафиксированы изменения в контенте страницы.',
            timestamp: ch.detected_at,
            url: ch.pages?.sites?.url || '#',
        })),
        ...(globalMentionsResponse || []).map(gm => ({
            id: gm.id,
            type: 'global_mention' as const,
            title: gm.title,
            source: gm.source || 'Web',
            description: gm.snippet,
            timestamp: gm.detected_at,
            url: gm.url,
        }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 5. Get Sites list for the sidebar or small section
    const { data: sites } = await supabase
        .from('sites')
        .select('*')
        .limit(10);

    return (
        <div className="min-h-screen flex flex-col bg-[#050505]">
            {/* Header */}
            <header className="sticky top-0 z-40 px-6 sm:px-10 py-5 flex items-center justify-between border-b border-white/[0.05] bg-black/40 backdrop-blur-xl">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <Activity className="text-primary w-6 h-6" />
                        Лента событий
                    </h1>
                    <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mt-0.5">Real-time Intelligence Stream</p>
                </div>

                <div className="flex items-center gap-6">
                    <Link href="/dashboard/sites/new" className="bg-primary hover:bg-primary/90 text-black px-6 py-2.5 rounded-2xl text-sm font-black transition-all flex items-center gap-2 active:scale-95">
                        <Plus className="size-4 stroke-[3px]" />
                        Добавить ресурс
                    </Link>
                    <div className="size-10 rounded-full border border-white/10 p-0.5 bg-white/5 flex items-center justify-center font-bold text-white text-sm shrink-0">
                        {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                </div>
            </header>

            <main className="p-6 sm:p-10 max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-10">
                {/* Main Event Feed */}
                <div className="flex-1 space-y-8">
                    {allEvents.length > 0 ? (
                        <div className="relative space-y-6">
                            {/* Vertical line for the timeline */}
                            <div className="absolute left-[21px] top-4 bottom-4 w-px bg-white/[0.05]"></div>

                            {allEvents.map((event, idx) => (
                                <div key={`${event.type}-${event.id}`} className="relative pl-14 group">
                                    {/* Timeline Node */}
                                    <div className={cn(
                                        "absolute left-0 top-1 size-[42px] rounded-2xl flex items-center justify-center border transition-all z-10",
                                        event.type === 'site_change'
                                            ? 'bg-primary/10 border-primary/20 text-primary group-hover:bg-primary group-hover:text-black'
                                            : 'bg-blue-500/10 border-blue-500/20 text-blue-500 group-hover:bg-blue-500 group-hover:text-white'
                                    )}>
                                        {event.type === 'site_change' ? <RefreshCw className="size-5" /> : <Globe className="size-5" />}
                                    </div>

                                    <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] p-6 rounded-[28px] transition-all duration-300">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                                                        event.type === 'site_change' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500'
                                                    )}>
                                                        {event.type === 'site_change' ? 'Target Change' : 'Web Mention'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-wider">
                                                        {formatDate(event.timestamp)}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-black text-white leading-snug group-hover:text-primary transition-colors">
                                                    {event.title}
                                                </h3>
                                            </div>
                                            <a href={event.url} target="_blank" rel="noopener" className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                                                <MoreVertical className="size-4" />
                                            </a>
                                        </div>

                                        <p className="text-gray-400 text-sm font-medium leading-relaxed italic mb-4">
                                            {event.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/[0.03]">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <Database className="size-3 text-white/20" />
                                                <span className="text-[10px] font-bold text-white/30 truncate uppercase tracking-widest">{event.source}</span>
                                            </div>
                                            <a href={event.url} target="_blank" rel="noopener" className="text-[11px] font-black text-primary hover:underline uppercase tracking-tight">
                                                Источник →
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-40 text-center">
                            <History className="size-16 text-white/5 mx-auto mb-6" />
                            <h2 className="text-xl font-bold text-white/40 italic">Лента пока пуста...</h2>
                            <p className="text-white/20 mt-2 text-sm">Добавьте сайты или ключевые слова, чтобы начать сбор данных</p>
                        </div>
                    )}
                </div>

                {/* Sidebar with Stats & Resources */}
                <aside className="lg:w-80 space-y-8">
                    {/* Compact Stats */}
                    <div className="bg-white/[0.03] border border-white/[0.08] p-6 rounded-[32px] space-y-6">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black uppercase tracking-widest text-white/50">Status Overview</h4>
                            <div className="size-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="text-2xl font-black text-white">{sites?.length || 0}</div>
                                <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Targets</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-black text-white">{allEvents.length}</div>
                                <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Events</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Sites List */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-2">Recent Resources</h4>
                        <div className="space-y-2">
                            {sites?.map(site => (
                                <div key={site.id} className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.05] p-4 rounded-2xl flex items-center justify-between group transition-all">
                                    <div className="min-w-0 pr-4">
                                        <div className="text-xs font-bold text-white truncate">{site.name || site.url}</div>
                                        <div className="text-[9px] text-white/20 truncate mt-0.5">{site.url}</div>
                                    </div>
                                    <ScanButton siteId={site.id} />
                                </div>
                            ))}
                        </div>
                        <Link href="/dashboard/sites" className="block text-center text-[10px] font-black text-white/20 hover:text-primary transition-colors uppercase tracking-widest py-2">
                            View All →
                        </Link>
                    </div>

                    {/* Pro Tip */}
                    <div className="bg-primary/5 border border-primary/10 p-6 rounded-[32px]">
                        <Zap className="size-5 text-primary mb-3 fill-primary/20" />
                        <p className="text-xs text-white/60 font-medium leading-relaxed">
                            Используйте <span className="text-primary font-bold">Ключевые слова</span> для глобального поиска упоминаний по всему интернету.
                        </p>
                    </div>
                </aside>
            </main>

            <footer className="mt-auto py-10 px-10 border-t border-white/[0.05] opacity-20">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="text-[10px] font-black uppercase tracking-widest">Aether Event Feed 2.0</div>
                    <div className="text-[10px] font-medium italic">© 2024 Built with Advanced Agentic AI</div>
                </div>
            </footer>
        </div>
    );
}

