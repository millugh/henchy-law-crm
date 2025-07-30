'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone, Clock, AlertCircle } from 'lucide-react'
import { PhoneCall } from '@/lib/api'
import { createClient } from '@/lib/supabase'
import { PendingAssignmentModal } from './pending-assignment-modal'
import { toast } from 'sonner'

export function UnassignedCallsWidget() {
  const [unassignedCalls, setUnassignedCalls] = useState<PhoneCall[]>([])
  const [selectedCall, setSelectedCall] = useState<PhoneCall | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadUnassignedCalls()
  }, [])

  const loadUnassignedCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('phone_calls')
        .select('*')
        .is('client_id', null)
        .eq('direction', 'inbound')
        .order('start_time', { ascending: false })
        .limit(10)

      if (error) throw error
      setUnassignedCalls(data || [])
    } catch (error) {
      console.error('Error loading unassigned calls:', error)
      toast.error('Failed to load unassigned calls')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignCall = (call: PhoneCall) => {
    setSelectedCall(call)
    setIsModalOpen(true)
  }

  const handleAssignmentComplete = () => {
    loadUnassignedCalls()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Unassigned Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (unassignedCalls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Unassigned Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            No unassigned calls
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Unassigned Calls
            </div>
            <Badge variant="destructive">{unassignedCalls.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {unassignedCalls.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{call.caller_number}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(call.start_time).toLocaleString()}
                      {call.duration && (
                        <span className="ml-2">
                          • {Math.round(call.duration / 60)} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAssignCall(call)}
                  className="shrink-0"
                >
                  Assign
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <PendingAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pendingCall={selectedCall}
        onAssignmentComplete={handleAssignmentComplete}
      />
    </>
  )
}
