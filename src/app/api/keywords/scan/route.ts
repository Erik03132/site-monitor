
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: keywords, error: kwError } = await supabase
            .from('keywords')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)

        if (kwError || !keywords || keywords.length === 0) {
            return NextResponse.json({ message: 'Нет активных ключевых слов для сканирования' })
        }

        const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY?.replace('your_', ''); // Cleanup if needed

        const results = []
        
        for (const kw of keywords) {
            // Реальный вызов Perplexity Sonar API
            const response = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'sonar-pro',
                    messages: [
                        { role: 'system', content: 'You are an OSINT monitoring assistant. Find the latest news and mentions of the keyword. Return result as JSON: [{source_url, source_title, summary}]. Summary must be in Russian.' },
                        { role: 'user', content: `Find latest mentions of: ${kw.keyword}` }
                    ],
                    response_format: { type: 'json_object' }
                })
            })

            if (response.ok) {
                const data = await response.json();
                // Парсим контент (Perplexity может вернуть JSON строку в content)
                let mentions = [];
                try {
                    const parsed = JSON.parse(data.choices[0].message.content);
                    mentions = Array.isArray(parsed) ? parsed : (parsed.mentions || []);
                } catch (e) {
                    // Fallback если ИИ не вернул чистый JSON
                    console.error("JSON parse error for keyword", kw.keyword, e);
                }

                // Сохраняем в базу (таблица keyword_mentions)
                for (const m of mentions) {
                    await supabase.from('keyword_mentions').insert({
                        keyword_id: kw.id,
                        source_url: m.source_url,
                        source_title: m.source_title,
                        summary: m.summary
                    });
                }
                
                results.push({ keyword: kw.keyword, found: mentions.length });
            }

            await supabase
                .from('keywords')
                .update({ last_global_scan: new Date().toISOString() })
                .eq('id', kw.id)
        }

        return NextResponse.json({ 
            message: `Глобальный скан завершен. Обработано слов: ${keywords.length}`,
            results 
        })
    } catch (error) {
        console.error('Scan error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
