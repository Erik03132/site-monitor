import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Globe, Plus, MoreVertical, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScanButton } from '@/components/ScanButton';

export default async function SitesPage() {
    const supabase = await createClient();

    const { data: sites } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="p-4 sm:p-8 relative min-h-full text-white">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen" />

            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 relative z-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 sm:mt-0">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Мои сайты</h1>
                        <p className="text-xs sm:text-sm text-white/40">Управление ресурсами и настройками мониторинга.</p>
                    </div>
                    <Link href="/dashboard/sites/new" className="amber-button px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold text-obsidian flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto justify-center">
                        <Plus className="size-4" />
                        Добавить сайт
                    </Link>
                </div>

                {/* Sites List */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                            <Globe className="size-5 text-primary" />
                            <h3 className="font-bold text-white text-sm sm:text-base uppercase tracking-wider">Все ресурсы</h3>
                        </div>
                        <span className="text-[10px] sm:text-xs text-white/30 font-bold uppercase tracking-widest">{sites?.length || 0} всего</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.02] text-[9px] sm:text-[11px] uppercase tracking-[0.2em] text-white/40 font-bold">
                                    <th className="px-6 sm:px-8 py-4">Ресурс</th>
                                    <th className="px-6 sm:px-8 py-4 hidden sm:table-cell">Интервал</th>
                                    <th className="px-6 sm:px-8 py-4 hidden xs:table-cell">Статус</th>
                                    <th className="px-6 sm:px-8 py-4 text-center">Действие</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sites && sites.length > 0 ? (
                                    sites.map((site) => (
                                        <tr key={site.id} className="hover:bg-white/[0.03] transition-colors group">
                                            <td className="px-6 sm:px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded bg-obsidian-light flex items-center justify-center border border-white/5 shrink-0">
                                                        <Globe className="size-4 text-primary" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-bold text-white truncate max-w-[120px] sm:max-w-[200px]">{site.name || 'Без названия'}</div>
                                                        <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-[9px] sm:text-[10px] text-white/30 truncate max-w-[150px] sm:max-w-xs hover:text-primary transition-colors block">{site.url}</a>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 sm:px-8 py-5 hidden sm:table-cell text-sm text-white/60">
                                                {site.scan_interval_minutes} мин
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
                                                    <ScanButton siteId={site.id} variant="icon" />
                                                    <Link href={`/dashboard/sites/${site.id}`} className="size-8 flex items-center justify-center text-white/20 hover:text-primary transition-all hover:bg-primary/5 rounded-lg">
                                                        <MoreVertical className="size-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-white/20 text-sm italic">
                                            Список пуст. Добавьте первый сайт для начала работы.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
