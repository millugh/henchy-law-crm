export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/plain', // .txt
  'image/png',
  'image/jpeg',
] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const FILE_TYPE_EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/plain': 'txt',
  'image/png': 'png',
  'image/jpeg': 'jpg',
}

export interface FileValidationError {
  code: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'INVALID_NAME'
  message: string
}

export function validateFile(file: File): FileValidationError | null {
  if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
    return {
      code: 'INVALID_TYPE',
      message: `File type ${file.type} is not allowed. Allowed types: PDF, DOCX, XLSX, TXT, PNG, JPG`
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      code: 'FILE_TOO_LARGE',
      message: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    }
  }

  if (!file.name || file.name.trim().length === 0) {
    return {
      code: 'INVALID_NAME',
      message: 'File name cannot be empty'
    }
  }

  return null
}

export function getFileExtension(mimeType: string): string {
  return FILE_TYPE_EXTENSIONS[mimeType] || 'unknown'
}
