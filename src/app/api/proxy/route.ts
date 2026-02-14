import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url')
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            redirect: 'follow'
        })

        if (!response.ok) {
            return new Response(`Failed to fetch site: ${response.status} ${response.statusText}`, { status: response.status })
        }

        let html = await response.text()

        // Inject <base> tag to fix relative links, images, and styles
        const origin = new URL(url).origin
        const baseTag = `<base href="${origin}/">`

        // Robust injection into head
        if (/<head/i.test(html)) {
            html = html.replace(/(<head[^>]*>)/i, `$1${baseTag}`)
        } else {
            html = baseTag + html
        }

        // Return the modified HTML
        return new Response(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Content-Security-Policy': "frame-ancestors 'self'",
            }
        })

    } catch (error) {
        return new Response(`Proxy error: ${String(error)}`, { status: 500 })
    }
}
