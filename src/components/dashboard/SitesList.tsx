'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Globe,
    MoreVertical,
    Eye,
    ChevronDown,
    Database
} from 'lucide-react'
import { ScanButton } from '@/components/ScanButton'
import { cn } from '@/lib/utils'

interface SiteItem {
    id: string;
    name: string | null;
    url: string;
    is_active: boolean;
    last_scanned_at: string | null;
    scan_interval_minutes: number;
}

export function SitesList({ sites }: { sites: SiteItem[] }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="glass-card rounded-2xl overflow-hidden transition-all duration-500 ease-in-out border border-white/5 bg-white/[0.01]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group cursor-pointer"
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "size-10 rounded-xl flex items-center justify-center border transition-all duration-300",
                        isOpen
                            ? "bg-primary text-obsidian border-primary border-transparent shadow-[0_0_15px_rgba(255,138,0,0.3)]"
                            : "bg-white/[0.03] text-white/40 border-white/10 group-hover:text-white group-hover:border-white/20"
                    )}>
                        <Database className="size-5" />
                    </div>
                    <div className="text-left">
                        <h3 className={cn(
                            "font-bold text-sm sm:text-base uppercase tracking-wider transition-colors",
                            isOpen ? "text-white" : "text-white/70"
                        )}>
                            Ваши ресурсы
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-white/30 font-medium uppercase tracking-widest mt-0.5">
                            <span>{sites?.length || 0} в списке</span>
                            <span className="size-1 rounded-full bg-white/20" />
                            <span>{isOpen ? 'Развернуто' : 'Свернуто'}</span>
                        </div>
                    </div>
                </div>

                <div className={cn(
                    "size-8 rounded-full border border-white/5 flex items-center justify-center text-white/40 transition-all duration-500",
                    isOpen ? "rotate-180 bg-white/10 text-white" : "rotate-0 bg-transparent"
                )}>
                    <ChevronDown className="size-4" />
                </div>
            </button>

            <div className={cn(
                "overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out",
                isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            )}>
                <div className="overflow-x-auto border-t border-white/5">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] text-[9px] sm:text-[11px] uppercase tracking-[0.2em] text-white/40 font-bold">
                                <th className="px-6 sm:px-8 py-4">Ресурс</th>
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
                                                    <div className="text-sm font-bold text-white truncate max-w-[120px] sm:max-w-none">{site.name || 'Без названия'}</div>
                                                    <div className="text-[9px] sm:text-[10px] text-white/30 truncate max-w-[150px] sm:max-w-none hover:text-primary transition-colors cursor-pointer">{site.url}</div>
                                                </div>
                                            </div>
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
                                        <td className="px-6 sm:px-8 py-5 text-right whitespace-nowrap">
                                            <div className="flex justify-end gap-1 sm:gap-2">
                                                <ScanButton siteId={site.id} />
                                                <Link href={`/dashboard/sites/${site.id}/preview`} className="size-8 flex items-center justify-center text-white/20 hover:text-primary transition-all hover:bg-primary/5 rounded-lg" title="Живой просмотр">
                                                    <Eye className="size-4" />
                                                </Link>
                                                <Link href={`/dashboard/sites/${site.id}`} className="size-8 flex items-center justify-center text-white/20 hover:text-primary transition-all hover:bg-primary/5 rounded-lg">
                                                    <MoreVertical className="size-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-8 py-20 text-center text-white/20 text-sm italic">
                                        Список пуст. Добавьте первый сайт для начала работы.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
