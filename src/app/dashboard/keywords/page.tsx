'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Bell, Loader2, Search, Zap, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Keyword {
    id: string
    keyword: string
    is_active: boolean
    created_at: string
}

export default function KeywordsPage() {
    const [keywords, setKeywords] = useState<Keyword[]>([])
    const [newKeyword, setNewKeyword] = useState('')
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [error, setError] = useState('')
    const [isScanning, setIsScanning] = useState(false)
    const router = useRouter()

    const supabase = createClient()

    const handleScanAll = async () => {
        if (isScanning) return
        setIsScanning(true)
        const toastId = toast.loading('Запуск полного сканирования всех сайтов...')

        try {
            const response = await fetch('/api/sites/scan-all', { method: 'POST' })
            const data = await response.json()

            if (!response.ok) throw new Error(data.error || 'Ошибка сканирования')

            toast.success(data.message || 'Сканирование завершено', { id: toastId })
            router.refresh()
        } catch (err) {
            console.error('Scan error:', err)
            toast.error('Не удалось запустить сканирование', { id: toastId })
        } finally {
            setIsScanning(false)
        }
    }

    const fetchKeywords = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('keywords')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setKeywords(data || [])
        } catch (err: unknown) {
            console.error('Error fetching keywords:', err)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        fetchKeywords()
    }, [fetchKeywords])

    async function handleAddKeyword(e: React.FormEvent) {
        e.preventDefault()
        if (!newKeyword.trim()) return

        setAdding(true)
        setError('')

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Не авторизован')

            const { error } = await supabase
                .from('keywords')
                .insert([{
                    keyword: newKeyword.trim().toLowerCase(),
                    user_id: user.id
                }])

            if (error) throw error

            setNewKeyword('')
            await fetchKeywords()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка')
        } finally {
            setAdding(false)
        }
    }

    async function handleDeleteKeyword(id: string) {
        try {
            const { error } = await supabase
                .from('keywords')
                .delete()
                .eq('id', id)

            if (error) throw error
            setKeywords(keywords.filter(k => k.id !== id))
        } catch (err: unknown) {
            console.error('Error deleting keyword:', err)
        }
    }

    async function toggleKeywordStatus(id: string, currentStatus: boolean) {
        try {
            const { error } = await supabase
                .from('keywords')
                .update({ is_active: !currentStatus })
                .eq('id', id)

            if (error) throw error
            setKeywords(keywords.map(k => k.id === id ? { ...k, is_active: !currentStatus } : k))
        } catch (err: unknown) {
            console.error('Error toggling keyword:', err)
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto text-white">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Ключевые слова</h1>
                    <p className="text-gray-400 mt-1 font-medium">Глобальный мониторинг упоминаний в новостях и интернете</p>
                </div>
                <button
                    onClick={async () => {
                        if (isScanning) return
                        setIsScanning(true)
                        const toastId = toast.loading('Запуск глобального поиска по всему интернету...')
                        try {
                            const response = await fetch('/api/keywords/scan', { method: 'POST' })
                            const data = await response.json()
                            if (!response.ok) throw new Error(data.error)
                            toast.success(data.message, { id: toastId })
                        } catch (err: any) {
                            toast.error(err.message || 'Ошибка поиска', { id: toastId })
                        } finally {
                            setIsScanning(false)
                        }
                    }}
                    disabled={isScanning}
                    className="flex items-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-2xl text-sm font-bold text-primary transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                    Глобальный скан сейчас
                </button>
            </div>

            {/* Add Keyword Form */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-white/[0.08] p-8 mb-10 shadow-2xl">
                <form onSubmit={handleAddKeyword} className="flex gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            placeholder="Введите слово или фразу (например: скидка)"
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={adding || !newKeyword.trim()}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-2xl font-black text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
                    >
                        {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        Добавить
                    </button>
                </form>
                {error && <p className="text-red-500 text-sm mt-4 font-bold pl-2">{error}</p>}
            </div>

            {/* Keywords List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    </div>
                ) : keywords.length > 0 ? (
                    keywords.map((kw) => (
                        <div
                            key={kw.id}
                            className="bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] p-5 flex items-center justify-between group hover:bg-white/[0.04] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kw.is_active ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                                    <Bell className="w-5 h-5" />
                                </div>
                                <span className={`text-lg font-bold tracking-tight ${!kw.is_active && 'text-gray-500 line-through'}`}>
                                    {kw.keyword}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => toggleKeywordStatus(kw.id, kw.is_active)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${kw.is_active ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
                                >
                                    {kw.is_active ? 'Пауза' : 'Включить'}
                                </button>
                                <button
                                    onClick={() => handleDeleteKeyword(kw.id)}
                                    className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white/[0.01] rounded-[40px] border border-dashed border-white/10 p-20 text-center">
                        <Bell className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Список слов пуст</p>
                    </div>
                )}
            </div>

            <div className="mt-12 p-6 bg-primary/5 rounded-3xl border border-primary/10">
                <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 fill-primary" />
                    Глобальный OSINT Мониторинг
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                    Система автоматически сканирует новости, медиа и открытые данные по всему миру каждый день в <span className="text-primary font-bold">9:00 утра</span>.
                    Мы используем ИИ, чтобы составить краткую выжимку каждого упоминания и предоставить прямую ссылку на первоисточник.
                    Глобальный скан можно также запустить вручную в любое время.
                </p>
            </div>
        </div>
    )
}
