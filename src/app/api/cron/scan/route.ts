
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    // Проверка секретного ключа крона (безопасность Vercel)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const supabase = await createClient()
        const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

        // 1. Сканируем все активные сайты
        const { data: sites } = await supabase.from('sites').select('id').eq('is_active', true)
        if (sites) {
            for (const site of sites) {
                // Вызываем API сканирования для каждого сайта
                await fetch(`${APP_URL}/api/sites/${site.id}/scan`, { method: 'POST' }).catch(e => console.error(e))
            }
        }

        // 2. Запускаем глобальный скан ключевых слов (Раз в сутки в 9:00 по логике крона Vercel)
        await fetch(`${APP_URL}/api/keywords/scan`, { method: 'POST' }).catch(e => console.error(e))

        return NextResponse.json({ 
            success: true, 
            message: `Ежедневный скан (09:00) выполнен для ${sites?.length || 0} ресурсов.` 
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
