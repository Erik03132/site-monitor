'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Settings, Bell, Mail, Shield, Loader2, Save, Zap } from 'lucide-react'

export default function SettingsPage() {
    const [emailEnabled, setEmailEnabled] = useState(true)
    const [emailAddress, setEmailAddress] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    const supabase = createClient()

    const fetchSettings = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('notification_settings')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') throw error

            if (data) {
                setEmailEnabled(data.email_enabled)
                setEmailAddress(data.email_address || '')
            } else {
                setEmailAddress(user.email || '')
            }
        } catch (err) {
            console.error('Error fetching settings:', err)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Не авторизован')

            const { error } = await supabase
                .from('notification_settings')
                .upsert({
                    user_id: user.id,
                    email_enabled: emailEnabled,
                    email_address: emailAddress.trim() || null,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
            setMessage({ type: 'success', text: 'Настройки успешно сохранены' })
        } catch (err) {
            const error = err as Error
            setMessage({ type: 'error', text: error.message })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="p-8 max-w-4xl mx-auto text-white">
            <div className="mb-10">
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <Settings className="w-8 h-8 text-gray-500" />
                    Настройки
                </h1>
                <p className="text-gray-400 mt-1 font-medium">Персонализируйте уведомления и безопасность</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Email Notifications */}
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-white/[0.08] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-5 mb-8 relative z-10">
                        <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20 text-blue-500">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Email уведомления</h2>
                            <p className="text-gray-500 text-sm font-medium">Настройте, куда мы будем присылать отчеты</p>
                        </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                            <div>
                                <h3 className="font-bold text-white">Включить уведомления</h3>
                                <p className="text-gray-500 text-xs mt-1 font-medium">Отправлять письма при обнаружении изменений</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEmailEnabled(!emailEnabled)}
                                className={`w-14 h-8 rounded-full transition-all relative ${emailEnabled ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-gray-800'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${emailEnabled ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className={`transition-all duration-300 ${emailEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">
                                Email для доставки
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 transition-colors group-hover:text-blue-500" />
                                <input
                                    type="email"
                                    value={emailAddress}
                                    onChange={(e) => setEmailAddress(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Decorative glow */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] group-hover:bg-blue-600/10 transition-all pointer-events-none" />
                </div>

                {/* Account Security Info (Read-only for now) */}
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-white/[0.08] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-5 mb-8 relative z-10">
                        <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center border border-purple-600/20 text-purple-500">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Безопасность</h2>
                            <p className="text-gray-500 text-sm font-medium">Управление вашим доступом</p>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                            <span className="text-gray-400 font-bold text-sm">Пароль</span>
                            <button type="button" className="text-blue-400 text-sm font-black uppercase tracking-widest hover:text-blue-300">Изменить</button>
                        </div>
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between opacity-50">
                            <span className="text-gray-400 font-bold text-sm">Двухфакторная аутентификация</span>
                            <span className="text-gray-600 text-xs font-black uppercase tracking-widest">Скоро</span>
                        </div>
                    </div>
                </div>

                {message.text && (
                    <div className={`p-5 rounded-2xl font-bold text-sm shadow-xl animate-shake ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}>
                        {message.text}
                    </div>
                )}

                <div className="pt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-[20px] font-black text-white shadow-[0_10px_40px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98]"
                    >
                        {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        Сохранить изменения
                    </button>
                </div>
            </form>

            <div className="mt-20 p-8 rounded-[40px] bg-white/5 border border-white/10 text-center relative overflow-hidden group">
                <div className="relative z-10">
                    <h3 className="text-lg font-black uppercase tracking-widest border-b border-white/10 pb-4 mb-6 inline-block">Ваша подписка</h3>
                    <div className="flex flex-col items-center gap-4">
                        <div className="px-6 py-2 bg-blue-600 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg">Бесплатный план</div>
                        <p className="text-gray-500 text-sm font-medium max-w-xs leading-relaxed">Вам доступно до 3 сайтов и интервал проверки в 15 минут. Хотите больше?</p>
                        <button type="button" className="mt-4 text-blue-500 font-black text-sm hover:text-blue-400 flex items-center gap-2 group-hover:gap-3 transition-all">
                            Перейти на Pro <Zap className="w-4 h-4 fill-blue-500" />
                        </button>
                    </div>
                </div>
                {/* Decorative background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            </div>
        </div>
    )
}
