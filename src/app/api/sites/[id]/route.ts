import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { UpdateSiteRequest } from '@/types/database'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: site, error } = await supabase
            .from('sites')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (error || !site) {
            return NextResponse.json({ error: 'Site not found' }, { status: 404 })
        }

        return NextResponse.json({ site })
    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body: UpdateSiteRequest = await request.json()

        const { data: site, error } = await supabase
            .from('sites')
            .update({
                ...(body.name !== undefined && { name: body.name }),
                ...(body.scan_interval_minutes !== undefined && { scan_interval_minutes: body.scan_interval_minutes }),
                ...(body.is_active !== undefined && { is_active: body.is_active }),
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error || !site) {
            return NextResponse.json({ error: 'Site not found' }, { status: 404 })
        }

        return NextResponse.json({ site })
    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { error } = await supabase
            .from('sites')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
