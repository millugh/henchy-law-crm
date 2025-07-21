"use client"

import { useState, useEffect } from 'react'

interface DashboardStats {
  activeMatters: number
  billableHours: number
  unbilledRevenue: number
  newClients: number
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({
    activeMatters: 0,
    billableHours: 0,
    unbilledRevenue: 0,
    newClients: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}
