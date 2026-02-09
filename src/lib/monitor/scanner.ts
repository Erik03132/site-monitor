import { SupabaseClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'
import { getAIProvider } from '@/lib/ai/service'
import { sendNotificationEmail } from '@/lib/notifications/email'

export interface ScanResult {
    success: boolean
    message: string
    changesFound: boolean
    pageId?: string
    chunksCount: number
    error?: string
}

export async function performSiteScan(
    supabase: SupabaseClient,
    siteId: string,
    siteUrl: string,
    siteName?: string | null,
    userId?: string
): Promise<ScanResult> {
    try {
        // Step 1: Fetch the page content
        const fetchResult = await fetchPageContent(siteUrl)
        if (!fetchResult.success) {
            return { success: false, message: 'Fetch failed', changesFound: false, chunksCount: 0, error: fetchResult.error }
        }

        // Step 2: Check if content has changed (compare hash)
        const { data: existingPage } = await supabase
            .from('pages')
            .select('id, content_hash')
            .eq('site_id', siteId)
            .eq('url', siteUrl)
            .order('fetched_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (existingPage && existingPage.content_hash === fetchResult.hash) {
            await supabase
                .from('sites')
                .update({ last_scanned_at: new Date().toISOString() })
                .eq('id', siteId)

            return { success: true, message: 'No changes detected', changesFound: false, chunksCount: 0 }
        }

        // Step 3: Parse and extract main content
        if (!fetchResult.html) {
            return { success: false, message: 'Empty response', changesFound: false, chunksCount: 0, error: 'No HTML content' }
        }
        const parsedContent = await parseHtmlContent(fetchResult.html)

        // Step 4: Create chunks
        const chunks = createChunks(parsedContent, 300, 50)

        // Step 5: Store page and chunks
        const pageData = {
            site_id: siteId,
            url: siteUrl,
            title: parsedContent.title,
            content_hash: fetchResult.hash,
            status: 'success' as const,
            fetched_at: new Date().toISOString()
        }

        let pageId: string
        let changes: Array<{
            chunk_id: string | null
            type: 'added' | 'removed' | 'modified'
            old_content: string | null
            new_content: string | null
        }> = []

        if (existingPage) {
            // Create a NEW page entry for history, or update if you want only the latest
            // The schema seems to support multiple pages per site.
            // But performSiteScan in site-monitor was updating existingPage.
            // Let's create a NEW page entry to keep history.
            const { data: newPage, error: pageError } = await supabase
                .from('pages')
                .insert(pageData)
                .select('id')
                .single()

            if (pageError) throw pageError
            pageId = newPage.id

            // Compare with old chunks
            const { data: oldChunks } = await supabase
                .from('chunks')
                .select('*')
                .eq('page_id', existingPage.id)
                .order('position')

            changes = detectChunkChanges(oldChunks || [], chunks)

            const ai = getAIProvider()
            for (const change of changes) {
                const summary = await ai.summarizeChange(change.old_content, change.new_content)

                await supabase.from('chunk_changes').insert({
                    page_id: pageId,
                    change_type: change.type,
                    old_content: change.old_content,
                    new_content: change.new_content,
                    summary: summary,
                    detected_at: new Date().toISOString()
                })
            }
        } else {
            const { data: newPage, error: pageError } = await supabase
                .from('pages')
                .insert(pageData)
                .select('id')
                .single()

            if (pageError) throw pageError
            pageId = newPage.id
        }

        if (chunks.length > 0) {
            await supabase.from('chunks').insert(
                chunks.map((chunk, index) => ({
                    page_id: pageId,
                    version: 1,
                    position: index,
                    block_type: chunk.type,
                    content: chunk.text,
                    token_count: chunk.tokenCount
                }))
            )
        }

        // Step 6: Check for Keywords
        const { data: keywords } = await supabase
            .from('keywords')
            .select('keyword')
            .eq('user_id', userId)
            .eq('is_active', true)

        const foundKeywords: string[] = []
        if (keywords && keywords.length > 0) {
            const allText = chunks.map(c => c.text).join(' ').toLowerCase()
            for (const { keyword } of keywords) {
                if (allText.includes(keyword.toLowerCase())) {
                    foundKeywords.push(keyword)
                }
            }
        }

        // Step 7: Send Notification
        if ((changes.length > 0 || foundKeywords.length > 0) && userId) {
            const { data: settings } = await supabase
                .from('notification_settings')
                .select('email_enabled, email_address')
                .eq('user_id', userId)
                .maybeSingle()

            if (settings?.email_enabled) {
                const emailTo = settings.email_address
                if (emailTo) {
                    const firstSummary = changes.length > 0
                        ? (await getAIProvider().summarizeChange(changes[0].old_content, changes[0].new_content))
                        : undefined

                    await sendNotificationEmail({
                        to: emailTo,
                        siteName: siteName || siteUrl,
                        siteUrl: siteUrl,
                        changesCount: changes.length,
                        foundKeywords,
                        summary: firstSummary
                    })
                }
            }
        }

        // Update site's last_scanned_at
        await supabase
            .from('sites')
            .update({ last_scanned_at: new Date().toISOString() })
            .eq('id', siteId)

        return {
            success: true,
            message: 'Scan completed',
            changesFound: changes.length > 0,
            pageId,
            chunksCount: chunks.length
        }

    } catch (error) {
        console.error('Scanner error:', error)
        return { success: false, message: 'Scan failed', changesFound: false, chunksCount: 0, error: String(error) }
    }
}

// Helpers (internal)
async function fetchPageContent(url: string) {
    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 30000)

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html'
            }
        })

        clearTimeout(timeout)
        if (!response.ok) return { success: false, error: `HTTP ${response.status}` }

        const html = await response.text()
        const hash = await generateHash(html)
        return { success: true, html, hash }
    } catch (error) {
        return { success: false, error: String(error) }
    }
}

async function generateHash(content: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function parseHtmlContent(html: string) {
    const $ = cheerio.load(html)
    const title = $('title').text().trim() || 'Untitled'
    $('script, style, nav, footer, header, aside, .ads, #sidebar').remove()

    const blocks: Array<{ type: string; text: string }> = []
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
        const text = $(el).text().trim()
        if (text) blocks.push({ type: (el as { tagName: string }).tagName.toLowerCase(), text })
    })
    $('p').each((_, el) => {
        const text = $(el).text().trim()
        if (text.length > 20) blocks.push({ type: 'paragraph', text })
    })
    $('li').each((_, el) => {
        const text = $(el).text().trim()
        if (text.length > 10) blocks.push({ type: 'list_item', text })
    })

    return { title, blocks }
}

function createChunks(content: { blocks: Array<{ type: string; text: string }> }, targetTokens: number, overlapTokens: number) {
    const chunks: Array<{ type: string; text: string; tokenCount: number }> = []
    const est = (text: string) => Math.ceil(text.length / 4)

    let cur = ''
    let type = 'mixed'

    for (const b of content.blocks) {
        const bt = est(b.text)
        if (est(cur) + bt > targetTokens && cur) {
            chunks.push({ type, text: cur.trim(), tokenCount: est(cur) })
            const words = cur.split(' ')
            cur = words.slice(-Math.ceil(overlapTokens / 1.5)).join(' ') + ' ' + b.text
            type = b.type
        } else {
            cur += (cur ? ' ' : '') + b.text
            if (!cur.includes(' ')) type = b.type
        }
    }
    if (cur.trim()) chunks.push({ type, text: cur.trim(), tokenCount: est(cur) })
    return chunks
}

interface ChunkBase {
    type: string
    text: string
}

interface OldChunk {
    id: string
    content: string
    position: number
}

function detectChunkChanges(oldChunks: OldChunk[], newChunks: ChunkBase[]) {
    const changes: Array<{
        chunk_id: string | null
        type: 'added' | 'removed' | 'modified'
        old_content: string | null
        new_content: string | null
    }> = []
    const oldTexts = new Set(oldChunks.map(c => c.content))
    const newTexts = new Set(newChunks.map(c => c.text))

    for (const o of oldChunks) {
        if (!newTexts.has(o.content)) {
            const sim = newChunks.find(n => calculateSimilarity(o.content, n.text) > 0.6)
            if (sim) changes.push({ chunk_id: o.id, type: 'modified', old_content: o.content, new_content: sim.text })
            else changes.push({ chunk_id: o.id, type: 'removed', old_content: o.content, new_content: null })
        }
    }
    for (const n of newChunks) {
        if (!oldTexts.has(n.text)) {
            if (!oldChunks.find(o => calculateSimilarity(o.content, n.text) > 0.6)) {
                changes.push({ chunk_id: null, type: 'added', old_content: null, new_content: n.text })
            }
        }
    }
    return changes
}

function calculateSimilarity(t1: string, t2: string) {
    const w1 = new Set(t1.toLowerCase().split(/\s+/)), w2 = new Set(t2.toLowerCase().split(/\s+/))
    const inter = new Set([...w1].filter(x => w2.has(x)))
    return inter.size / new Set([...w1, ...w2]).size
}
