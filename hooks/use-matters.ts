"use client"

import { useEffect, useState } from 'react'
import { apiClient, type Matter } from '@/lib/api'

export function useMatters(matterType?: string) {
  const [matters, setMatters] = useState<Matter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMatters = async () => {
    setLoading(true)
    setError(null)
    
    const response = await apiClient.fetchMatters()
    
    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      const filteredMatters = matterType 
        ? response.data.filter(matter => matter.matter_type === matterType)
        : response.data
      setMatters(filteredMatters)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchMatters()
  }, [matterType])

  const createMatter = async (matterData: Omit<Matter, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    const response = await apiClient.createMatter(matterData)
    
    if (response.error) {
      setError(response.error)
      return { success: false, error: response.error }
    } else if (response.data) {
      await fetchMatters()
      return { success: true, data: response.data }
    }
    
    return { success: false, error: 'Unknown error occurred' }
  }

  const updateMatter = async (id: string, updates: Partial<Matter>) => {
    const response = await apiClient.updateMatter(id, updates)
    
    if (response.error) {
      setError(response.error)
      return { success: false, error: response.error }
    } else if (response.data) {
      await fetchMatters()
      return { success: true, data: response.data }
    }
    
    return { success: false, error: 'Unknown error occurred' }
  }

  const deleteMatter = async (id: string) => {
    const response = await apiClient.deleteMatter(id)
    
    if (response.error) {
      setError(response.error)
      return { success: false, error: response.error }
    } else {
      await fetchMatters()
      return { success: true }
    }
  }

  return { 
    matters, 
    loading, 
    error, 
    refetch: fetchMatters,
    createMatter,
    updateMatter,
    deleteMatter
  }
}
