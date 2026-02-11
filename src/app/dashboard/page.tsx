import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Plus, Globe, History, RefreshCw, Database, Activity, ExternalLink, ArrowRight } from 'lucide-react';
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
        ...(localChangesResponse || []).map(ch => {
            const page = (ch as any).pages;
            const site = page?.sites;
            return {
                id: ch.id,
                type: 'site_change' as const,
                title: site?.name || page?.title || 'Изменение на сайте',
                source: site?.url || 'Local Site',
                description: ch.summary || 'Зафиксированы изменения в контенте страницы.',
                timestamp: ch.detected_at,
                url: site?.url || '#',
            };
        }),
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

            <main className="p-6 sm:p-10 max-w-5xl mx-auto w-full">
                {/* Main Event Feed */}
                <div className="space-y-8">
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

                                    <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] p-8 rounded-[32px] transition-all duration-300 shadow-2xl hover:shadow-primary/5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg",
                                                        event.type === 'site_change' ? 'bg-primary/10 text-primary border border-primary/10' : 'bg-blue-500/10 text-blue-500 border border-blue-500/10'
                                                    )}>
                                                        {event.type === 'site_change' ? 'Site Update' : 'Market Insight'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                                        {formatDate(event.timestamp)}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight group-hover:text-primary transition-colors">
                                                    {event.title}
                                                </h3>
                                            </div>
                                            <a href={event.url} target="_blank" rel="noopener" className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5 shrink-0">
                                                <ExternalLink className="size-5" />
                                            </a>
                                        </div>

                                        <div className="bg-white/[0.01] rounded-2xl p-6 mb-6 border border-white/5">
                                            <p className="text-gray-300 text-base leading-relaxed font-medium">
                                                {event.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-white/[0.03]">
                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                <div className="size-6 rounded-md bg-white/5 flex items-center justify-center border border-white/5">
                                                    <Database className="size-3 text-white/40" />
                                                </div>
                                                <span className="text-[11px] font-black text-white/30 truncate uppercase tracking-[0.1em]">{event.source}</span>
                                            </div>
                                            <a href={event.url} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-xs font-black text-primary hover:underline uppercase tracking-tight group/link">
                                                Первоисточник
                                                <ArrowRight className="size-4 group-hover/link:translate-x-1 transition-transform" />
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

