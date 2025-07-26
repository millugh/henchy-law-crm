"use client"

import { useState, useEffect } from 'react'
import { apiClient, type Task } from '@/lib/api'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    setLoading(true)
    setError(null)
    
    const response = await apiClient.fetchTasks()
    
    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      setTasks(response.data)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const { task } = await response.json()
      setTasks(prev => prev.map(t => t.id === id ? task : t))
      return task
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    const response = await apiClient.createTask(taskData)
    
    if (response.error) {
      setError(response.error)
      return { success: false, error: response.error }
    } else if (response.data) {
      await fetchTasks()
      return { success: true, data: response.data }
    }
    
    return { success: false, error: 'Unknown error occurred' }
  }

  return { 
    tasks, 
    loading, 
    error, 
    updateTask,
    createTask,
    refetch: fetchTasks
  }
}
