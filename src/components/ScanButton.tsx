'use client'

import React, { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ScanButtonProps {
    siteId: string
}

export function ScanButton({ siteId }: ScanButtonProps) {
    const [isScanning, setIsScanning] = useState(false)
    const router = useRouter()

    const handleScan = async () => {
        if (isScanning) return

        setIsScanning(true)
        const toastId = toast.loading('Сканирование сайта...')

        try {
            const response = await fetch(`/api/sites/${siteId}/scan`, {
                method: 'POST'
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при сканировании')
            }

            if (data.changesFound) {
                toast.success('Найдено изменений: ' + data.chunksCount, { id: toastId })
            } else {
                toast.success('Изменений не обнаружено', { id: toastId })
            }

            router.refresh()
        } catch (error) {
            console.error('Scan error:', error)
            toast.error(error instanceof Error ? error.message : 'Не удалось запустить сканирование', { id: toastId })
        } finally {
            setIsScanning(false)
        }
    }

    return (
        <button
            onClick={handleScan}
            disabled={isScanning}
            title="Scan now"
            className="size-8 flex items-center justify-center text-white/20 hover:text-primary transition-all bg-transparent hover:bg-primary/5 rounded-lg border-none group/btn disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <RefreshCw className={`size-4 ${isScanning ? 'animate-spin text-primary' : 'group-active/btn:rotate-180'} transition-transform duration-500`} />
        </button>
    )
}
