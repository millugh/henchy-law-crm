import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { threeCxService } from '@/lib/3cx-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: config } = await supabase
      .from('threecx_config')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!config) {
      return NextResponse.json({ error: '3CX not configured' }, { status: 400 })
    }

    const body = await request.json()
    const { calleeNumber, extension } = body

    if (!calleeNumber) {
      return NextResponse.json({ error: 'Callee number is required' }, { status: 400 })
    }

    threeCxService.setConfig(config)

    const result = await threeCxService.originateCall({
      callerNumber: extension || config.default_extension || '',
      calleeNumber,
      extension: extension || config.default_extension || '',
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    const matchedClient = await threeCxService.matchCallerToClient(calleeNumber, supabase)

    const { data: phoneCall, error } = await supabase
      .from('phone_calls')
      .insert([{
        user_id: user.id,
        client_id: matchedClient?.id || null,
        direction: 'outbound',
        caller_number: extension || config.default_extension || '',
        callee_number: calleeNumber,
        start_time: new Date().toISOString(),
        status: 'ringing',
        call_id_3cx: result.callId,
      }])
      .select(`
        *,
        clients (
          id,
          name
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      phoneCall,
      callId: result.callId 
    })
  } catch (error) {
    console.error('3CX originate call error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
