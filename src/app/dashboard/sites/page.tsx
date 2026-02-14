import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Globe, MoreVertical, ExternalLink, Trash2, Pencil, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Site } from '@/types/database'

export default async function SitesPage() {
    const supabase = await createClient()

    const { data: sites, error } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching sites:', error)
    }

    return (
        <div className="p-8 max-w-7xl mx-auto text-white">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Мои сайты</h1>
                    <p className="text-gray-400 mt-1 font-medium">Управление списком отслеживаемых ресурсов</p>
                </div>
                <Link
                    href="/dashboard/sites/new"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Добавить сайт
                </Link>
            </div>

            {sites && sites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sites.map((site: Site) => (
                        <div
                            key={site.id}
                            className="bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 hover:bg-white/[0.05] hover:border-white/[0.15] transition-all group relative overflow-hidden"
                        >
                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${site.is_active ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-gray-800 border-gray-700 text-gray-400'
                                        }`}>
                                        <Globe className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                                            {site.name || new URL(site.url).hostname}
                                        </h3>
                                        <p className="text-gray-500 text-xs mt-1 truncate max-w-[150px] font-medium tracking-tight">
                                            {site.url}
                                        </p>
                                    </div>
                                </div>

                                <div className="relative group/menu">
                                    <button className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                                        <MoreVertical className="w-5 h-5 text-gray-500" />
                                    </button>
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 overflow-hidden">
                                        <Link
                                            href={`/dashboard/sites/${site.id}/edit`}
                                            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 font-semibold"
                                        >
                                            <Pencil className="w-4 h-4 text-blue-400" />
                                            Изменить
                                        </Link>
                                        <Link
                                            href={`/dashboard/sites/${site.id}/preview`}
                                            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 font-semibold"
                                        >
                                            <Eye className="w-4 h-4 text-blue-400" />
                                            Живой просмотр
                                        </Link>
                                        <a
                                            href={site.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 font-semibold"
                                        >
                                            <ExternalLink className="w-4 h-4 text-green-400" />
                                            Открыть сайт
                                        </a>
                                        <button className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 font-bold w-full text-left">
                                            <Trash2 className="w-4 h-4" />
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto relative z-10">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${site.is_active
                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                    : 'bg-gray-800 text-gray-500 border border-gray-700'
                                    }`}>
                                    {site.is_active ? 'Активен' : 'Пауза'}
                                </span>
                                <span className="text-gray-500 text-[11px] font-bold">
                                    {site.last_scanned_at
                                        ? `${formatDate(site.last_scanned_at)}`
                                        : 'Ещё не сканировался'}
                                </span>
                            </div>

                            <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between text-xs relative z-10">
                                <span className="text-gray-600 font-bold">Интервал: {site.scan_interval_minutes}м</span>
                                <Link
                                    href={`/dashboard/sites/${site.id}`}
                                    className="text-blue-500 hover:text-blue-400 font-extrabold uppercase tracking-widest"
                                >
                                    Детали →
                                </Link>
                            </div>

                            {/* Decorative background circle */}
                            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/[0.02] rounded-[40px] border border-white/[0.05] p-24 text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Globe className="w-10 h-10 text-gray-700" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Список пуст</h3>
                    <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">Добавьте свой первый сайт, чтобы мы могли начать отслеживать изменения и присылать вам уведомления.</p>
                    <Link
                        href="/dashboard/sites/new"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-2xl font-bold shadow-2xl transition-all active:scale-95"
                    >
                        <Plus className="w-6 h-6" />
                        Добавить первый сайт
                    </Link>
                </div>
            )}
        </div>
    )
}
