"use client"

import Head from "next/head"
import * as React from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import listPlugin from "@fullcalendar/list"
import type { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core"
import { format, parseISO } from "date-fns"
import { PlusCircle, Trash2 } from "lucide-react"

import { type CalendarEvent } from "@/lib/api"
import { useCalendarEvents, type FullCalendarEvent } from "@/hooks/use-calendar-events"
import { useClients } from "@/hooks/use-clients"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ClientSearch } from "@/components/client-search"
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
import { useToast } from "@/hooks/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"

/* -------------------------------------------------
   1.  Global CSS for FullCalendar
-------------------------------------------------- */
const FullCalendarStyles = () => (
  <Head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.8/main.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.8/main.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fullcalendar/timegrid@6.1.8/main.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fullcalendar/list@6.1.8/main.min.css" />
  </Head>
)

/* -------------------------------------------------
   3.  Event-dialog helper
-------------------------------------------------- */
type EventFormData = {
  id?: string
  title: string
  start: string
  end: string
  allDay: boolean
  clientId: string
  type: string
  description: string
}

function EventDialog({
  isOpen,
  onClose,
  onSave,
  onDelete,
  eventData,
  clients,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (d: EventFormData) => void
  onDelete: (id: string) => void
  eventData: Partial<EventFormData> | null
  clients: any[]
}) {
  const [data, setData] = React.useState<EventFormData>({
    title: "",
    start: "",
    end: "",
    allDay: false,
    clientId: "",
    type: "Meeting",
    description: "",
    ...eventData,
  })

  React.useEffect(() => {
    setData((d) => ({ ...d, ...eventData }))
  }, [eventData])

  const clientSelected = clients.find((c) => c.id === data.clientId) ?? null
  const fmt = (s: string) => (s ? format(parseISO(s), data.allDay ? "yyyy-MM-dd" : "yyyy-MM-dd'T'HH:mm") : "")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{data.id ? "Edit Event" : "Add Event"}</DialogTitle>
          <DialogDescription>{data.id ? "Update event details." : "Create a new calendar entry."}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            {/* Label and Input components are assumed to be imported */}
            <label htmlFor="ev-title">Title</label>
            <Input id="ev-title" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
          </div>

          <div className="grid gap-2">
            {/* Label and ClientSearch components are assumed to be imported */}
            <label>Client</label>
            <ClientSearch
              clients={clients}
              selectedClient={clientSelected}
              onSelectClient={(c) => setData({ ...data, clientId: c?.id || "" })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              {/* Label and Input components are assumed to be imported */}
              <Label>Start</Label>
              <Input
                type={data.allDay ? "date" : "datetime-local"}
                value={fmt(data.start)}
                onChange={(e) => setData({ ...data, start: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              {/* Label and Input components are assumed to be imported */}
              <Label>End</Label>
              <Input
                type={data.allDay ? "date" : "datetime-local"}
                value={fmt(data.end)}
                onChange={(e) => setData({ ...data, end: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Checkbox and Label components are assumed to be imported */}
            <Checkbox checked={data.allDay} onCheckedChange={(e) => setData({ ...data, allDay: !!e })} />{" "}
            <Label>All-day</Label>
          </div>

          <div className="grid gap-2">
            {/* Select, SelectTrigger, SelectValue, and SelectContent components are assumed to be imported */}
            <Label>Type</Label>
            <Select value={data.type} onValueChange={(e) => setData({ ...data, type: e })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {["Meeting", "Deadline", "Court Appearance", "Consultation", "Other"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            {/* Label and Input components are assumed to be imported */}
            <Label>Description</Label>
            <Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} />
          </div>
        </div>

        <DialogFooter>
          {data.id ? (
            <Button type="button" variant="destructive" onClick={() => onDelete(data.id!)} className="mr-auto">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={() => onSave(data)}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------
   4.  Main Calendar Page
-------------------------------------------------- */
export default function CalendarPage() {
  const { events, loading, error, createEvent, updateEvent, deleteEvent } = useCalendarEvents()
  const { clients } = useClients()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [draftEvent, setDraftEvent] = React.useState<Partial<EventFormData> | null>(null)
  const [selectedEvent, setSelectedEvent] = React.useState<FullCalendarEvent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const isMobile = useMediaQuery("(max-width: 768px)")
  const { toast } = useToast()

  /* ----- FC Callbacks ----- */
  const onSelect = (arg: DateSelectArg) => {
    setDraftEvent({ start: arg.startStr, end: arg.endStr, allDay: arg.allDay })
    setDialogOpen(true)
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo.event.toPlainObject() as FullCalendarEvent)
    setIsDialogOpen(true)
  }

  const onEventDrop = async (arg: EventDropArg) => {
    try {
      await updateEvent(arg.event.id, {
        start_time: arg.event.startStr,
        end_time: arg.event.endStr,
      })
    } catch (error) {
      toast({ title: "Failed to update event", variant: "destructive" })
    }
  }

  const handleSave = async (data: EventFormData) => {
    try {
      const eventData = {
        title: data.title,
        description: data.description,
        start_time: data.start,
        end_time: data.end,
        all_day: data.allDay,
        client_id: data.clientId || null,
        matter_id: null,
        location: null,
      }

      if (data.id) {
        const result = await updateEvent(data.id, eventData)
        if (result.success) {
          toast({ title: "Event updated successfully" })
        } else {
          toast({ title: "Failed to update event", variant: "destructive" })
        }
      } else {
        const result = await createEvent(eventData)
        if (result.success) {
          toast({ title: "Event created successfully" })
        } else {
          toast({ title: "Failed to create event", variant: "destructive" })
        }
      }
    } catch (error) {
      toast({ title: "An error occurred", variant: "destructive" })
    }
    
    setDialogOpen(false)
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteEvent(id)
      if (result.success) {
        toast({ title: "Event deleted successfully" })
      } else {
        toast({ title: "Failed to delete event", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "An error occurred", variant: "destructive" })
    }
    
    setDialogOpen(false)
  }

  return (
    <>
      <FullCalendarStyles />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <Button onClick={() => (setDraftEvent({ start: new Date().toISOString() }), setDialogOpen(true))}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </div>

      <Card className="h-[80vh]">
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading events...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-destructive">Error loading events: {error}</div>
            </div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
              }}
              events={events}
              selectable
              editable
              height={isMobile ? "auto" : "100%"}
              select={onSelect}
              eventClick={handleEventClick}
              eventDrop={onEventDrop}
              dayMaxEvents
            />
          )}
        </CardContent>
      </Card>

      <EventDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        eventData={draftEvent}
        clients={clients}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
                <DialogDescription>
                  {selectedEvent.extendedProps.type} for {selectedEvent.extendedProps.clientName}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-2">
                <p>
                  <strong>Time:</strong>{" "}
                  {selectedEvent.allDay
                    ? "All Day"
                    : `${new Date(selectedEvent.start).toLocaleTimeString()} - ${
                        selectedEvent.end ? new Date(selectedEvent.end).toLocaleTimeString() : ""
                      }`}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent.extendedProps.description}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
