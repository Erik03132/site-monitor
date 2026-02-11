import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url')
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
            }
        })

        if (!response.ok) {
            return NextResponse.json({
                error: `Failed to fetch: ${response.status} ${response.statusText}`,
                status: response.status
            })
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        // Повторяем логику из scanner.ts для проверки
        const title = $('title').text().trim() || 'Untitled'

        // Очищаем мусор
        $('script, style, nav, footer, header, aside, .ads, #sidebar, iframe, noscript').remove()

        const extractedText: string[] = []

        // Собираем ВСЕ элементы, содержащие текст, а не только p и h
        $('div, p, span, h1, h2, h3, h4, h5, h6, li, a').each((_, el) => {
            const text = $(el).text().trim()
            // Если текст длиннее 10 символов и это не глубоко вложенный элемент (чтобы не дублировать)
            if (text.length > 5 && $(el).children().length < 3) {
                extractedText.push(text)
            }
        })

        const keywordsParam = request.nextUrl.searchParams.get('keywords')
        const keywords = keywordsParam ? keywordsParam.split(',').map(k => k.trim()) : []

        const foundKeywords = []
        const fullText = extractedText.join(' ').toLowerCase()

        if (keywords.length > 0) {
            for (const kw of keywords) {
                if (fullText.includes(kw.toLowerCase())) {
                    foundKeywords.push(kw)
                }
            }
        }

        return NextResponse.json({
            url,
            title,
            rawHtmlLength: html.length,
            extractedBlocksCount: extractedText.length,
            keywordsSearched: keywords,
            keywordsFound: foundKeywords,
            preview: extractedText.slice(0, 30),
            fullTextLength: fullText.length
        })

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
