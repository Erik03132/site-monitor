import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { performSiteScan } from '@/lib/monitor/scanner'

export async function POST(request: NextRequest) {
    const supabase = await createClient()

    // 1. Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get all active sites for this user
    const { data: sites, error: sitesError } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', user.id)
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

    // 3. Perform scans
    console.log(`Manual bulk scan for user ${user.id} requested for ${sites.length} sites`)

    const scanResults = []
    for (const site of sites) {
        try {
            const result = await performSiteScan(supabase, site.id, site.url, site.name, user.id)
            scanResults.push({
                site: site.url,
                success: result.success,
                changes: result.changesFound,
                keywordsFound: result.success // Note: performSiteScan returns success if done
            })
        } catch (err) {
            scanResults.push({
                site: site.url,
                success: false,
                error: String(err)
            })
        }
    }

    return NextResponse.json({
        success: true,
        message: `Scan completed for ${sites.length} sites`,
        results: scanResults
    })
}
