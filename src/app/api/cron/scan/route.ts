import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { performSiteScan } from '@/lib/monitor/scanner'

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const supabase = await createClient()

    // 1. Get all active sites that need scanning
    const { data: sites, error } = await supabase
        .from('sites')
        .select('*')
        .eq('is_active', true)

    if (error || !sites) {
        return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 })
    }

    const results = []
    const now = new Date()

    for (const site of sites) {
        // Simple interval check: if last_scanned_at + interval < now
        const lastScanned = site.last_scanned_at ? new Date(site.last_scanned_at) : new Date(0)
        const intervalMs = (site.scan_interval_minutes || 60) * 60 * 1000

        if (now.getTime() - lastScanned.getTime() >= intervalMs) {
            console.log(`Scanning site: ${site.url}`)
            const result = await performSiteScan(supabase, site.id, site.url, site.name, site.user_id)
            results.push({ site_id: site.id, success: result.success, changes: result.changesFound })
        }
    }

    return NextResponse.json({
        processed: results.length,
        results
    })
}
