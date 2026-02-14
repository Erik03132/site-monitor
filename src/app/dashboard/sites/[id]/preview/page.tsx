'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    ArrowLeft,
    RefreshCcw,
    ExternalLink,
    Maximize2,
    Smartphone,
    Monitor,
    ShieldCheck,
    Zap,
    Loader2
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Site {
    id: string
    url: string
    name: string | null
}

export default function SitePreviewPage() {
    const params = useParams()
    const router = useRouter()
    const siteId = params.id as string

    const [site, setSite] = useState<Site | null>(null)
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        const fetchSite = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('sites')
                .select('id, url, name')
                .eq('id', siteId)
                .single()

            if (data) setSite(data)
            setLoading(false)
        }
        fetchSite()
    }, [siteId])

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        )
    }

    if (!site) {
        return (
            <div className="p-20 text-center">
                <p className="text-white/40 text-xl font-bold italic underline decoration-primary/20">Ресурс не найден</p>
                <Link href="/dashboard" className="amber-button mt-8 inline-flex px-8 py-3 rounded-xl font-black uppercase tracking-widest">
                    Вернуться на базу
                </Link>
            </div>
        )
    }

    const proxyUrl = `/api/proxy?url=${encodeURIComponent(site.url)}&v=${refreshKey}`

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col p-4 lg:p-8 space-y-6">
            {/* Header / Control Panel */}
            <div className="glass-card rounded-[2rem] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                    >
                        <ArrowLeft className="size-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                            {site.name || 'Просмотр сайта'}
                            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">В ЭФИРЕ</span>
                        </h1>
                        <div className="text-[10px] text-white/30 font-medium truncate max-w-[200px] md:max-w-md italic">
                            {site.url}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-obsidian-light/50 p-1.5 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setViewMode('desktop')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-tighter",
                            viewMode === 'desktop' ? "bg-primary text-obsidian shadow-lg" : "text-white/40 hover:text-white"
                        )}
                    >
                        <Monitor className="size-3.5" />
                        <span className="hidden sm:inline">ПК</span>
                    </button>
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-tighter",
                            viewMode === 'mobile' ? "bg-primary text-obsidian shadow-lg" : "text-white/40 hover:text-white"
                        )}
                    >
                        <Smartphone className="size-3.5" />
                        <span className="hidden sm:inline">Моб</span>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setRefreshKey(k => k + 1)}
                        className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-primary hover:bg-primary/5 transition-all border border-white/5 group"
                        title="Обновить превью"
                    >
                        <RefreshCcw className="size-4 group-active:rotate-180 transition-transform duration-500" />
                    </button>
                    <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-green-400 hover:bg-green-400/5 transition-all border border-white/5"
                        title="Открыть в новом окне"
                    >
                        <ExternalLink className="size-4" />
                    </a>
                    <button className="hidden lg:flex items-center gap-2 px-6 py-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all">
                        <ShieldCheck className="size-4" />
                        Инспектор
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 glass-card rounded-[2.5rem] overflow-hidden relative group/frame border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className={cn(
                    "h-full mx-auto transition-all duration-700 ease-in-out bg-white p-1 md:p-3",
                    viewMode === 'desktop' ? "w-full" : "w-[375px] md:w-[420px] rounded-[3rem] border-[12px] border-obsidian shadow-2xl"
                )}>
                    {/* Browser Chrome Placeholder (for mobile) */}
                    {viewMode === 'mobile' && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-obsidian rounded-b-2xl z-20 flex items-center justify-center">
                            <div className="w-12 h-1 bg-white/10 rounded-full" />
                        </div>
                    )}

                    <iframe
                        key={refreshKey}
                        src={proxyUrl}
                        className="w-full h-full rounded-2xl md:rounded-[1.5rem]"
                        title="Site Preview"
                        sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                        loading="lazy"
                    />
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-10 left-10 opacity-0 group-hover/frame:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="bg-obsidian/80 backdrop-blur-xl border border-primary/20 p-4 rounded-2xl flex items-center gap-4 shadow-2xl">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Zap className="size-5 text-primary animate-pulse" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-primary">Живая защита</div>
                            <div className="text-xs text-white/70 font-medium">Безопасный просмотр в оболочке Aether</div>
                        </div>
                    </div>
                </div>

                {/* Decoration */}
                <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 rounded-[2.5rem] z-30" />
            </div>
        </div>
    )
}
