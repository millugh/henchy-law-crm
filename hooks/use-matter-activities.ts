"use client"

import { useEffect, useState } from 'react'
import { apiClient, type ActivityEvent } from '@/lib/api'

export function useMatterActivities(matterId: string) {
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = async () => {
    if (!matterId) return
    
    setLoading(true)
    setError(null)
    
    const response = await apiClient.fetchMatterActivities(matterId)
    
    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      setActivities(response.data.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ))
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchActivities()
  }, [matterId])

  const createActivity = async (activityData: Omit<ActivityEvent, 'id' | 'created_at' | 'updated_at' | 'matter_id'>) => {
    const response = await apiClient.createMatterActivity(matterId, activityData)
    
    if (response.error) {
      setError(response.error)
      return { success: false, error: response.error }
    } else if (response.data) {
      await fetchActivities()
      return { success: true, data: response.data }
    }
    
    return { success: false, error: 'Unknown error occurred' }
  }

  return { 
    activities, 
    loading, 
    error, 
    refetch: fetchActivities,
    createActivity
  }
}
