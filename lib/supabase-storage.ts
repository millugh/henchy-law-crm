import { createAdminClient } from './supabase-server'
import { validateFile, getFileExtension } from './file-validation'

const STORAGE_BUCKET = 'documents'

export interface UploadFileOptions {
  userId: string
  clientId?: string
  matterId?: string
  folderPath?: string
}

export interface UploadFileResult {
  success: boolean
  fileUrl?: string
  error?: string
  fileName?: string
  fileSize?: number
  fileType?: string
}

export async function uploadFileToStorage(
  file: File,
  options: UploadFileOptions
): Promise<UploadFileResult> {
  try {
    const validationError = validateFile(file)
    if (validationError) {
      return {
        success: false,
        error: validationError.message
      }
    }

    const supabase = createAdminClient()

    const timestamp = Date.now()
    const extension = getFileExtension(file.type)
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${sanitizedFileName}`
    
    let filePath: string
    if (options.clientId && options.matterId) {
      filePath = `${options.userId}/${options.clientId}/${options.matterId}/${fileName}`
    } else if (options.clientId) {
      filePath = `${options.userId}/${options.clientId}/${fileName}`
    } else {
      filePath = `${options.userId}/general/${fileName}`
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      return {
        success: false,
        error: `Failed to upload file: ${error.message}`
      }
    }

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)

    return {
      success: true,
      fileUrl: urlData.publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: extension
    }

  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during file upload'
    }
  }
}

export async function deleteFileFromStorage(filePath: string): Promise<boolean> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])

    return !error
  } catch (error) {
    console.error('Delete file error:', error)
    return false
  }
}
