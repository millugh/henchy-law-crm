export interface AppError {
  message: string
  code?: string
  statusCode?: number
  details?: any
}

export class ValidationError extends Error {
  code = 'VALIDATION_ERROR'
  statusCode = 400
  
  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error {
  code = 'AUTHENTICATION_ERROR'
  statusCode = 401
  
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  code = 'AUTHORIZATION_ERROR'
  statusCode = 403
  
  constructor(message: string = 'Insufficient permissions') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error {
  code = 'NOT_FOUND'
  statusCode = 404
  
  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class DatabaseError extends Error {
  code = 'DATABASE_ERROR'
  statusCode = 500
  
  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class FileUploadError extends Error {
  code = 'FILE_UPLOAD_ERROR'
  statusCode = 400
  
  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'FileUploadError'
  }
}

export function handleApiError(error: unknown): { error: string; statusCode: number } {
  console.error('API Error:', error)
  
  if (error instanceof ValidationError) {
    return { error: error.message, statusCode: error.statusCode }
  }
  
  if (error instanceof AuthenticationError) {
    return { error: error.message, statusCode: error.statusCode }
  }
  
  if (error instanceof AuthorizationError) {
    return { error: error.message, statusCode: error.statusCode }
  }
  
  if (error instanceof NotFoundError) {
    return { error: error.message, statusCode: error.statusCode }
  }
  
  if (error instanceof DatabaseError) {
    return { error: 'Database operation failed', statusCode: error.statusCode }
  }
  
  if (error instanceof FileUploadError) {
    return { error: error.message, statusCode: error.statusCode }
  }
  
  return { error: 'An unexpected error occurred', statusCode: 500 }
}

export function createErrorResponse(error: unknown) {
  const { error: message, statusCode } = handleApiError(error)
  return new Response(JSON.stringify({ error: message }), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' }
  })
}

export interface RetryOptions {
  maxAttempts: number
  delay: number
  backoff?: boolean
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxAttempts: 3, delay: 1000 }
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === options.maxAttempts) {
        throw lastError
      }
      
      const delay = options.backoff 
        ? options.delay * Math.pow(2, attempt - 1)
        : options.delay
        
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}
