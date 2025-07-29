import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { uploadFileToStorage } from '@/lib/supabase-storage'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const matterId = searchParams.get('matterId')

    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (clientId) {
      query = query.eq('client_id', clientId)
    }
    if (matterId) {
      query = query.eq('matter_id', matterId)
    }

    const { data: documents, error } = await query

    if (error) {
      console.error('Fetch documents error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ documents })
  } catch (err) {
    console.error('API Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const clientId = formData.get('clientId') as string
    const matterId = formData.get('matterId') as string
    const folderPath = formData.get('folderPath') as string || '/'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const uploadResult = await uploadFileToStorage(file, {
      userId: user.id,
      clientId: clientId || undefined,
      matterId: matterId || undefined,
      folderPath
    })

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 400 })
    }

    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        client_id: clientId || null,
        matter_id: matterId || null,
        name: uploadResult.fileName,
        file_type: uploadResult.fileType,
        file_size: uploadResult.fileSize,
        file_url: uploadResult.fileUrl,
        folder_path: folderPath
      })
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ document })
  } catch (err) {
    console.error('API Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
