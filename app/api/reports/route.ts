import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = supabase.from('time_entries').select(`
      *,
      clients(name),
      matters(title)
    `)

    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data: timeEntries, error } = await query.order('date', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const reportData = {
      totalHours: timeEntries?.reduce((sum, entry) => sum + (entry.hours || 0), 0) || 0,
      totalRevenue: timeEntries?.reduce((sum, entry) => sum + ((entry.hours || 0) * (entry.hourly_rate || 150)), 0) || 0,
      billedHours: timeEntries?.filter(entry => entry.billed).reduce((sum, entry) => sum + (entry.hours || 0), 0) || 0,
      unbilledHours: timeEntries?.filter(entry => !entry.billed).reduce((sum, entry) => sum + (entry.hours || 0), 0) || 0,
      entries: timeEntries || []
    }

    return NextResponse.json(reportData)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
