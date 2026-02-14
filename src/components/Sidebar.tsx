'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { name: 'Рабочий стол', icon: 'dashboard', href: '/dashboard' },
    { name: 'Мои сайты', icon: 'language', href: '/dashboard/sites' },
    { name: 'Ключевые слова', icon: 'key', href: '/dashboard/keywords' },
    { name: 'Уведомления', icon: 'notifications', href: '/dashboard/notifications' },
    { name: 'Настройки', icon: 'settings', href: '/dashboard/settings' },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    const toggleSidebar = () => setIsOpen(!isOpen)

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-6 right-4 z-[60] size-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary backdrop-blur-md"
            >
                {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed left-0 top-0 h-screen w-64 glass-panel border-r border-white/5 z-[55] flex flex-col transition-transform duration-300 lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-3xl text-primary">monitoring</span>
                        <span className="font-bold text-xl tracking-tight text-white">
                            Aether<span className="text-primary">.</span>
                        </span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3 rounded-lg transition-all group",
                                    isActive
                                        ? "sidebar-active"
                                        : "text-white/50 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                <span className="text-sm font-medium">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="mt-auto p-6">
                    <div className="glass-card p-4 rounded-xl">
                        <div className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mb-1">Статус</div>
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                            <span className="text-xs text-white/70">Система активна</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}
