import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { handleApiError, AppError } from '@/lib/error-handling'
import { logAuditEvent } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let query = supabase
      .from('contract_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      throw new AppError('Failed to fetch contract templates', 'FETCH_ERROR', error)
    }

    return NextResponse.json({ data })
  } catch (error) {
    const apiError = handleApiError(error)
    return NextResponse.json(
      { error: apiError.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new AppError('Unauthorized', 'UNAUTHORIZED')
    }

    const { name, category, description, tags, content } = body

    if (!name || !category || !content) {
      throw new AppError('Name, category, and content are required', 'VALIDATION_ERROR')
    }

    const { data, error } = await supabase
      .from('contract_templates')
      .insert({
        name,
        category,
        description,
        tags: tags || [],
        content,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      throw new AppError('Failed to create contract template', 'CREATE_ERROR', error)
    }

    await logAuditEvent('CREATE', 'contract_templates', data.id, null, data)

    return NextResponse.json({ data })
  } catch (error) {
    const apiError = handleApiError(error)
    return NextResponse.json(
      { error: apiError.message },
      { status: error instanceof AppError && error.code === 'UNAUTHORIZED' ? 401 : 500 }
    )
  }
}
