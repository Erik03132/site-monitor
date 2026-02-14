'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
    ArrowLeft,
    Globe,
    Clock,
    Zap,
    RefreshCw,
    ExternalLink,
    Trash2,
    Play,
    Loader2
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Site {
    id: string
    url: string
    name: string | null
    scan_interval_minutes: number
    is_active: boolean
    last_scanned_at: string | null
    created_at: string
}

interface Change {
    id: string
    change_type: 'added' | 'removed' | 'modified'
    old_content: string | null
    new_content: string | null
    summary: string | null
    detected_at: string
}

export default function SiteDetailPage() {
    const params = useParams()
    const router = useRouter()
    const siteId = params.id as string

    const [site, setSite] = useState<Site | null>(null)
    const [changes, setChanges] = useState<Change[]>([])
    const [loading, setLoading] = useState(true)
    const [scanning, setScanning] = useState(false)
    const [scanResult, setScanResult] = useState<string | null>(null)


    useEffect(() => {
        const loadData = async () => {
            const supabase = createClient()

            const { data: siteData } = await supabase
                .from('sites')
                .select('*')
                .eq('id', siteId)
                .single()

            if (siteData) {
                setSite(siteData)

                const { data: changesData } = await supabase
                    .from('chunk_changes')
                    .select(`
              id,
              change_type,
              old_content,
              new_content,
              summary,
              detected_at,
              pages!inner(site_id)
            `)
                    .eq('pages.site_id', siteId)
                    .order('detected_at', { ascending: false })
                    .limit(50)

                setChanges(changesData as unknown as Change[] || [])
            }

            setLoading(false)
        }
        loadData()
    }, [siteId])

    async function handleScan() {
        setScanning(true)
        setScanResult(null)

        try {
            const response = await fetch(`/api/sites/${siteId}/scan`, {
                method: 'POST'
            })

            const result = await response.json()

            if (response.ok) {
                setScanResult(result.message === 'No changes detected'
                    ? '✅ Изменений не обнаружено'
                    : `✅ Сканирование завершено: обнаружено ${result.chunks_count || 0} обновлений`)
                window.location.reload() // Refresh data
            } else {
                setScanResult(`❌ Ошибка: ${result.error}`)
            }
        } catch (error) {
            setScanResult(`❌ Ошибка сети: ${error}`)
        }

        setScanning(false)
    }

    async function handleDelete() {
        if (!confirm('Вы уверены, что хотите удалить этот сайт и всю историю изменений? Это действие необратимо.')) return

        const response = await fetch(`/api/sites/${siteId}`, { method: 'DELETE' })
        if (response.ok) {
            router.push('/dashboard/sites')
        }
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        )
    }

    if (!site) {
        return (
            <div className="p-20 text-center">
                <p className="text-gray-400 text-xl font-bold">Сайт не найден</p>
                <Link href="/dashboard/sites" className="text-blue-500 mt-6 inline-block font-black uppercase tracking-widest border-b-2 border-blue-500/20 pb-1">
                    ← Вернуться к списку
                </Link>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto text-white">
            {/* Header */}
            <div className="mb-10">
                <Link
                    href="/dashboard/sites"
                    className="text-gray-500 hover:text-white flex items-center gap-2 mb-6 font-bold group transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Назад к списку сайтов
                </Link>

                <div className="flex flex-col md:row md:items-center justify-between gap-6 bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-white/[0.08] p-8 relative overflow-hidden group/header">
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20">
                            <Globe className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">{site.name || 'Без названия'}</h1>
                            <a
                                href={site.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-blue-400 flex items-center gap-2 mt-1 font-medium transition-colors"
                            >
                                <span className="truncate max-w-[200px] md:max-w-md">{site.url}</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10 flex-wrap">
                        <Link
                            href={`/dashboard/sites/${siteId}/preview`}
                            className="flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-white transition-all active:scale-[0.98]"
                        >
                            <ExternalLink className="w-5 h-5 text-primary" />
                            Просмотр в оболочке
                        </Link>

                        <button
                            onClick={handleScan}
                            disabled={scanning}
                            className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/80 disabled:opacity-50 rounded-2xl font-black text-obsidian shadow-[0_10px_30px_rgba(255,138,0,0.3)] transition-all active:scale-[0.98]"
                        >
                            {scanning ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Play className="w-5 h-5" />
                            )}
                            {scanning ? 'Сканирование...' : 'Запустить сканер'}
                        </button>

                        <button
                            onClick={handleDelete}
                            className="p-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-2xl transition-all"
                            title="Удалить сайт"
                        >
                            <Trash2 className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Decorative glow */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl pointer-events-none group-hover/header:bg-blue-600/10 transition-all" />
                </div>

                {scanResult && (
                    <div className={`mt-6 p-5 rounded-2xl font-bold text-sm animate-shake shadow-xl ${scanResult.startsWith('✅')
                        ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                        : 'bg-red-500/10 border border-red-500/20 text-red-500'
                        }`}>
                        {scanResult}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">
                            <Clock className="w-3.5 h-3.5" />
                            Интервал
                        </div>
                        <p className="text-2xl font-black tracking-tight">{site.scan_interval_minutes} мин</p>
                    </div>
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-600">
                        <Zap className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">
                            <RefreshCw className="w-3.5 h-3.5" />
                            Последняя проверка
                        </div>
                        <p className="text-xl font-black tracking-tight">
                            {site.last_scanned_at ? formatDate(site.last_scanned_at) : 'Никогда'}
                        </p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${site.last_scanned_at ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-gray-700'}`} />
                </div>

                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">
                            <Zap className="w-3.5 h-3.5" />
                            Статус мониторинга
                        </div>
                        <p className={`text-2xl font-black tracking-tight ${site.is_active ? 'text-green-500' : 'text-gray-500'}`}>
                            {site.is_active ? 'Активен' : 'Пауза'}
                        </p>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-black border ${site.is_active ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                        {site.is_active ? 'ON' : 'OFF'}
                    </div>
                </div>
            </div>

            {/* Changes Feed */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[40px] overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                    <h2 className="text-xl font-black tracking-tight uppercase">История изменений</h2>
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                        {changes.length} записей
                    </span>
                </div>

                {changes.length > 0 ? (
                    <div className="divide-y divide-white/[0.08]">
                        {changes.map((change) => (
                            <div key={change.id} className="p-8 hover:bg-white/[0.02] transition-all group/item">
                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${change.change_type === 'added' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                        change.change_type === 'removed' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                            'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                        }`}>
                                        {change.change_type === 'added' ? 'Добавлено' :
                                            change.change_type === 'removed' ? 'Удалено' : 'Изменено'}
                                    </span>
                                    <span className="text-gray-500 text-xs font-bold uppercase tracking-tighter">
                                        {formatDate(change.detected_at)}
                                    </span>
                                </div>

                                {change.summary && (
                                    <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/5 relative">
                                        <div className="absolute top-4 left-4 w-1 h-2/3 bg-blue-500 rounded-full" />
                                        <p className="text-white text-base leading-relaxed font-medium pl-4 italic">&quot;{change.summary}&quot;</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:row gap-6">
                                    {change.change_type === 'modified' && (
                                        <>
                                            <div className="bg-red-500/[0.03] border border-red-500/10 rounded-2xl p-6">
                                                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-3">Как было</p>
                                                <p className="text-gray-400 text-sm line-clamp-4 font-medium leading-relaxed">{change.old_content}</p>
                                            </div>
                                            <div className="bg-green-500/[0.03] border border-green-500/10 rounded-2xl p-6">
                                                <p className="text-green-500 text-[10px] font-black uppercase tracking-widest mb-3">Как стало</p>
                                                <p className="text-gray-200 text-sm line-clamp-4 font-medium leading-relaxed">{change.new_content}</p>
                                            </div>
                                        </>
                                    )}

                                    {change.change_type === 'added' && change.new_content && (
                                        <div className="bg-green-500/[0.03] border border-green-500/10 rounded-2xl p-6">
                                            <p className="text-green-500 text-[10px] font-black uppercase tracking-widest mb-3">Новое содержание</p>
                                            <p className="text-gray-200 text-sm font-medium leading-relaxed italic">{change.new_content}</p>
                                        </div>
                                    )}

                                    {change.change_type === 'removed' && change.old_content && (
                                        <div className="bg-red-500/[0.02] border border-red-500/10 rounded-2xl p-6 opacity-40">
                                            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-3">Удаленное содержание</p>
                                            <p className="text-gray-500 text-sm font-medium leading-relaxed">{change.old_content}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-24 text-center">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Zap className="w-10 h-10 text-gray-800" />
                        </div>
                        <h3 className="text-xl font-black text-gray-500 uppercase tracking-widest">Никаких изменений</h3>
                        <p className="text-gray-600 mt-2 font-medium">Запустите сканирование вручную, чтобы ускорить процесс.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
