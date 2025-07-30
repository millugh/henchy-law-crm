import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { ThreeCxService } from '@/lib/3cx-service'

export async function POST(request: NextRequest) {
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
      .eq('is_active', true)
      .single()

    if (error || !config) {
      return NextResponse.json({ error: 'No active 3CX configuration found' }, { status: 404 })
    }

    const threeCxService = new ThreeCxService(config)
    const result = await threeCxService.unregisterWebhooks()

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
