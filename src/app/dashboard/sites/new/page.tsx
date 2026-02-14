'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Globe, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewSitePage() {
    const router = useRouter()
    const [url, setUrl] = useState('')
    const [name, setName] = useState('')
    const [interval, setInterval] = useState(60)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch('/api/sites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    name: name || undefined,
                    scan_interval_minutes: interval,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Не удалось добавить сайт')
            }

            router.push('/dashboard')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen obsidian-gradient p-4 sm:p-8">
            <div className="max-w-2xl mx-auto mt-6 sm:mt-10">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-white/40 hover:text-primary mb-6 sm:mb-8 transition-colors font-bold group text-xs sm:text-sm"
                >
                    <ArrowLeft className="size-3 sm:size-4 group-hover:-translate-x-1 transition-transform" />
                    Назад к панели
                </Link>

                <div className="glass-card rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-4 sm:gap-5 mb-8 sm:mb-10 relative z-10">
                        <div className="size-12 sm:size-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
                            <Globe className="size-6 sm:size-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white uppercase italic">Aether<span className="text-primary">.</span> MONITOR</h1>
                            <p className="text-[10px] sm:text-xs text-white/40 mt-1 font-medium italic">— Добавление ресурса</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 relative z-10 text-left">
                        <div>
                            <label htmlFor="url" className="block text-[10px] sm:text-[11px] font-bold text-white/50 mb-2 sm:mb-3 uppercase tracking-[0.2em]">
                                URL веб-сайта <span className="text-primary">*</span>
                            </label>
                            <input
                                id="url"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                required
                                className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-sm sm:text-base text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-[10px] sm:text-[11px] font-bold text-white/50 mb-2 sm:mb-3 uppercase tracking-[0.2em]">
                                Название <span className="text-white/20 text-[9px] lowercase italic">(необязательно)</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Например: Блог конкурента"
                                className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-sm sm:text-base text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="interval" className="block text-[10px] sm:text-[11px] font-bold text-white/50 mb-2 sm:mb-3 uppercase tracking-[0.2em]">
                                Интервал сканирования
                            </label>
                            <div className="relative">
                                <select
                                    id="interval"
                                    value={interval}
                                    onChange={(e) => setInterval(Number(e.target.value))}
                                    className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all appearance-none cursor-pointer"
                                >
                                    <option value={15} className="bg-obsidian">Каждые 15 минут</option>
                                    <option value={30} className="bg-obsidian">Каждые 30 минут</option>
                                    <option value={60} className="bg-obsidian">Каждый час</option>
                                    <option value={360} className="bg-obsidian">Каждые 6 часов</option>
                                    <option value={1440} className="bg-obsidian">Раз в сутки</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                    <ArrowLeft className="size-4 rotate-[270deg]" />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs sm:text-sm font-bold">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link
                                href="/dashboard"
                                className="flex-1 px-5 py-3.5 sm:py-4 border border-white/10 hover:bg-white/5 rounded-2xl text-center transition-all font-bold text-white/60 text-sm"
                            >
                                Отмена
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 amber-button px-5 py-3.5 sm:py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-obsidian uppercase tracking-wider text-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="size-4 sm:size-5 animate-spin" />
                                        Добавление...
                                    </>
                                ) : (
                                    'Добавить сайт'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Decorative background glow */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                </div>
            </div>
        </div>
    )
}
