import crypto from 'crypto'
import { PhoneCall, Voicemail, ThreeCxConfig } from './api'

export interface ThreeCxWebhookEvent {
  eventType: 'incoming' | 'call-ended' | 'voicemail'
  callId: string
  callerNumber: string
  calleeNumber: string
  timestamp: string
  duration?: number
  recordingUrl?: string
  voicemailUrl?: string
}

export interface ThreeCxCallRequest {
  callerNumber: string
  calleeNumber: string
  extension: string
}

export class ThreeCxService {
  private config: ThreeCxConfig | null = null

  constructor(config?: ThreeCxConfig) {
    this.config = config || null
  }

  setConfig(config: ThreeCxConfig) {
    this.config = config
  }

  validateWebhookSignature(payload: string, signature: string): boolean {
    if (!this.config?.webhook_secret) {
      throw new Error('Webhook secret not configured')
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhook_secret)
      .update(payload)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  }

  async originateCall(request: ThreeCxCallRequest): Promise<{ success: boolean; callId?: string; error?: string }> {
    if (!this.config) {
      return { success: false, error: 'ThreeCX not configured' }
    }

    try {
      const response = await fetch(`${this.config.api_url}/api/originate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.config.api_username}:${this.config.api_password}`).toString('base64')}`,
        },
        body: JSON.stringify({
          caller: request.callerNumber,
          callee: request.calleeNumber,
          extension: request.extension || this.config.default_extension,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return { success: false, error: `3CX API error: ${response.status} - ${errorText}` }
      }

      const data = await response.json()
      return { success: true, callId: data.callId }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async fetchRecordings(callId: string): Promise<{ success: boolean; recordingUrl?: string; error?: string }> {
    if (!this.config) {
      return { success: false, error: 'ThreeCX not configured' }
    }

    try {
      const response = await fetch(`${this.config.api_url}/api/recordings/${callId}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.api_username}:${this.config.api_password}`).toString('base64')}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Recording not found' }
        }
        const errorText = await response.text()
        return { success: false, error: `3CX API error: ${response.status} - ${errorText}` }
      }

      const data = await response.json()
      return { success: true, recordingUrl: data.recordingUrl }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async matchCallerToClient(phoneNumber: string, supabase: any): Promise<{ id: string; name: string } | null> {
    try {
      const cleanNumber = phoneNumber.replace(/\D/g, '')
      
      const { data: clients, error } = await supabase
        .from('clients')
        .select('id, name, phone')
        .not('phone', 'is', null)

      if (error || !clients) {
        return null
      }

      for (const client of clients) {
        if (client.phone) {
          const cleanClientNumber = client.phone.replace(/\D/g, '')
          if (cleanClientNumber === cleanNumber || 
              cleanClientNumber.endsWith(cleanNumber.slice(-10)) ||
              cleanNumber.endsWith(cleanClientNumber.slice(-10))) {
            return { id: client.id, name: client.name }
          }
        }
      }

      return null
    } catch (error) {
      console.error('Error matching caller to client:', error)
      return null
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config) {
      return { success: false, message: 'ThreeCX not configured' }
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(`${this.config.api_url}/api/status`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.api_username}:${this.config.api_password}`).toString('base64')}`,
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        return { success: false, message: `Connection failed: ${response.status} ${response.statusText}` }
      }

      const data = await response.json()
      return { success: true, message: `Connected successfully. Server status: ${data.status || 'OK'}` }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection test failed' 
      }
    }
  }

  processWebhookEvent(event: ThreeCxWebhookEvent): Partial<PhoneCall> | Partial<Voicemail> | null {
    switch (event.eventType) {
      case 'incoming':
        return {
          direction: 'inbound' as const,
          caller_number: event.callerNumber,
          callee_number: event.calleeNumber,
          start_time: event.timestamp,
          status: 'ringing' as const,
          call_id_3cx: event.callId,
        }

      case 'call-ended':
        return {
          end_time: event.timestamp,
          duration: event.duration,
          status: event.duration && event.duration > 0 ? 'completed' as const : 'missed' as const,
          recording_url: event.recordingUrl,
        }

      case 'voicemail':
        return {
          caller_number: event.callerNumber,
          voicemail_url: event.voicemailUrl || '',
          timestamp: event.timestamp,
          duration: event.duration,
        }

      default:
        return null
    }
  }
}

export const threeCxService = new ThreeCxService()
