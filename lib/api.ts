"use client"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface DashboardStats {
  activeMatters: number
  totalBillableHours: number
  unbilledRevenue: number
  newClients: number
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  status: 'Active' | 'Inactive'
  lastInteraction: string
  practiceAreas: string[]
  logoUrl?: string
  created_at: string
  updated_at: string
}

export interface TimeEntry {
  id: string
  date: string
  hours: number
  description: string
  rate: number
  client_id: string
  matter_id?: string
  user_id: string
  created_at: string
  updated_at: string
  clients?: {
    id: string
    name: string
  }
  matters?: {
    id: string
    title: string
  }
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  client_id?: string
  matter_id?: string
  user_id: string
  created_at: string
  updated_at: string
  clients?: {
    id: string
    name: string
  }
  matters?: {
    id: string
    title: string
  }
}

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  all_day: boolean
  location: string | null
  client_id: string | null
  matter_id: string | null
  user_id: string
  created_at: string
  updated_at: string
  clients?: {
    id: string
    name: string
  }
}

export interface Matter {
  id: string
  title: string
  description: string | null
  status: string
  matter_type: string
  open_date: string
  close_date: string | null
  client_id: string
  practice_area_id: string | null
  user_id: string
  created_at: string
  updated_at: string
  clients?: {
    id: string
    name: string
  }
  property_address?: string
  policy_number?: string
  coverage_amount?: number
  insured_parties?: string
  decedent_name?: string
  date_of_death?: string
  key_beneficiaries?: string
}

export interface ActivityEvent {
  id: string
  matter_id: string
  client_id: string
  type: 'note' | 'call' | 'email' | 'meeting' | 'document' | 'task' | 'update'
  description: string
  details?: string
  user: string
  timestamp: string
  created_at: string
  updated_at: string
}

export interface PhoneCall {
  id: string
  user_id: string
  client_id?: string
  direction: 'inbound' | 'outbound'
  caller_number: string
  callee_number: string
  start_time: string
  end_time?: string
  duration?: number
  status: 'ringing' | 'connected' | 'completed' | 'missed' | 'failed'
  recording_url?: string
  call_id_3cx?: string
  notes?: string
  created_at: string
  updated_at: string
  clients?: {
    id: string
    name: string
  }
}

export interface Voicemail {
  id: string
  user_id: string
  call_id?: string
  caller_number: string
  voicemail_url: string
  transcription?: string
  duration?: number
  timestamp: string
  is_read: boolean
  created_at: string
  updated_at: string
  phone_calls?: {
    id: string
    caller_number: string
    client_id?: string
  }
}

export interface ThreeCxConfig {
  id: string
  user_id: string
  api_url: string
  api_username: string
  api_password: string
  webhook_secret: string
  default_extension?: string
  recording_enabled: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

class ApiClient {
  private supabase = createClientComponentClient()

  async fetchDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats' }
    }
  }

  async fetchClients(): Promise<ApiResponse<Client[]>> {
    try {
      const response = await fetch('/api/clients')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.clients || [] }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch clients' }
    }
  }

  async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Client>> {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.client }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create client' }
    }
  }

  async fetchTimeEntries(): Promise<ApiResponse<TimeEntry[]>> {
    try {
      const response = await fetch('/api/time-entries')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.timeEntries || [] }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch time entries' }
    }
  }

  async createTimeEntry(timeEntryData: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<ApiResponse<TimeEntry>> {
    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(timeEntryData),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.timeEntry }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create time entry' }
    }
  }

  async fetchTasks(): Promise<ApiResponse<Task[]>> {
    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.tasks || [] }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch tasks' }
    }
  }

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<ApiResponse<Task>> {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.task }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create task' }
    }
  }

  async fetchCalendarEvents(): Promise<ApiResponse<CalendarEvent[]>> {
    try {
      const response = await fetch('/api/calendar/events')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.events || [] }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch calendar events' }
    }
  }

  async createCalendarEvent(eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<ApiResponse<CalendarEvent>> {
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.event }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create calendar event' }
    }
  }

  async updateCalendarEvent(id: string, eventData: Partial<CalendarEvent>): Promise<ApiResponse<CalendarEvent>> {
    try {
      const response = await fetch(`/api/calendar/events/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.event }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update calendar event' }
    }
  }

  async deleteCalendarEvent(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`/api/calendar/events/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return { data: undefined }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete calendar event' }
    }
  }

  async fetchMatters(): Promise<ApiResponse<Matter[]>> {
    try {
      const response = await fetch('/api/matters')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.matters || [] }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch matters' }
    }
  }

  async createMatter(matterData: Omit<Matter, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<ApiResponse<Matter>> {
    try {
      const response = await fetch('/api/matters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matterData),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.matter }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create matter' }
    }
  }

  async updateMatter(id: string, matterData: Partial<Matter>): Promise<ApiResponse<Matter>> {
    try {
      const response = await fetch(`/api/matters/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matterData),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.matter }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update matter' }
    }
  }

  async deleteMatter(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`/api/matters/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return { data: undefined }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete matter' }
    }
  }

  async fetchMatterActivities(matterId: string): Promise<ApiResponse<ActivityEvent[]>> {
    try {
      const response = await fetch(`/api/matters/${matterId}/activities`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.activities || [] }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch matter activities' }
    }
  }

  async createMatterActivity(matterId: string, activityData: Omit<ActivityEvent, 'id' | 'created_at' | 'updated_at' | 'matter_id'>): Promise<ApiResponse<ActivityEvent>> {
    try {
      const response = await fetch(`/api/matters/${matterId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.activity }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create matter activity' }
    }
  }

  async fetchPhoneCalls(): Promise<ApiResponse<PhoneCall[]>> {
    try {
      const response = await fetch('/api/phone-calls')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.phoneCalls || [] }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch phone calls' }
    }
  }

  async createPhoneCall(callData: Omit<PhoneCall, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<ApiResponse<PhoneCall>> {
    try {
      const response = await fetch('/api/phone-calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callData),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.phoneCall }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create phone call' }
    }
  }

  async updatePhoneCall(id: string, callData: Partial<PhoneCall>): Promise<ApiResponse<PhoneCall>> {
    try {
      const response = await fetch(`/api/phone-calls/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callData),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.phoneCall }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update phone call' }
    }
  }

  async fetchVoicemails(): Promise<ApiResponse<Voicemail[]>> {
    try {
      const response = await fetch('/api/voicemails')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.voicemails || [] }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch voicemails' }
    }
  }

  async createVoicemail(voicemailData: Omit<Voicemail, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<ApiResponse<Voicemail>> {
    try {
      const response = await fetch('/api/voicemails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voicemailData),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.voicemail }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create voicemail' }
    }
  }

  async fetchThreeCxConfig(): Promise<ApiResponse<ThreeCxConfig>> {
    try {
      const response = await fetch('/api/3cx/config')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.config }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch 3CX config' }
    }
  }

  async updateThreeCxConfig(configData: Partial<ThreeCxConfig>): Promise<ApiResponse<ThreeCxConfig>> {
    try {
      const response = await fetch('/api/3cx/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data: data.config }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update 3CX config' }
    }
  }

  async testThreeCxConnection(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      const response = await fetch('/api/3cx/test-connection', {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to test 3CX connection' }
    }
  }
}

export const apiClient = new ApiClient()
