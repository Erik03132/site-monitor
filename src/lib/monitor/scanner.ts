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
        const allText = parsedContent.blocks.map(b => b.text).join(' ')

        // Step 4: Check for Keywords (Now doing this BEFORE hash-skip, so you get alerts for existing content)
        const { data: keywordRecords } = await supabase
            .from('keywords')
            .select('keyword')
            .eq('user_id', userId)
            .eq('is_active', true)

        const foundKeywords: string[] = []
        if (keywordRecords && keywordRecords.length > 0) {
            console.log(`[Keywords] Checking for: ${keywordRecords.map(k => k.keyword).join(', ')}`)
            const lowerText = allText.toLowerCase()
            for (const { keyword } of keywordRecords) {
                if (lowerText.includes(keyword.toLowerCase())) {
                    console.log(`[Keywords] FOUND: "${keyword}"`)
                    foundKeywords.push(keyword)
                }
            }
        }

        // Step 5: Check if hash is unchanged (Skip diffing only, not keywords!)
        if (existingPage && existingPage.content_hash === fetchResult.hash) {
            console.log(`[Scanner] Content hash unchanged. Skipping diff. Found ${foundKeywords.length} keywords.`)

            // If keywords found, we still want to update last_scanned
            await supabase
                .from('sites')
                .update({ last_scanned_at: new Date().toISOString() })
                .eq('id', siteId)

            // If we found keywords, send notification even if content hash is same
            if (foundKeywords.length > 0 && userId) {
                await checkAndSendNotifications(supabase, userId, siteUrl, siteName, [], foundKeywords)
            }

            return { success: true, message: 'Hash identical, but keyword check done', changesFound: false, chunksCount: 0 }
        }

        // Step 6: Create chunks & Store
        const chunks = createChunks(parsedContent, 300, 50)
        const pageData = {
            site_id: siteId,
            url: siteUrl,
            title: parsedContent.title,
            content_hash: fetchResult.hash,
            status: 'success' as const,
            fetched_at: new Date().toISOString()
        }

        let changes: Array<{
            chunk_id: string | null
            type: 'added' | 'removed' | 'modified'
            old_content: string | null
            new_content: string | null
        }> = []

        const { data: newPage, error: pageError } = await supabase
            .from('pages')
            .insert(pageData)
            .select('id')
            .single()

        if (pageError) throw pageError
        // eslint-disable-next-line prefer-const
        let pageId = newPage.id

        if (existingPage) {
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

        // Final step: Notifications for changes and keywords
        if (userId) {
            await checkAndSendNotifications(supabase, userId, siteUrl, siteName, changes, foundKeywords)
        }

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

async function checkAndSendNotifications(
    supabase: SupabaseClient,
    userId: string,
    siteUrl: string,
    siteName: string | null | undefined,
    changes: Array<{ old_content: string | null; new_content: string | null }>,
    foundKeywords: string[]
) {
    if (changes.length === 0 && foundKeywords.length === 0) return

    const { data: settings } = await supabase
        .from('notification_settings')
        .select('email_enabled, email_address')
        .eq('user_id', userId)
        .maybeSingle()

    if (settings?.email_enabled && settings.email_address) {
        let summary: string | undefined
        if (changes.length > 0) {
            const ai = getAIProvider()
            summary = await ai.summarizeChange(changes[0].old_content, changes[0].new_content)
        }

        await sendNotificationEmail({
            to: settings.email_address,
            siteName: siteName || siteUrl,
            siteUrl: siteUrl,
            changesCount: changes.length,
            foundKeywords,
            summary
        })
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

    // 1. Очищаем мусор еще агрессивнее
    $('script, style, nav, footer, header, aside, .ads, #sidebar, iframe, noscript, svg').remove()

    const blocks: Array<{ type: string; text: string }> = []

    // 2. Ищем текст везде, где он может быть осмысленным
    // На новостных сайтах (RBC) заголовки могут быть в span или a
    $('h1, h2, h3, h4, h5, h6, p, li, span, a').each((_, el) => {
        const $el = $(el)
        const text = $el.text().trim()

        // Условия для "хорошего" блока:
        // - Текст длиннее 10 символов
        // - Внутри нет кучи других тегов (чтобы не брать весь div целиком)
        if (text.length > 10 && $el.children().length < 5) {
            const tagName = (el as unknown as { tagName: string }).tagName.toLowerCase()
            blocks.push({
                type: tagName === 'a' || tagName === 'span' ? 'text_block' : tagName,
                text
            })
        }
    })

    console.log(`[Parser] Extracted ${blocks.length} content blocks from "${title}"`)
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
