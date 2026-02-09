import { ArrowLeft, User, Shield, Bell, CreditCard, Monitor, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    return (
        <div className="p-4 sm:p-8 relative min-h-full text-white">
            {/* Decorative background glow to ensure style consistency */}
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
                </div>

                {/* Hero / Title */}
                <div className="glass-card rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-5 pointer-events-none">
                        <User className="size-32 sm:size-48 text-white" />
                    </div>

                    <div className="relative z-10 flex items-center gap-6 sm:gap-8">
                        <div className="size-16 sm:size-20 bg-primary/10 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-primary/20 shrink-0">
                            <User className="size-8 sm:size-10 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-none mb-2">
                                Настройки
                            </h1>
                            <p className="text-xs sm:text-sm text-white/50 font-medium max-w-md leading-relaxed">
                                Управление аккаунтом, уведомлениями и параметрами мониторинга.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Account Settings */}
                    <div className="glass-card p-6 sm:p-8 rounded-[24px] hover:border-primary/20 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                            <User className="size-24" />
                        </div>
                        <div className="relative z-10">
                            <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center mb-4 sm:mb-6 border border-white/5 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                                <User className="size-5 text-white/60 group-hover:text-primary transition-colors" />
                            </div>
                            <h3 className="text-white font-bold text-sm mb-1">Профиль</h3>
                            <p className="text-white/40 text-[10px] sm:text-xs leading-relaxed">Личные данные, пароль и email.</p>
                        </div>
                    </div>

                    {/* Monitoring */}
                    <div className="glass-card p-6 sm:p-8 rounded-[24px] hover:border-primary/20 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                            <Monitor className="size-24" />
                        </div>
                        <div className="relative z-10">
                            <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center mb-4 sm:mb-6 border border-white/5 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                                <Monitor className="size-5 text-white/60 group-hover:text-primary transition-colors" />
                            </div>
                            <h3 className="text-white font-bold text-sm mb-1">Мониторинг</h3>
                            <p className="text-white/40 text-[10px] sm:text-xs leading-relaxed">Настройки сканирования и частоты.</p>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="glass-card p-6 sm:p-8 rounded-[24px] hover:border-primary/20 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                            <Bell className="size-24" />
                        </div>
                        <div className="relative z-10">
                            <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center mb-4 sm:mb-6 border border-white/5 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                                <Bell className="size-5 text-white/60 group-hover:text-primary transition-colors" />
                            </div>
                            <h3 className="text-white font-bold text-sm mb-1">Уведомления</h3>
                            <p className="text-white/40 text-[10px] sm:text-xs leading-relaxed">Email и Telegram оповещения.</p>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="glass-card p-6 sm:p-8 rounded-[24px] hover:border-primary/20 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                            <Shield className="size-24" />
                        </div>
                        <div className="relative z-10">
                            <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center mb-4 sm:mb-6 border border-white/5 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                                <Shield className="size-5 text-white/60 group-hover:text-primary transition-colors" />
                            </div>
                            <h3 className="text-white font-bold text-sm mb-1">Безопасность</h3>
                            <p className="text-white/40 text-[10px] sm:text-xs leading-relaxed">Двухфакторная аутентификация и сессии.</p>
                        </div>
                    </div>

                    {/* Log Out - Full Width on Mobile, Standard on Desktop */}
                    <div className="glass-card p-6 sm:p-8 rounded-[24px] hover:border-red-500/20 hover:bg-red-500/5 transition-all group cursor-pointer relative overflow-hidden sm:col-span-2 lg:col-span-1 border-white/5">
                        <div className="relative z-10 flex items-center gap-4 h-full">
                            <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 group-hover:bg-red-500/10 group-hover:border-red-500/20 transition-colors shrink-0">
                                <LogOut className="size-5 text-white/60 group-hover:text-red-500 transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-white group-hover:text-red-500 font-bold text-sm mb-1 transition-colors">Выйти из аккаунта</h3>
                                <p className="text-white/40 text-[10px] sm:text-xs leading-relaxed">Завершить текущую сессию.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Aether Monitor v0.1.0 • Beta</p>
                </div>
            </div>
        </div>
    );
}
