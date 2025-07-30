"use client"

import { useState, useEffect } from 'react'
import { PhoneCall } from '@/lib/api'

export function useIncomingCalls() {
  const [incomingCall, setIncomingCall] = useState<PhoneCall | null>(null)

  useEffect(() => {
    const eventSource = new EventSource('/api/3cx/events')
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'incoming_call') {
        setIncomingCall(data.call)
      } else if (data.type === 'call_ended') {
        setIncomingCall(null)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [])

  const dismissCall = () => {
    setIncomingCall(null)
  }

  return {
    incomingCall,
    dismissCall
  }
}
