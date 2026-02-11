'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Activity,
    LayoutDashboard,
    Globe,
    Bell,
    Settings,
    Database,
    Monitor,
    Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Рабочий стол', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Мои сайты', href: '/dashboard/sites', icon: Globe },
    { name: 'Ключевые слова', href: '/dashboard/keywords', icon: Hash },
    { name: 'Уведомления', href: '/dashboard/notifications', icon: Bell },
    { name: 'Настройки', href: '/dashboard/settings', icon: Settings },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-black border-r border-white/5 z-50 flex flex-col hidden lg:flex">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <Monitor className="text-3xl text-primary" />
                    <span className="font-bold text-xl tracking-tight text-white">
                        Aether<span className="text-primary">.</span>
                    </span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                                isActive
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "text-white/50 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("size-5", isActive ? "text-primary" : "text-white/40 group-hover:text-white")} />
                            <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto p-6">
                <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl relative overflow-hidden">
                    <div className="text-[10px] font-black text-primary tracking-[0.2em] uppercase mb-2">System Status</div>
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,138,0,0.8)]"></div>
                        <span className="text-[11px] font-bold text-white/70">Мониторинг активен</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};
