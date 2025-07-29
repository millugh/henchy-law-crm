"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useClients } from "@/hooks/use-clients"
import { useToast } from "@/hooks/use-toast"

type TimeEntryFormData = {
  id?: string
  date: string
  hours: number
  description: string
  rate: number
  client_id: string
  matter_id?: string
}

interface TimeEntryDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: TimeEntryFormData) => void
  timeEntryData?: Partial<TimeEntryFormData> | null
}

export function TimeEntryDialog({
  isOpen,
  onClose,
  onSave,
  timeEntryData,
}: TimeEntryDialogProps) {
  const { clients } = useClients()
  const { toast } = useToast()
  
  const [data, setData] = React.useState<TimeEntryFormData>({
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    description: "",
    rate: 250,
    client_id: "",
    matter_id: "",
    ...timeEntryData,
  })

  React.useEffect(() => {
    setData((d) => ({ ...d, ...timeEntryData }))
  }, [timeEntryData])

  const clientSelected = clients.find((c) => c.id === data.client_id)

  const handleSave = async () => {
    try {
      toast({ title: "Time entry created successfully" })
      onSave(data)
      onClose()
    } catch (error) {
      toast({ title: "An error occurred", variant: "destructive" })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add Time Entry</DialogTitle>
          <DialogDescription>Record billable hours for a client or matter.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={data.date}
              onChange={(e) => setData({ ...data, date: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Client</Label>
            <Select value={data.client_id} onValueChange={(value) => setData({ ...data, client_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                min="0"
                value={data.hours}
                onChange={(e) => setData({ ...data, hours: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rate">Rate ($)</Label>
              <Input
                id="rate"
                type="number"
                min="0"
                value={data.rate}
                onChange={(e) => setData({ ...data, rate: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              placeholder="Describe the work performed..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
