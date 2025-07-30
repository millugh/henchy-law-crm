"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { PhoneCall } from '@/lib/api'

const getEventSource = () => {
  if (typeof window !== 'undefined') {
    return window.EventSource || require('eventsource')
  }
  return null
}

export function useIncomingCalls() {
  const [incomingCall, setIncomingCall] = useState<PhoneCall | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 10
  const baseReconnectDelay = 1000 // 1 second

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    const EventSourceClass = getEventSource()
    if (!EventSourceClass) {
      console.error('EventSource not supported in this environment')
      setConnectionStatus('error')
      return
    }

    cleanup()
    setConnectionStatus('connecting')

    try {
      const eventSource = new EventSourceClass('/api/3cx/events')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('SSE connection established')
        setConnectionStatus('connected')
        reconnectAttemptsRef.current = 0
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'incoming_call') {
            setIncomingCall(data.call)
          } else if (data.type === 'call_ended') {
            setIncomingCall(null)
          } else if (data.type === 'heartbeat') {
            console.debug('SSE heartbeat received')
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        setConnectionStatus('error')
        
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(
            baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current),
            30000 // Max 30 seconds
          )
          
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, delay)
        } else {
          console.error('Max reconnection attempts reached')
          setConnectionStatus('disconnected')
        }
      }
    } catch (error) {
      console.error('Failed to create EventSource:', error)
      setConnectionStatus('error')
    }
  }, [cleanup])

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0
    connect()
  }, [connect])

  useEffect(() => {
    connect()
    return cleanup
  }, [connect, cleanup])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && connectionStatus === 'error') {
        console.log('Page became visible, attempting to reconnect SSE')
        reconnect()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [connectionStatus, reconnect])

  useEffect(() => {
    const handleOnline = () => {
      if (connectionStatus === 'error') {
        console.log('Network recovered, attempting to reconnect SSE')
        reconnect()
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [connectionStatus, reconnect])

  const dismissCall = () => {
    setIncomingCall(null)
  }

  return {
    incomingCall,
    dismissCall,
    connectionStatus,
    reconnect
  }
}
