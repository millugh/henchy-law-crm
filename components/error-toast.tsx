"use client"

import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

interface ErrorToastProps {
  error: Error | null
  onClear: () => void
}

export function ErrorToast({ error, onClear }: ErrorToastProps) {
  const { toast } = useToast()

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      onClear()
    }
  }, [error, toast, onClear])

  return null
}
