import { NextResponse } from "next/server"
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get("parentId") || "/"

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('folder_path', parentId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const items = documents?.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: "file" as const,
      parentId: doc.folder_path,
      size: doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : undefined,
      lastModified: new Date(doc.created_at).toLocaleDateString(),
      fileType: doc.file_type,
      url: doc.file_url
    })) || []

    return NextResponse.json({ items, breadcrumbs: [] })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
  }
}
