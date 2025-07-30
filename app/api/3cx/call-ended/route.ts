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
    const updateData = threeCxService.processWebhookEvent(event)

    if (!updateData) {
      return NextResponse.json({ error: 'Invalid event data' }, { status: 400 })
    }

    const { data: phoneCall, error } = await supabase
      .from('phone_calls')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('call_id_3cx', event.callId)
      .eq('user_id', config.user_id)
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

    if (config.recording_enabled && event.recordingUrl) {
      const recordingResult = await threeCxService.fetchRecordings(event.callId)
      if (recordingResult.success && recordingResult.recordingUrl) {
        await supabase
          .from('phone_calls')
          .update({ recording_url: recordingResult.recordingUrl })
          .eq('id', phoneCall.id)
      }
    }

    return NextResponse.json({ 
      success: true, 
      phoneCall 
    })
  } catch (error) {
    console.error('3CX call-ended webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
