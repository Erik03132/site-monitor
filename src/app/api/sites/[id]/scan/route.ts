
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import crypto from 'crypto'
import { sendChangeEmail } from '@/lib/notifications'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: siteId } = params

  try {
    const supabase = await createClient()
    
    // 1. Получаем инфо о сайте
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .single()

    if (siteError || !site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // 2. Fetching
    const res = await fetch(site.url, { next: { revalidate: 0 } })
    const html = await res.text()
    const contentHash = crypto.createHash('md5').update(html).digest('hex')

    // Если хеш совпадает - ничего не делаем
    if (site.last_hash === contentHash) {
      return NextResponse.json({ message: 'No changes detected (hash match)', status: 'skipped' })
    }

    // 3. Parsing (Phase 2 Goal)
    const $ = cheerio.load(html)
    $('script, style, nav, footer, aside').remove() // Очистка
    const title = $('title').text()
    const cleanContent = $('body').text().replace(/\s\s+/g, ' ').trim()

    // 4. Chunking (Простая реализация для MVP)
    const chunks = cleanContent.match(/.{1,1000}/g) || [] // Чанки по 1000 символов

    // 5. Сохранение страницы и поиск изменений
    const { data: pageRecord, error: pageError } = await supabase
      .from('pages')
      .insert({
        site_id: siteId,
        url: site.url,
        title: title,
        content_hash: contentHash,
        status: 'success'
      })
      .select()
      .single()

    if (pageError) throw pageError

    // 6. Сравнение и запись изменений (Diff) - Упрощенно: считаем всё новое как "added" если первый раз, или ищем разницу
    // Для MVP просто зафиксируем факт изменения страницы
    await supabase.from('chunk_changes').insert({
      page_id: pageRecord.id,
      change_type: 'modified',
      new_content: cleanContent.substring(0, 500),
      summary: 'Обнаружены изменения на главной странице. Идет анализ...'
    })

    // 7. LLM Summary (Mooonshot/Perplexity)
    const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY
    if (MOONSHOT_API_KEY) {
        // Вызов ИИ для саммари (фоново в реальности)
        const summaryResponse = await fetch('https://api.moonshot.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MOONSHOT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'moonshot-v1-8k',
                messages: [
                    { role: 'system', content: 'Ты аналитик мониторинга сайтов. Кратко опиши суть текста на русском.' },
                    { role: 'user', content: `Текст страницы: ${cleanContent.substring(0, 2000)}` }
                ]
            })
        })
        const summaryData = await summaryResponse.json()
        const aiSummary = summaryData.choices[0].message.content

        await supabase
            .from('chunk_changes')
            .update({ summary: aiSummary })
            .eq('page_id', pageRecord.id)

        // 8. Отправка уведомления
        if (user.email) {
            await sendChangeEmail(user.email, site.name || site.url, aiSummary)
        }
    }

    // Обновляем сайт
    await supabase.from('sites').update({
      last_hash: contentHash,
      last_scanned_at: new Date().toISOString()
    }).eq('id', siteId)

    return NextResponse.json({ message: 'Scan complete', site: site.url, hasChanges: true })

  } catch (error: any) {
    console.error('Scan error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
