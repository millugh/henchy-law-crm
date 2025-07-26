"use client"

import { useState, useEffect } from 'react'

interface Matter {
  id: string
  title: string
  description?: string
  status: 'open' | 'pending' | 'closed' | 'archived'
  matter_type?: string
  open_date?: string
  close_date?: string
  created_at: string
  updated_at: string
  clients?: {
    id: string
    name: string
    email?: string
  }
}

export function useMatters() {
  const [matters, setMatters] = useState<Matter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMatters = async () => {
      try {
        const response = await fetch('/api/matters')
        if (!response.ok) {
          throw new Error('Failed to fetch matters')
        }
        const data = await response.json()
        setMatters(data.matters || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchMatters()
  }, [])

  const createMatter = async (matterData: Omit<Matter, 'id' | 'created_at' | 'updated_at' | 'clients'>) => {
    try {
      const response = await fetch('/api/matters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matterData),
      })

      if (!response.ok) {
        throw new Error('Failed to create matter')
      }

      const { matter } = await response.json()
      setMatters(prev => [matter, ...prev])
      return matter
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  return { matters, loading, error, createMatter }
}
