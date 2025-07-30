"use client"

import { useState, useEffect } from 'react'
import { Clock, User, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { apiClient, PhoneCall, Client } from '@/lib/api'


interface CallTimeEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  call: PhoneCall
}

export function CallTimeEntryDialog({ open, onOpenChange, call }: CallTimeEntryDialogProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>(call.client_id || '')
  const [hours, setHours] = useState<string>(call.duration ? (call.duration / 3600).toFixed(2) : '')
  const [rate, setRate] = useState<string>('350')
  const [description, setDescription] = useState<string>(
    `Phone call with ${call.direction === 'inbound' ? call.caller_number : call.callee_number}`
  )
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchClients()
    }
  }, [open])

  const fetchClients = async () => {
    const response = await apiClient.fetchClients()
    if (response.data) {
      setClients(response.data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedClientId || !hours || !rate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const timeEntryData = {
      client_id: selectedClientId,
      date: new Date(call.start_time).toISOString().split('T')[0],
      hours: parseFloat(hours),
      rate: parseFloat(rate),
      description,
    }

    const response = await apiClient.createTimeEntry(timeEntryData)

    if (response.data) {
      toast({
        title: "Time entry created",
        description: `${hours} hours logged for call`,
      })
      onOpenChange(false)
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to create time entry",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Log Billable Time
          </DialogTitle>
          <DialogDescription>
            Log billable time for your phone call
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-600" />
            <div>
              <div className="font-medium">
                {call.direction === 'inbound' ? 'Incoming' : 'Outgoing'} Call
              </div>
              <div className="text-sm text-gray-600">
                {call.direction === 'inbound' ? call.caller_number : call.callee_number}
                {call.clients && ` (${call.clients.name})`}
              </div>
              <div className="text-sm text-gray-500">
                Duration: {call.duration ? formatDuration(call.duration) : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client">Client *</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {client.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours *</Label>
              <Input
                id="hours"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Rate ($) *</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                min="0"
                placeholder="350.00"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the work performed during this call..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Log Time"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
