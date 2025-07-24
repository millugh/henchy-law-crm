import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const { data: meetings, error } = await supabase
      .from('calendar_events')
      .select(`
        *,
        clients (
          id,
          name
        )
      `)
      .gte('start_time', startOfDay.toISOString())
      .lt('start_time', endOfDay.toISOString())
      .eq('user_id', user.id)
      .order('start_time', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formattedMeetings = meetings?.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      time: new Date(meeting.start_time).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      attendees: meeting.attendees || [],
      client: meeting.clients?.name || 'No client'
    })) || []

    return NextResponse.json({ meetings: formattedMeetings })
  } catch (err) {
    console.error('Get today meetings error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
