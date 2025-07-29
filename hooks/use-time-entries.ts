"use client"

import { useEffect, useState } from 'react'
import { apiClient, type TimeEntry } from '@/lib/api'

export function useTimeEntries() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTimeEntries = async () => {
    setLoading(true)
    setError(null)
    
    const response = await apiClient.fetchTimeEntries()
    
    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      setTimeEntries(response.data)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchTimeEntries()
  }, [])

  const createTimeEntry = async (timeEntryData: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    const response = await apiClient.createTimeEntry(timeEntryData)
    
    if (response.error) {
      setError(response.error)
      return { success: false, error: response.error }
    } else if (response.data) {
      await fetchTimeEntries()
      return { success: true, data: response.data }
    }
    
    return { success: false, error: 'Unknown error occurred' }
  }

  return { 
    timeEntries, 
    loading, 
    error, 
    refetch: fetchTimeEntries,
    createTimeEntry
  }
}
