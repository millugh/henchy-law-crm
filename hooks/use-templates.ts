import { useState, useEffect } from 'react'
import { LetterTemplate, ContractTemplate } from '@/lib/data'
import { showErrorToast, showSuccessToast } from '@/lib/error-handling'

export function useLetterTemplates() {
  const [templates, setTemplates] = useState<LetterTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/letter-templates')
      if (!response.ok) {
        throw new Error('Failed to fetch letter templates')
      }
      const { data } = await response.json()
      setTemplates(data)
    } catch (error) {
      showErrorToast(error, 'Failed to load letter templates')
    } finally {
      setLoading(false)
    }
  }

  const createTemplate = async (template: Omit<LetterTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/letter-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create letter template')
      }
      
      const { data } = await response.json()
      setTemplates(prev => [data, ...prev])
      showSuccessToast('Letter template created successfully')
      return data
    } catch (error) {
      showErrorToast(error, 'Failed to create letter template')
      throw error
    }
  }

  const updateTemplate = async (id: string, template: Partial<LetterTemplate>) => {
    try {
      const response = await fetch(`/api/letter-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update letter template')
      }
      
      const { data } = await response.json()
      setTemplates(prev => prev.map(t => t.id === id ? data : t))
      showSuccessToast('Letter template updated successfully')
      return data
    } catch (error) {
      showErrorToast(error, 'Failed to update letter template')
      throw error
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/letter-templates/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete letter template')
      }
      
      setTemplates(prev => prev.filter(t => t.id !== id))
      showSuccessToast('Letter template deleted successfully')
    } catch (error) {
      showErrorToast(error, 'Failed to delete letter template')
      throw error
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  }
}

export function useContractTemplates() {
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/contract-templates')
      if (!response.ok) {
        throw new Error('Failed to fetch contract templates')
      }
      const { data } = await response.json()
      setTemplates(data)
    } catch (error) {
      showErrorToast(error, 'Failed to load contract templates')
    } finally {
      setLoading(false)
    }
  }

  const createTemplate = async (template: Omit<ContractTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/contract-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create contract template')
      }
      
      const { data } = await response.json()
      setTemplates(prev => [data, ...prev])
      showSuccessToast('Contract template created successfully')
      return data
    } catch (error) {
      showErrorToast(error, 'Failed to create contract template')
      throw error
    }
  }

  const updateTemplate = async (id: string, template: Partial<ContractTemplate>) => {
    try {
      const response = await fetch(`/api/contract-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update contract template')
      }
      
      const { data } = await response.json()
      setTemplates(prev => prev.map(t => t.id === id ? data : t))
      showSuccessToast('Contract template updated successfully')
      return data
    } catch (error) {
      showErrorToast(error, 'Failed to update contract template')
      throw error
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/contract-templates/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete contract template')
      }
      
      setTemplates(prev => prev.filter(t => t.id !== id))
      showSuccessToast('Contract template deleted successfully')
    } catch (error) {
      showErrorToast(error, 'Failed to delete contract template')
      throw error
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  }
}
