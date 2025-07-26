"use client"

import { useState, useEffect } from 'react'

interface TimeEntry {
  id: string
  date: string
  hours: number
  description: string
  hourly_rate?: number
  billed: boolean
  created_at: string
  updated_at: string
  clients?: {
    id: string
    name: string
  }
  matters?: {
    id: string
    title: string
  }
}

export function useTimeEntries() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTimeEntries = async () => {
      try {
        const response = await fetch('/api/time-entries')
        if (!response.ok) {
          throw new Error('Failed to fetch time entries')
        }
        const data = await response.json()
        setTimeEntries(data.timeEntries || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchTimeEntries()
  }, [])

  const createTimeEntry = async (entryData: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at' | 'clients' | 'matters'>) => {
    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      })

      if (!response.ok) {
        throw new Error('Failed to create time entry')
      }

      const { timeEntry } = await response.json()
      setTimeEntries(prev => [timeEntry, ...prev])
      return timeEntry
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  return { timeEntries, loading, error, createTimeEntry }
}
