import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Zap, Filter, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ChangeFeedItem {
    id: string
    change_type: string
    old_content: string | null
    new_content: string | null
    summary: string | null
    detected_at: string
    pages: {
        url: string
        title: string
        sites: {
            id: string
            name: string | null
        }
    }
}

export default async function ChangesPage() {
    const supabase = await createClient()

    const { data: rawChanges } = await supabase
        .from('chunk_changes')
        .select(`
      id,
      change_type,
      old_content,
      new_content,
      summary,
      detected_at,
      pages!inner(
        url,
        title,
        sites!inner(
          id,
          name
        )
      )
    `)
        .order('detected_at', { ascending: false })
        .limit(50)

    const changes = rawChanges as unknown as ChangeFeedItem[]

    return (
        <div className="p-8 max-w-7xl mx-auto text-white font-sans">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">История изменений</h1>
                    <p className="text-gray-400 mt-1 font-medium">Все зафиксированные обновления на ваших сайтах</p>
                </div>
                <button className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all font-bold text-sm">
                    <Filter className="w-4 h-4 text-gray-400" />
                    Фильтр
                </button>
            </div>

            {changes && changes.length > 0 ? (
                <div className="space-y-6">
                    {changes.map((change) => (
                        <div
                            key={change.id}
                            className="bg-white/[0.02] backdrop-blur-xl rounded-[32px] border border-white/[0.06] p-8 hover:bg-white/[0.04] transition-all group relative overflow-hidden"
                        >
                            <div className="flex items-start gap-6 relative z-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${change.change_type === 'added' ? 'bg-green-500/10 border border-green-500/20 text-green-500' :
                                    change.change_type === 'removed' ? 'bg-red-500/10 border border-red-500/20 text-red-500' :
                                        'bg-yellow-500/10 border border-yellow-500/20 text-yellow-500'
                                    }`}>
                                    <Zap className="w-7 h-7" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <h3 className="text-lg font-black tracking-tight uppercase group-hover:text-blue-400 transition-colors">
                                            {change.pages?.sites?.name || 'Без названия'}
                                        </h3>
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${change.change_type === 'added' ? 'bg-green-500/10 text-green-500' :
                                            change.change_type === 'removed' ? 'bg-red-500/10 text-red-500' :
                                                'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                            {change.change_type === 'added' ? 'Добавлено' : change.change_type === 'removed' ? 'Удалено' : 'Изменено'}
                                        </span>
                                        <span className="text-gray-500 text-xs font-bold uppercase tracking-tighter ml-auto">
                                            {formatDate(change.detected_at)}
                                        </span>
                                    </div>

                                    {change.summary && (
                                        <div className="bg-white/5 rounded-2xl p-5 mb-6 border border-white/5 relative">
                                            <div className="absolute top-4 left-4 w-1 h-2/3 bg-blue-500 rounded-full" />
                                            <p className="text-white text-sm leading-relaxed font-medium pl-4 italic">&quot;{change.summary}&quot;</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:row gap-6">
                                        {change.change_type === 'modified' && (
                                            <>
                                                <div className="bg-red-500/[0.03] border border-red-500/10 rounded-2xl p-6">
                                                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-3">Старая версия</p>
                                                    <p className="text-gray-400 text-sm line-clamp-4 font-medium leading-relaxed">{change.old_content}</p>
                                                </div>
                                                <div className="bg-green-500/[0.03] border border-green-500/10 rounded-2xl p-6">
                                                    <p className="text-green-500 text-[10px] font-black uppercase tracking-widest mb-3">Новая версия</p>
                                                    <p className="text-gray-200 text-sm line-clamp-4 font-medium leading-relaxed">{change.new_content}</p>
                                                </div>
                                            </>
                                        )}

                                        {change.change_type === 'added' && change.new_content && (
                                            <div className="bg-green-500/[0.03] border border-green-500/10 rounded-2xl p-6">
                                                <p className="text-green-500 text-[10px] font-black uppercase tracking-widest mb-3">Новый контент</p>
                                                <p className="text-gray-200 text-sm font-medium leading-relaxed">{change.new_content}</p>
                                            </div>
                                        )}

                                        {change.change_type === 'removed' && change.old_content && (
                                            <div className="bg-red-500/[0.03] border border-red-500/10 rounded-2xl p-6 opacity-60">
                                                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-3">Удалено</p>
                                                <p className="text-gray-400 text-sm font-medium leading-relaxed">{change.old_content}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <Link
                                            href={`/dashboard/sites/${change.pages?.sites?.id}`}
                                            className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white flex items-center gap-2 transition-colors"
                                        >
                                            История сайта <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative glow */}
                            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/[0.02] rounded-[40px] border border-white/[0.05] p-24 text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Zap className="w-10 h-10 text-gray-700" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Изменений пока нет</h3>
                    <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">Мы сообщим вам, как только контент на ваших сайтах обновится.</p>
                </div>
            )}
        </div>
    )
}
