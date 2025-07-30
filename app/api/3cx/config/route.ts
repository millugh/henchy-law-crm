import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: config, error } = await supabase
      .from('threecx_config')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ config: config || null })
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
    const { register_webhooks, crm_base_url, ...configData } = body
    
    const { data: config, error } = await supabase
      .from('threecx_config')
      .upsert([{ ...configData, user_id: user.id }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let webhookResult = null
    if (register_webhooks && crm_base_url) {
      const { ThreeCxService } = await import('@/lib/3cx-service')
      const threeCxService = new ThreeCxService(config)
      
      webhookResult = await threeCxService.registerWebhooks(crm_base_url)
    }

    return NextResponse.json({ 
      config,
      webhookRegistration: webhookResult
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
