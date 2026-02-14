import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, Zap, Clock, Shield } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen obsidian-gradient text-white selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-obsidian/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 sm:size-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,138,0,0.15)]">
              <span className="material-symbols-outlined text-primary text-xl sm:text-2xl">monitoring</span>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight">Aether Monitor</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/login" className="text-xs sm:text-sm font-medium text-white/50 hover:text-white transition-colors">
              Вход
            </Link>
            <Link
              href="/register"
              className="bg-white text-obsidian px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold hover:bg-gray-200 transition-all active:scale-95"
            >
              <span className="hidden sm:inline">Начать бесплатно</span>
              <span className="sm:hidden">Начать</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 sm:pt-44 pb-20 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-6 sm:mb-8">
            <Zap className="size-3 sm:size-3.5 fill-primary" />
            Технология на базе ИИ
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter mb-6 sm:mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent leading-[1.1]">
            Следите за вебом <br className="hidden sm:block" /> в реальном времени.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed px-2">
            Автоматически отслеживайте изменения на любых сайтах. Получайте резюме от ИИ и мгновенные уведомления, когда контент обновляется.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-primary hover:bg-primary/80 text-obsidian px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_30px_rgba(255,138,0,0.3)] active:scale-[0.98]"
            >
              Начать мониторинг
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/10 font-bold text-lg hover:bg-white/5 transition-all text-white/70"
            >
              Смотреть демо
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto mt-24 sm:mt-40 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/[0.05] hover:border-primary/30 transition-all group text-center sm:text-left">
            <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-white">Умные проверки</h3>
            <p className="text-sm sm:text-base text-white/40 leading-relaxed">
              Настройте интервалы сканирования от 15 минут до раза в день. Мы сделаем всю грязную работу за вас.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/[0.05] hover:border-primary/30 transition-all group border-primary/30 text-center sm:text-left">
            <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,138,0,0.2)]">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-white">Анализ Kimi AI</h3>
            <p className="text-sm sm:text-base text-white/40 leading-relaxed">
              Не просто узнавайте об изменениях. Наш ИИ (Kimi) подготовит краткое резюме того, что именно изменилось на странице.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/[0.05] hover:border-primary/30 transition-all group text-center sm:text-left">
            <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-white">Мгновенные алерты</h3>
            <p className="text-sm sm:text-base text-white/40 leading-relaxed">
              Получайте уведомления на Email в ту же секунду, когда обнаружены изменения. Следите за ценами и новостями 24/7.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2.5 opacity-50">
            <div className="size-6 bg-white rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-obsidian text-xs font-bold">monitoring</span>
            </div>
            <span className="font-bold tracking-tight text-white shrink-0">Aether Monitor</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 text-xs sm:text-sm text-white/30 font-medium">
            <button className="hover:text-white transition-colors">Конфиденциальность</button>
            <button className="hover:text-white transition-colors">Условия</button>
            <button className="hover:text-white transition-colors">Контакты</button>
          </div>
          <p className="text-[10px] sm:text-sm text-white/20 whitespace-nowrap text-center">© 2024 Aether Monitor. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
}
