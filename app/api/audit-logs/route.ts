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

    const tableName = searchParams.get('table_name')
    const recordId = searchParams.get('record_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('audit_logs')
      .select(`
        id,
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        created_at,
        user_profiles!inner(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (tableName) {
      query = query.eq('table_name', tableName)
    }

    if (recordId) {
      query = query.eq('record_id', recordId)
    }

    const { data, error } = await query

    if (error) {
      throw new AppError('Failed to fetch audit logs', 'FETCH_ERROR', error)
    }

    return NextResponse.json({ data })
  } catch (error) {
    const apiError = handleApiError(error)
    return NextResponse.json(
      { error: apiError.message },
      { status: error instanceof AppError && error.code === 'UNAUTHORIZED' ? 401 : 500 }
    )
  }
}
