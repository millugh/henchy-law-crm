import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      { count: activeMatters },
      { data: timeEntries },
      { count: newClients }
    ] = await Promise.all([
      supabase
        .from('matters')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open'),
      supabase
        .from('time_entries')
        .select('hours')
        .eq('billed', false),
      supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ])

    const totalBillableHours = timeEntries?.reduce((sum, entry) => sum + (entry.hours || 0), 0) || 0
    const unbilledRevenue = timeEntries?.reduce((sum, entry) => sum + ((entry.hours || 0) * 150), 0) || 0

    return NextResponse.json({
      activeMatters: activeMatters || 0,
      billableHours: totalBillableHours,
      unbilledRevenue,
      newClients: newClients || 0
    })
  } catch (err) {
    console.error('Dashboard stats error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
