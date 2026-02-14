import { ArrowLeft, Bell } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
    return (
        <div className="p-4 sm:p-8 relative min-h-full text-white">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen" />

            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 relative z-10">

                {/* Header / Nav */}
                <div className="flex items-center justify-between gap-4 mt-6 sm:mt-0">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-white/40 hover:text-primary transition-colors font-bold group text-xs sm:text-sm uppercase tracking-wider w-fit"
                    >
                        <ArrowLeft className="size-3 sm:size-4 group-hover:-translate-x-1 transition-transform" />
                        Назад
                    </Link>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-white/40 hover:text-white border border-white/10 hover:bg-white/5 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors">
                            Очистить все
                        </button>
                    </div>
                </div>

                {/* Hero / Title */}
                <div className="glass-card rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-5 pointer-events-none">
                        <Bell className="size-32 sm:size-48 text-white" />
                    </div>

                    <div className="relative z-10 flex items-center gap-6 sm:gap-8">
                        <div className="size-16 sm:size-20 bg-primary/10 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-primary/20 shrink-0">
                            <Bell className="size-8 sm:size-10 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-none mb-2">
                                Уведомления
                            </h1>
                            <p className="text-xs sm:text-sm text-white/50 font-medium max-w-md leading-relaxed">
                                Центр управления событиями и алертами. Здесь отображаются все важные изменения на ваших сайтах.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {/* Empty State */}
                    <div className="glass-card p-10 sm:p-16 rounded-[24px] text-center flex flex-col items-center">
                        <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                            <Bell className="size-8 text-white/20" />
                        </div>
                        <h3 className="text-white font-bold text-base sm:text-lg mb-2">Нет новых уведомлений</h3>
                        <p className="text-white/40 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed">
                            На данный момент все спокойно. Мы сообщим вам, как только обнаружим что-то важное.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
