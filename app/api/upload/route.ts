import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { uploadFile } from '@/lib/supabase-storage'
import { handleApiError, AppError } from '@/lib/error-handling'
import { logAuditEvent } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new AppError('Unauthorized', 'UNAUTHORIZED')
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string || 'documents'
    const matterId = formData.get('matterId') as string
    const clientId = formData.get('clientId') as string

    if (!file) {
      throw new AppError('No file provided', 'VALIDATION_ERROR')
    }

    const fileExtension = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${file.name}`

    const uploadResult = await uploadFile({
      bucket,
      path: fileName,
      file,
    })

    if (uploadResult.error) {
      throw new AppError('Failed to upload file', 'UPLOAD_ERROR', uploadResult.error)
    }

    const { data: documentData, error: dbError } = await supabase
      .from('documents')
      .insert({
        name: file.name,
        file_path: fileName,
        file_size: file.size,
        file_type: fileExtension,
        bucket_name: bucket,
        matter_id: matterId || null,
        client_id: clientId || null,
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (dbError) {
      throw new AppError('Failed to save document record', 'DATABASE_ERROR', dbError)
    }

    await logAuditEvent('CREATE', 'documents', documentData.id, null, documentData)

    return NextResponse.json({
      data: {
        id: documentData.id,
        name: file.name,
        path: fileName,
        size: file.size,
        type: fileExtension,
        url: uploadResult.data?.fullPath,
      }
    })
  } catch (error) {
    const apiError = handleApiError(error)
    return NextResponse.json(
      { error: apiError.message },
      { status: error instanceof AppError && error.code === 'UNAUTHORIZED' ? 401 : 500 }
    )
  }
}
