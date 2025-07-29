"use client"

import { useEffect, useState } from 'react'
import { apiClient, type Client } from '@/lib/api'

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = async () => {
    setLoading(true)
    setError(null)
    
    const response = await apiClient.fetchClients()
    
    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      setClients(response.data)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const createClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await apiClient.createClient(clientData)
    
    if (response.error) {
      setError(response.error)
      return { success: false, error: response.error }
    } else if (response.data) {
      await fetchClients()
      return { success: true, data: response.data }
    }
    
    return { success: false, error: 'Unknown error occurred' }
  }

  return { 
    clients, 
    loading, 
    error, 
    refetch: fetchClients,
    createClient
  }
}
