import { useEffect, useState } from 'react'

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  created_at: string
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/clients')
      
      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }

      const data = await response.json()
      setClients(data.clients || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  return { clients, loading, error, refetch: fetchClients }
}
