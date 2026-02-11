import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { performSiteScan } from '@/lib/monitor/scanner'
import { searchGlobalKeywords } from '@/lib/search/global'

export async function POST(request: NextRequest) {
    // 1. Auth check
    const supabase = await (await import('@/lib/supabase/server')).createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id


    // 2. Get all active sites for this user
    const { data: sites, error: sitesError } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)

    if (sitesError) {
        return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 })
    }

    if (!sites || sites.length === 0) {
        return NextResponse.json({
            success: true,
            message: 'No active sites to scan',
            results: []
        })
    }

    // 3. Get all active keywords
    const { data: keywords } = await supabase
        .from('keywords')
        .select('keyword')
        .eq('user_id', userId)
        .eq('is_active', true)

    // 4. Perform site scans
    console.log(`Manual bulk scan for user ${userId} requested for ${sites.length} sites`)

    const scanResults = []
    for (const site of sites) {
        try {
            const result = await performSiteScan(supabase, site.id, site.url, site.name, userId)
            scanResults.push({
                site: site.url,
                success: result.success,
                changes: result.changesFound
            })
        } catch (err) {
            scanResults.push({
                site: site.url,
                success: false,
                error: String(err)
            })
        }
    }

    // 5. GLOBAL SEARCH - Now independent of sites
    let globalMentions: any[] = []
    if (keywords && keywords.length > 0) {
        const kwList = keywords.map((k: any) => k.keyword)
        console.log(`[Global Search] Starting for keywords: ${kwList.join(', ')}`)
        const searchResults = await searchGlobalKeywords(kwList)

        if (searchResults.length > 0) {
            // Save to DB
            const mentionsToInsert = searchResults.map(res => ({
                user_id: userId,
                keyword: kwList[0] || 'general', // Simplified, could be improved to match specific keyword
                title: res.title,
                url: res.url,
                snippet: res.snippet,
                source: res.source,
                detected_at: new Date().toISOString()
            }))

            const { data: inserted, error: insertError } = await supabase
                .from('global_mentions')
                .insert(mentionsToInsert)
                .select()

            if (insertError) {
                console.error('[Global Search] Failed to save mentions:', insertError)
            } else {
                globalMentions = inserted || []
                console.log(`[Global Search] Saved ${globalMentions.length} mentions online`)
            }
        }
    }

    return NextResponse.json({
        success: true,
        message: `Scan finished: ${sites.length} sites checked, global search done.`,
        siteResults: scanResults,
        globalMentions: globalMentions
    })
}

