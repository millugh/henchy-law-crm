import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
          }
        },
      },
    }
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderPath = searchParams.get('path') || ''
    
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (folderPath) {
      query = query.eq('folder_path', folderPath)
    }

    const { data: documents, error } = await query

    if (error) {
      console.error('Error fetching documents:', error)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    const files = documents?.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: 'file',
      size: doc.file_size || 0,
      modified: doc.updated_at,
      fileType: doc.file_type?.toLowerCase() || 'unknown',
      url: doc.file_url,
      folderPath: doc.folder_path
    })) || []

    return NextResponse.json({ files })
  } catch (error) {
    console.error('Error reading files:', error)
    return NextResponse.json(
      { error: 'Failed to read files' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folderPath = formData.get('folderPath') as string || ''
    const matterId = formData.get('matterId') as string || null
    const clientId = formData.get('clientId') as string || null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.ms-excel',
      'text/plain',
      'image/jpeg',
      'image/png'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    if (file.size > 6 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 6MB limit' }, { status: 400 })
    }

    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = folderPath 
      ? `${user.id}/${folderPath}/${timestamp}_${sanitizedName}`
      : `${user.id}/${timestamp}_${sanitizedName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        name: file.name,
        file_type: fileExtension?.toUpperCase() || 'UNKNOWN',
        file_size: file.size,
        file_url: publicUrl,
        folder_path: folderPath,
        user_id: user.id,
        matter_id: matterId,
        client_id: clientId
      })
      .select()
      .single()

    if (!dbError) {
      const { logFileUpload } = await import('@/lib/audit-logger')
      await logFileUpload(
        user.id,
        file.name,
        file.size,
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        request.headers.get('user-agent') || undefined
      )
    }

    if (dbError) {
      console.error('Database error:', dbError)
      await supabase.storage.from('documents').remove([filePath])
      return NextResponse.json({ error: 'Failed to save file metadata' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      file: {
        id: document.id,
        name: document.name,
        type: 'file',
        size: document.file_size,
        modified: document.created_at,
        fileType: document.file_type?.toLowerCase(),
        url: document.file_url,
        folderPath: document.folder_path
      }
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }

    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !document) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const filePath = document.file_url.split('/').pop()
    if (filePath) {
      await supabase.storage.from('documents').remove([`${user.id}/${filePath}`])
    }

    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', fileId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
    }

    const { logFileDelete } = await import('@/lib/audit-logger')
    await logFileDelete(
      user.id,
      document.name,
      fileId,
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
