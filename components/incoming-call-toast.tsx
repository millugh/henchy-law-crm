"use client"

import { useState, useEffect } from 'react'
import { Phone, PhoneCall, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PhoneCall as PhoneCallType } from '@/lib/api'

interface IncomingCallToastProps {
  call: PhoneCallType
  onAnswer?: () => void
  onDecline?: () => void
  onViewClient?: () => void
  onAddNote?: () => void
}

export function IncomingCallToast({
  call,
  onAnswer,
  onDecline,
  onViewClient,
  onAddNote
}: IncomingCallToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isRinging, setIsRinging] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRinging(false)
    }, 30000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible || !isRinging) return null

  const handleClose = () => {
    setIsVisible(false)
    onDecline?.()
  }

  const clientName = call.clients?.name || 'Unknown Caller'
  const phoneNumber = call.caller_number

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <Card className="w-80 shadow-lg border-2 border-green-200 bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Phone className="h-5 w-5 text-green-600 animate-pulse" />
              </div>
              <span className="text-sm font-medium text-green-600">Incoming Call</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${clientName}`} />
              <AvatarFallback>
                {call.clients ? (
                  clientName.split(' ').map(n => n[0]).join('').toUpperCase()
                ) : (
                  <User className="h-6 w-6" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{clientName}</div>
              <div className="text-sm text-gray-600">{phoneNumber}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAnswer}
              className="flex-1 bg-green-50 border-green-200 hover:bg-green-100"
            >
              <PhoneCall className="h-4 w-4 mr-1" />
              Answer
            </Button>
            {call.clients && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewClient}
                className="flex-1"
              >
                <User className="h-4 w-4 mr-1" />
                View Client
              </Button>
            )}
          </div>

          <div className="flex gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddNote}
              className="flex-1 text-xs"
            >
              Add Note
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="flex-1 text-xs text-red-600 hover:text-red-700"
            >
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
