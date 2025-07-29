import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const matterType = searchParams.get('type')

    let query = supabase
      .from('matters')
      .select(`
        *,
        clients (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (matterType) {
      query = query.eq('matter_type', matterType)
    }

    const { data: matters, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ matters })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const matterData = {
      title: body.name,
      description: body.description,
      status: body.status?.toLowerCase() || 'open',
      matter_type: 'Real Estate',
      matter_subtype: body.matterType || 'Real Estate',
      property_address: body.propertyAddress,
      client_id: body.clientId,
      user_id: user.id
    }
    
    const { data: matter, error } = await supabase
      .from('matters')
      .insert([matterData])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ matter })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
