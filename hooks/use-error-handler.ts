"use client"

import { useState, useCallback } from 'react'

export interface ErrorState {
  message: string
  code?: string
  details?: any
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleError = useCallback((error: unknown) => {
    console.error('Error handled:', error)
    
    if (error instanceof Error) {
      setError({
        message: error.message,
        code: (error as any).code,
        details: (error as any).details
      })
    } else if (typeof error === 'string') {
      setError({ message: error })
    } else {
      setError({ message: 'An unexpected error occurred' })
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const withErrorHandling = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
      try {
        setIsLoading(true)
        clearError()
        const result = await asyncFn()
        return result
      } catch (error) {
        handleError(error)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [handleError, clearError]
  )

  const retry = useCallback(
    async <T>(asyncFn: () => Promise<T>, maxAttempts: number = 3): Promise<T | null> => {
      let lastError: unknown
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          setIsLoading(true)
          if (attempt === 1) clearError()
          
          const result = await asyncFn()
          return result
        } catch (error) {
          lastError = error
          
          if (attempt === maxAttempts) {
            handleError(error)
            return null
          }
          
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
        } finally {
          if (attempt === maxAttempts) {
            setIsLoading(false)
          }
        }
      }
      
      return null
    },
    [handleError, clearError]
  )

  return {
    error,
    isLoading,
    handleError,
    clearError,
    withErrorHandling,
    retry
  }
}
