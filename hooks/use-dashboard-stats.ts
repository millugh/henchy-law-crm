"use client"

import { useEffect, useState } from 'react'
import { apiClient, type DashboardStats } from '@/lib/api'

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    
    const response = await apiClient.fetchDashboardStats()
    
    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      setStats(response.data)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}
