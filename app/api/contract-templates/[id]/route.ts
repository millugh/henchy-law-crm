import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { handleApiError, AppError } from '@/lib/error-handling'
import { logAuditEvent } from '@/lib/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params

    const { data, error } = await supabase
      .from('contract_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new AppError('Contract template not found', 'NOT_FOUND', error)
    }

    return NextResponse.json({ data })
  } catch (error) {
    const apiError = handleApiError(error)
    return NextResponse.json(
      { error: apiError.message },
      { status: error instanceof AppError && error.code === 'NOT_FOUND' ? 404 : 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params
    const body = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new AppError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: oldData } = await supabase
      .from('contract_templates')
      .select('*')
      .eq('id', id)
      .single()

    const { name, category, description, tags, content } = body

    const { data, error } = await supabase
      .from('contract_templates')
      .update({
        name,
        category,
        description,
        tags: tags || [],
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new AppError('Failed to update contract template', 'UPDATE_ERROR', error)
    }

    await logAuditEvent('UPDATE', 'contract_templates', id, oldData, data)

    return NextResponse.json({ data })
  } catch (error) {
    const apiError = handleApiError(error)
    return NextResponse.json(
      { error: apiError.message },
      { status: error instanceof AppError && error.code === 'UNAUTHORIZED' ? 401 : 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new AppError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: oldData } = await supabase
      .from('contract_templates')
      .select('*')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('contract_templates')
      .delete()
      .eq('id', id)

    if (error) {
      throw new AppError('Failed to delete contract template', 'DELETE_ERROR', error)
    }

    await logAuditEvent('DELETE', 'contract_templates', id, oldData, null)

    return NextResponse.json({ success: true })
  } catch (error) {
    const apiError = handleApiError(error)
    return NextResponse.json(
      { error: apiError.message },
      { status: error instanceof AppError && error.code === 'UNAUTHORIZED' ? 401 : 500 }
    )
  }
}
