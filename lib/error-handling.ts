import { toast } from '@/components/ui/use-toast'

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export class AppError extends Error {
  code?: string
  details?: any

  constructor(message: string, code?: string, details?: any) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
  }
}

export function handleApiError(error: any): ApiError {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details
    }
  }

  if (error?.message) {
    return {
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      details: error
    }
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    details: error
  }
}

export function showErrorToast(error: any, title?: string) {
  const apiError = handleApiError(error)
  
  toast({
    title: title || 'Error',
    description: apiError.message,
    variant: 'destructive'
  })
}

export function showSuccessToast(message: string, title?: string) {
  toast({
    title: title || 'Success',
    description: message
  })
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    console.error('Operation failed:', error)
    showErrorToast(error, errorMessage)
    return null
  }
}

export function validateRequired(value: any, fieldName: string): void {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new AppError(`${fieldName} is required`)
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new AppError('Please enter a valid email address')
  }
}

export function validatePhoneNumber(phone: string): void {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/
  if (!phoneRegex.test(phone)) {
    throw new AppError('Please enter a valid phone number')
  }
}
