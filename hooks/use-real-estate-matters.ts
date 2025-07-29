"use client"

import { useState, useEffect } from 'react'
import type { RealEstateMatter } from '../lib/data'

export function useRealEstateMatters() {
  const [matters, setMatters] = useState<RealEstateMatter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMatters = async () => {
    try {
      const response = await fetch('/api/matters?type=Real Estate')
      if (!response.ok) throw new Error('Failed to fetch matters')
      const data = await response.json()
      
      const transformedMatters = data.matters.map((matter: any) => ({
        id: matter.id,
        name: matter.title,
        propertyAddress: matter.property_address,
        status: matter.status,
        clientId: matter.client_id,
        clientName: matter.clients?.name || '',
        description: matter.description
      }))
      
      setMatters(transformedMatters)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const createMatter = async (matterData: Omit<RealEstateMatter, 'id' | 'clientName'>) => {
    try {
      const response = await fetch('/api/matters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matterData)
      })
      
      if (!response.ok) throw new Error('Failed to create matter')
      
      await fetchMatters() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  useEffect(() => {
    fetchMatters()
  }, [])

  return { matters, loading, error, createMatter, refetch: fetchMatters }
}
