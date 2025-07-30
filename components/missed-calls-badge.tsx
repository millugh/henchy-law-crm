"use client"

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api'

export function MissedCallsBadge() {
  const [missedCount, setMissedCount] = useState(0)

  useEffect(() => {
    fetchMissedCalls()
    
    const interval = setInterval(fetchMissedCalls, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchMissedCalls = async () => {
    const response = await apiClient.fetchPhoneCalls()
    if (response.data) {
      const missed = response.data.filter(call => call.status === 'missed').length
      setMissedCount(missed)
    }
  }

  if (missedCount === 0) return null

  return (
    <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
      {missedCount}
    </Badge>
  )
}
