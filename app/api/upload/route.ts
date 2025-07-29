import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

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

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${file.name}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file)

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName)

    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert([{
        user_id: user.id,
        client_id: clientId || null,
        matter_id: matterId || null,
        name: file.name,
        file_type: fileExt,
        file_size: file.size,
        file_url: urlData.publicUrl,
        folder_path: folderPath
      }])
      .select()
      .single()

    if (dbError) {
      await supabase.storage.from('documents').remove([fileName])
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
