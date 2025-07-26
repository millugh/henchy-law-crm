import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { handleApiError, AppError } from '@/lib/error-handling'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new AppError('Unauthorized', 'UNAUTHORIZED')
    }

    const reportType = searchParams.get('type')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const clientId = searchParams.get('client_id')
    const matterId = searchParams.get('matter_id')

    let reportData: any = {}

    switch (reportType) {
      case 'time_summary':
        const { data: timeEntries, error: timeError } = await supabase
          .from('time_entries')
          .select(`
            *,
            matters!inner(name, client_id),
            clients!inner(name)
          `)
          .gte('date', startDate || '2024-01-01')
          .lte('date', endDate || '2024-12-31')
          .eq(clientId ? 'matters.client_id' : '', clientId || '')
          .eq(matterId ? 'matter_id' : '', matterId || '')

        if (timeError) throw timeError

        reportData = {
          entries: timeEntries,
          totalHours: timeEntries?.reduce((sum, entry) => sum + entry.hours, 0) || 0,
          totalBillable: timeEntries?.reduce((sum, entry) => sum + (entry.billable_amount || 0), 0) || 0
        }
        break

      case 'client_summary':
        const { data: clients, error: clientError } = await supabase
          .from('clients')
          .select(`
            *,
            matters(count),
            time_entries(hours, billable_amount)
          `)

        if (clientError) throw clientError

        reportData = { clients }
        break

      case 'matter_summary':
        const { data: matters, error: matterError } = await supabase
          .from('matters')
          .select(`
            *,
            clients(name),
            time_entries(hours, billable_amount),
            tasks(count)
          `)
          .eq(clientId ? 'client_id' : '', clientId || '')

        if (matterError) throw matterError

        reportData = { matters }
        break

      default:
        throw new AppError('Invalid report type', 'VALIDATION_ERROR')
    }

    return NextResponse.json({ data: reportData })
  } catch (error) {
    const apiError = handleApiError(error)
    return NextResponse.json(
      { error: apiError.message },
      { status: error instanceof AppError && error.code === 'UNAUTHORIZED' ? 401 : 500 }
    )
  }
}
