'use client'

import { useState } from 'react'
import { RefreshCw, Loader2, Check, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ScanButtonProps {
    siteId: string
    variant?: 'text' | 'icon'
    className?: string
}

export function ScanButton({ siteId, variant = 'text', className }: ScanButtonProps) {
    const router = useRouter()
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const handleScan = async (e: React.MouseEvent) => {
        e.preventDefault()
        if (status === 'loading') return

        setStatus('loading')

        try {
            const res = await fetch(`/api/sites/${siteId}/scan`, {
                method: 'POST',
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Ошибка')
            }

            setStatus('success')
            router.refresh()

            // Reset status after delay
            setTimeout(() => setStatus('idle'), 2000)
        } catch (error) {
            console.error('Scan error:', error)
            setStatus('error')
            setTimeout(() => setStatus('idle'), 2000)
        }
    }

    if (variant === 'icon') {
        return (
            <button
                onClick={handleScan}
                disabled={status === 'loading'}
                title="Сканировать сейчас"
                className={cn(
                    "size-8 flex items-center justify-center transition-all rounded-lg border-none",
                    status === 'idle' ? "text-white/20 hover:text-primary hover:bg-primary/5" : "",
                    status === 'loading' ? "text-primary bg-primary/10 cursor-wait" : "",
                    status === 'success' ? "text-green-500 bg-green-500/10" : "",
                    status === 'error' ? "text-red-500 bg-red-500/10" : "",
                    className
                )}
            >
                {status === 'loading' ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : status === 'success' ? (
                    <Check className="size-4" />
                ) : status === 'error' ? (
                    <AlertTriangle className="size-4" />
                ) : (
                    <RefreshCw className="size-4 transition-transform duration-500 group-active:rotate-180" />
                )}
            </button>
        )
    }

    return (
        <button
            onClick={handleScan}
            disabled={status === 'loading'}
            className={cn(
                "amber-button px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
                status === 'loading' ? "opacity-80 cursor-wait" : "",
                status === 'success' ? "!bg-green-500 !text-white !border-green-600" : "",
                status === 'error' ? "!bg-red-500 !text-white !border-red-600" : "",
                className
            )}
        >
            <span className="hidden xs:inline">
                {status === 'idle' ? 'Сканировать' :
                    status === 'loading' ? 'Сканирую...' :
                        status === 'success' ? 'Готово!' : 'Ошибка'}
            </span>
            {status === 'loading' ? (
                <Loader2 className="size-3 sm:size-4 animate-spin" />
            ) : status === 'success' ? (
                <Check className="size-3 sm:size-4" />
            ) : status === 'error' ? (
                <AlertTriangle className="size-3 sm:size-4" />
            ) : (
                <RefreshCw className="size-3 sm:size-4" />
            )}
        </button>
    )
}
