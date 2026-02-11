import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { performSiteScan } from '@/lib/monitor/scanner'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the site metadata
    const { data: site, error: siteError } = await supabase
        .from('sites')
        .select('url, name')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (siteError || !site) {
        return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // Perform scan
    const result = await performSiteScan(supabase, id, site.url, site.name, user.id)

    if (!result.success) {
        return NextResponse.json(
            { error: result.message, details: result.error },
            { status: 500 }
        )
    }

    return NextResponse.json({
        message: result.message,
        site_id: id,
        page_id: result.pageId,
        chunks_count: result.chunksCount,
        changes_found: result.changesFound,
        scanned_at: new Date().toISOString()
    })
}
