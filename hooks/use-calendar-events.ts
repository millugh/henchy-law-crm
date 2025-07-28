"use client"

import { useEffect, useState } from 'react'
import { apiClient, type CalendarEvent } from '@/lib/api'

export interface FullCalendarEvent {
  id: string
  title: string
  start: string
  end: string
  allDay?: boolean
  backgroundColor?: string
  borderColor?: string
  extendedProps?: {
    clientId?: string
    clientName?: string
    type?: string
    description?: string
  }
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<FullCalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    setLoading(true)
    setError(null)
    
    const response = await apiClient.fetchCalendarEvents()
    
    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      const transformedEvents: FullCalendarEvent[] = response.data.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        allDay: event.all_day,
        backgroundColor: getEventColor(event.description || ''),
        borderColor: getEventColor(event.description || ''),
        extendedProps: {
          clientId: event.client_id || '',
          clientName: event.clients?.name || '',
          type: extractEventType(event.description || ''),
          description: event.description || '',
        }
      }))
      setEvents(transformedEvents)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    const response = await apiClient.createCalendarEvent(eventData)
    
    if (response.error) {
      setError(response.error)
      return { success: false, error: response.error }
    } else if (response.data) {
      await fetchEvents()
      return { success: true, data: response.data }
    }
    
    return { success: false, error: 'Unknown error occurred' }
  }

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    const response = await apiClient.updateCalendarEvent(id, updates)
    
    if (response.error) {
      setError(response.error)
      return { success: false, error: response.error }
    } else if (response.data) {
      await fetchEvents()
      return { success: true, data: response.data }
    }
    
    return { success: false, error: 'Unknown error occurred' }
  }

  const deleteEvent = async (id: string) => {
    const response = await apiClient.deleteCalendarEvent(id)
    
    if (response.error) {
      setError(response.error)
      return { success: false, error: response.error }
    } else {
      await fetchEvents()
      return { success: true }
    }
  }

  return { 
    events, 
    loading, 
    error, 
    refetch: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent
  }
}

function getEventColor(description: string): string {
  const colorMap: Record<string, string> = {
    Meeting: '#3b82f6',
    Deadline: '#ef4444',
    'Court Appearance': '#a855f7',
    Consultation: '#14b8a6',
    Other: '#71717a',
  }
  
  const type = extractEventType(description)
  return colorMap[type] || colorMap.Other
}

function extractEventType(description: string): string {
  const lowerDesc = description.toLowerCase()
  if (lowerDesc.includes('meeting')) return 'Meeting'
  if (lowerDesc.includes('deadline') || lowerDesc.includes('due')) return 'Deadline'
  if (lowerDesc.includes('court') || lowerDesc.includes('hearing')) return 'Court Appearance'
  if (lowerDesc.includes('consultation') || lowerDesc.includes('consult')) return 'Consultation'
  return 'Other'
}
