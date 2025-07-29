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
    
    let clientId = null
    
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('name', 'E.P. Breaux Utility Services, LLC')
      .single()
    
    if (existingClient) {
      clientId = existingClient.id
    } else {
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert([{
          name: 'E.P. Breaux Utility Services, LLC',
          email: 'contact@epbreaux.com',
          status: 'active',
          user_id: user.id
        }])
        .select('id')
        .single()
      
      if (createError || !newClient) {
        console.error('Client creation error:', createError)
        return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
      }
      
      clientId = newClient.id
    }

    const matterData = {
      title: body.name,
      description: body.description,
      status: body.status?.toLowerCase() === 'under contract' ? 'pending' : (body.status?.toLowerCase() || 'open'),
      matter_type: 'Real Estate',
      matter_subtype: body.matterType || 'Real Estate',
      property_address: body.propertyAddress,
      client_id: clientId,
      user_id: user.id
    }
    
    const { data: matter, error } = await supabase
      .from('matters')
      .insert([matterData])
      .select()
      .single()

    if (error) {
      console.error('Database error when creating matter:', error)
      console.error('Matter data being inserted:', matterData)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ matter })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
