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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
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
  const { clients, refetch } = useClients()
  const { toast } = useToast()
  const [clientSearchOpen, setClientSearchOpen] = React.useState(false)
  
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

  React.useEffect(() => {
    const newClientId = sessionStorage.getItem('newClientId')
    if (newClientId && isOpen) {
      refetch().then(() => {
        setData(prev => ({ ...prev, client_id: newClientId }))
        sessionStorage.removeItem('newClientId')
      })
    }
  }, [isOpen, refetch])

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
            <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={clientSearchOpen}
                  className="w-full justify-between"
                >
                  {data.client_id ? clients.find(client => client.id === data.client_id)?.name : "Select client..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Search client..." />
                  <CommandList>
                    <CommandEmpty>
                      <div className="flex flex-col items-center gap-2 py-4">
                        <p className="text-sm text-muted-foreground">No client found.</p>
                        <Button
                          size="sm"
                          onClick={() => {
                            setClientSearchOpen(false)
                            window.location.href = `/clients/new?returnTo=time-entry&context=time-tracking`
                          }}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Client
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.name}
                          onSelect={() => {
                            setData({ ...data, client_id: client.id })
                            setClientSearchOpen(false)
                          }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", data.client_id === client.id ? "opacity-100" : "opacity-0")}
                          />
                          {client.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
