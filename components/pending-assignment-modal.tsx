'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Phone, User, Clock, Plus } from 'lucide-react'
import { PhoneCall } from '@/lib/api'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

interface PendingAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  pendingCall: PhoneCall | null
  onAssignmentComplete: () => void
}

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
}

export function PendingAssignmentModal({ 
  isOpen, 
  onClose, 
  pendingCall, 
  onAssignmentComplete 
}: PendingAssignmentModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      loadClients()
      if (pendingCall?.caller_number) {
        setNewClientName(`Caller ${pendingCall.caller_number}`)
      }
    }
  }, [isOpen, pendingCall])

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, phone')
        .order('name')

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error loading clients:', error)
      toast.error('Failed to load clients')
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  )

  const handleAssignToExisting = async () => {
    if (!selectedClientId || !pendingCall) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('phone_calls')
        .update({ client_id: selectedClientId })
        .eq('id', pendingCall.id)

      if (error) throw error

      toast.success('Call assigned to client successfully')
      onAssignmentComplete()
      onClose()
    } catch (error) {
      console.error('Error assigning call:', error)
      toast.error('Failed to assign call')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNewClient = async () => {
    if (!newClientName.trim() || !pendingCall) return

    setIsLoading(true)
    try {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert([{
          name: newClientName.trim(),
          email: newClientEmail.trim() || null,
          phone: pendingCall.caller_number,
        }])
        .select()
        .single()

      if (clientError) throw clientError

      const { error: callError } = await supabase
        .from('phone_calls')
        .update({ client_id: newClient.id })
        .eq('id', pendingCall.id)

      if (callError) throw callError

      toast.success(`New client "${newClientName}" created and call assigned`)
      onAssignmentComplete()
      onClose()
    } catch (error) {
      console.error('Error creating client:', error)
      toast.error('Failed to create client')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    if (!pendingCall) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('phone_calls')
        .update({ status: 'unassigned' })
        .eq('id', pendingCall.id)

      if (error) throw error

      toast.info('Call marked as unassigned')
      onAssignmentComplete()
      onClose()
    } catch (error) {
      console.error('Error updating call status:', error)
      toast.error('Failed to update call')
    } finally {
      setIsLoading(false)
    }
  }

  if (!pendingCall) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Assign Call to Client
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Call Details */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Caller Number:</span>
              <Badge variant="outline">{pendingCall.caller_number}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Duration:</span>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-3 w-3" />
                {pendingCall.duration ? `${Math.round(pendingCall.duration / 60)} min` : 'Unknown'}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Time:</span>
              <span className="text-sm">
                {new Date(pendingCall.start_time).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Assignment Options */}
          <div className="space-y-3">
            {!isCreatingNew ? (
              <>
                <div>
                  <Label htmlFor="client-search">Search Existing Clients</Label>
                  <Input
                    id="client-search"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="client-select">Select Client</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{client.name}</span>
                            {client.phone && (
                              <span className="text-xs text-gray-500">{client.phone}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAssignToExisting}
                    disabled={!selectedClientId || isLoading}
                    className="flex-1"
                  >
                    Assign to Client
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingNew(true)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    New
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="new-client-name">New Client Name</Label>
                  <Input
                    id="new-client-name"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Enter client name..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="new-client-email">Email (Optional)</Label>
                  <Input
                    id="new-client-email"
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="Enter email address..."
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateNewClient}
                    disabled={!newClientName.trim() || isLoading}
                    className="flex-1"
                  >
                    <User className="h-4 w-4 mr-1" />
                    Create & Assign
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingNew(false)}
                  >
                    Back
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Skip Option */}
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isLoading}
              className="w-full text-gray-600"
            >
              Skip Assignment (Mark as Unassigned)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
