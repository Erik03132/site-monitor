import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)

        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get pagination params
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const siteId = searchParams.get('site_id')
        const changeType = searchParams.get('change_type')

        const offset = (page - 1) * limit

        // Build query for changes with site info
        let query = supabase
            .from('chunk_changes')
            .select(`
                *,
                pages!inner(
                    url,
                    title,
                    sites!inner(
                        id,
                        name,
                        user_id
                    )
                )
            `, { count: 'exact' })
            .eq('pages.sites.user_id', user.id)
            .order('detected_at', { ascending: false })
            .range(offset, offset + limit - 1)

        // Apply filters
        if (siteId) {
            query = query.eq('pages.site_id', siteId)
        }

        if (changeType) {
            query = query.eq('change_type', changeType)
        }

        const { data: changes, error, count } = await query

        if (error) {
            console.error('Changes query error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            changes,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        })
    } catch (error) {
        console.error('Changes API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
