import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { threeCxService, ThreeCxWebhookEvent } from '@/lib/3cx-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const signature = request.headers.get('x-3cx-signature')
    const payload = await request.text()

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const { data: config } = await supabase
      .from('threecx_config')
      .select('*')
      .eq('is_active', true)
      .single()

    if (!config) {
      return NextResponse.json({ error: '3CX not configured' }, { status: 400 })
    }

    threeCxService.setConfig(config)

    if (!threeCxService.validateWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event: ThreeCxWebhookEvent = JSON.parse(payload)
    const voicemailData = threeCxService.processWebhookEvent(event)

    if (!voicemailData) {
      return NextResponse.json({ error: 'Invalid event data' }, { status: 400 })
    }

    const { data: relatedCall } = await supabase
      .from('phone_calls')
      .select('id')
      .eq('call_id_3cx', event.callId)
      .eq('user_id', config.user_id)
      .single()

    const { data: voicemail, error } = await supabase
      .from('voicemails')
      .insert([{
        ...voicemailData,
        call_id: relatedCall?.id || null,
        user_id: config.user_id,
      }])
      .select(`
        *,
        phone_calls (
          id,
          caller_number,
          client_id
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      voicemail 
    })
  } catch (error) {
    console.error('3CX voicemail webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
