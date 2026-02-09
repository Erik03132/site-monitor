'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Globe, Loader2, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const supabase = createClient()

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message === 'Invalid login credentials' ? 'Неверный email или пароль' : error.message)
            setLoading(false)
            return
        }

        router.push('/dashboard')
        router.refresh()
    }

    return (
        <div className="min-h-screen obsidian-gradient flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 border border-primary/20 rounded-3xl mb-6 shadow-[0_0_30px_rgba(255,138,0,0.15)]">
                        <span className="material-symbols-outlined text-4xl text-primary font-bold">monitoring</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">С возвращением</h1>
                    <p className="text-white/40 mt-3 font-medium">Войдите в Aether Monitor.</p>
                </div>

                <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-white/70 mb-2">
                                Email адрес
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-white/30 group-focus-within:text-primary transition-colors" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                    className="w-full pl-11 sm:pl-12 pr-4 py-3.5 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-sm sm:text-base text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-white/70">
                                    Пароль
                                </label>
                                <button type="button" className="text-[10px] sm:text-xs font-medium text-primary hover:text-primary/80">
                                    Забыли пароль?
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-white/30 group-focus-within:text-primary transition-colors" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-11 sm:pl-12 pr-4 py-3.5 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-sm sm:text-base text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3.5 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs sm:text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="amber-button w-full py-3.5 sm:py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="size-4 sm:size-5 animate-spin" />
                                    Вход...
                                </>
                            ) : (
                                'Войти'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-white/40 font-medium">
                        Нет аккаунта?{' '}
                        <Link href="/register" className="text-primary hover:text-primary/80 font-bold transition-colors">
                            Зарегистрироваться
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
