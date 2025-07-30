"use client"

import React from 'react'
import { useIncomingCalls } from '@/hooks/use-incoming-calls'
import { IncomingCallToast } from './incoming-call-toast'
import { useRouter } from 'next/navigation'

export function GlobalIncomingCallHandler() {
  const { incomingCall, dismissCall } = useIncomingCalls()
  const router = useRouter()

  const handleViewClient = () => {
    if (incomingCall?.clients?.id) {
      router.push(`/clients/${incomingCall.clients.id}`)
      dismissCall()
    }
  }

  const handleAnswer = () => {
    dismissCall()
  }

  const handleAddNote = () => {
    if (incomingCall?.clients?.id) {
      router.push(`/clients/${incomingCall.clients.id}?tab=notes`)
    }
    dismissCall()
  }

  if (!incomingCall) return null

  return (
    <IncomingCallToast
      call={incomingCall}
      onAnswer={handleAnswer}
      onDecline={dismissCall}
      onViewClient={handleViewClient}
      onAddNote={handleAddNote}
    />
  )
}
