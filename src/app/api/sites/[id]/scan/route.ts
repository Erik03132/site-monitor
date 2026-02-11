import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { performSiteScan } from '@/lib/monitor/scanner'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Check if user has access to this site
    const { data: site, error: siteError } = await supabase
        .from('sites')
        .select('*')
        .eq('id', id)
        .single()

    if (siteError || !site) {
        return NextResponse.json({ error: 'Site not found or access denied' }, { status: 404 })
    }

    // 2. Perform the scan
    console.log(`Manual scan requested for site: ${site.url}`)
    const result = await performSiteScan(supabase, site.id, site.url, site.name, site.user_id)

    if (!result.success) {
        return NextResponse.json({
            error: result.error || result.message,
            success: false
        }, { status: 500 })
    }

    return NextResponse.json({
        success: true,
        message: result.message,
        changesFound: result.changesFound,
        chunksCount: result.chunksCount
    })
}
