import { createClient } from './supabase'

export interface UploadResult {
  data: {
    path: string
    id: string
    fullPath: string
  } | null
  error: Error | null
}

export interface FileUploadOptions {
  bucket: string
  path: string
  file: File
  onProgress?: (progress: number) => void
}

export async function uploadFile({ bucket, path, file, onProgress }: FileUploadOptions): Promise<UploadResult> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw error
    }

    if (onProgress) {
      onProgress(100)
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function deleteFile(bucket: string, path: string) {
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw error
  }
}

export async function getFileUrl(bucket: string, path: string) {
  const supabase = createClient()
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

export async function downloadFile(bucket: string, path: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path)

  if (error) {
    throw error
  }

  return data
}

export async function listFiles(bucket: string, path?: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path)

  if (error) {
    throw error
  }

  return data
}
