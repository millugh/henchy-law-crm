"use client"

import { DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast" // Import useToast

import * as React from "react"
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Activity,
  BookMarked,
  Check,
  CheckSquare,
  ChevronsUpDown,
  Clock,
  CreditCard,
  DollarSign,
  FilePenLine,
  Folder,
  GanttChartSquare,
  GripVertical,
  Home,
  LayoutGrid,
  Mail,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  USERS,
  contractsInProgress,
  todaysMeetings,
} from "@/lib/data"
import type { Task} from "@/lib/api"
import { CompactMatterList } from "@/components/compact-matter-list"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { useClients } from "@/hooks/use-clients"
import { useTasks } from "@/hooks/use-tasks"
import { useTimeEntries } from "@/hooks/use-time-entries"
import { PhoneDialerCard } from "@/components/phone-dialer-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { cn } from "@/lib/utils"

// Wrapper to make widgets sortable
const SortableWidget = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Pass dnd listeners to the child widget
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {React.cloneElement(children as React.ReactElement, { dndListeners: listeners })}
    </div>
  )
}

// New component to define a droppable column
function DroppableContainer({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className="flex flex-col gap-3">
      {children}
    </div>
  )
}

// Helper component for client selection in dashboard widgets
function DashboardClientSearch({
  clients,
  selectedClient,
  onSelectClient,
  className,
}: {
  clients: any[]
  selectedClient: any
  onSelectClient: (client: any) => void
  className?: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between bg-background font-normal", className)}
        >
          {selectedClient ? selectedClient.name : "Select client..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search client..." />
          <CommandList>
            <CommandEmpty>No client found.</CommandEmpty>
            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.name}
                  onSelect={() => {
                    onSelectClient(client)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", selectedClient?.id === client.id ? "opacity-100" : "opacity-0")}
                  />
                  {client.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const TimeEntryCard = ({ dndListeners, isOverlay = false }: { dndListeners?: any; isOverlay?: boolean }) => {
  const [selectedClient, setSelectedClient] = React.useState<any>(null)
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const { clients, loading: clientsLoading } = useClients()

  return (
    <Card>
      <CardHeader className="p-3 flex flex-row items-center">
        {!isOverlay && (
          <button {...dndListeners} className="cursor-grab p-1 -ml-1 mr-1">
            <GripVertical className="h-5 w-5 text-muted-foreground/60" />
          </button>
        )}
        <Clock className="h-4 w-4 mr-2 text-blue-500" />
        <CardTitle className="text-sm font-semibold text-foreground">Enter Time</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 grid gap-2">
        <DashboardClientSearch clients={clients} selectedClient={selectedClient} onSelectClient={setSelectedClient} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Hours" type="number" step="0.1" className="bg-background" />
          <DatePicker date={date} setDate={setDate} />
        </div>
        <Textarea placeholder="Description..." rows={2} className="bg-background" />
        <Button className="bg-blue-600 text-white hover:bg-blue-600/90 w-full">Submit Entry</Button>
      </CardContent>
    </Card>
  )
}

const CalendarCard = ({ dndListeners, isOverlay = false }: { dndListeners?: any; isOverlay?: boolean }) => {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  return (
    <Card>
      <CardHeader className="p-3 flex flex-row items-center">
        {!isOverlay && (
          <button {...dndListeners} className="cursor-grab p-1 -ml-1 mr-1">
            <GripVertical className="h-5 w-5 text-muted-foreground/60" />
          </button>
        )}
        <CardTitle className="text-sm font-semibold text-foreground">Calendar</CardTitle>
      </CardHeader>
      <CardContent className="p-1 overflow-hidden">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="w-full"
          classNames={{
            months: "w-full",
            month: "w-full space-y-1",
            table: "w-full border-collapse",
            head_row: "flex w-full",
            row: "flex w-full mt-1",
            head_cell: "flex-1 text-muted-foreground rounded-md font-normal text-[0.8rem] text-center h-8",
            cell: "flex-1 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(buttonVariants({ variant: "ghost" }), "w-full h-8 p-0 font-normal aria-selected:opacity-100"),
            day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
            day_today: "bg-accent text-accent-foreground",
            caption_label: "text-sm",
          }}
        />
      </CardContent>
    </Card>
  )
}

const MeetingsCard = ({ dndListeners, isOverlay = false }: { dndListeners?: any; isOverlay?: boolean }) => (
  <Card>
    <CardHeader className="p-3 flex flex-row items-center">
      {!isOverlay && (
        <button {...dndListeners} className="cursor-grab p-1 -ml-1 mr-1">
          <GripVertical className="h-5 w-5 text-muted-foreground/60" />
        </button>
      )}
      <CardTitle className="text-sm font-semibold text-foreground">Today's Meetings</CardTitle>
    </CardHeader>
    <CardContent className="p-3 pt-0 grid gap-3">
      {todaysMeetings.map((meeting, index) => (
        <div key={index} className="flex items-start gap-3">
          <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-xs font-medium text-foreground">{meeting.title}</p>
            <p className="text-[10px] text-muted-foreground">{meeting.time}</p>
          </div>
          <div className="flex -space-x-2">
            {meeting.attendees.map((attendee) => (
              <Avatar key={attendee} className="h-5 w-5 border-2 border-background">
                <AvatarFallback className="text-[10px]">
                  {attendee
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
)

const AddClientDialog = ({ onAddClient }: { onAddClient: (client: any) => void }) => {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [logoUrl, setLogoUrl] = React.useState("")
  const [description, setDescription] = React.useState("")

  const handleSubmit = () => {
    if (!name || !description) return
    onAddClient({
      id: `client-${Date.now()}`,
      name,
      logoUrl,
      description,
    })
    setOpen(false)
    setName("")
    setLogoUrl("")
    setDescription("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Key Client</DialogTitle>
          <DialogDescription>Add a new client to your key clients list.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="logoUrl" className="text-right">
              Logo URL
            </Label>
            <Input
              id="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="col-span-3"
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add Client</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const ClientCard = ({
  id,
  name,
  logoUrl,
  description,
  logoClassName,
  avatarClassName,
}: {
  id: string
  name: string
  logoUrl?: string
  description: string
  logoClassName?: string
  avatarClassName?: string
}) => (
  <Card className="hover:bg-secondary/50">
    <CardContent className="p-3 flex items-center gap-3">
      <Avatar className={cn("h-10 w-10 border", avatarClassName)}>
        <AvatarImage src={logoUrl || "/placeholder.svg"} className={logoClassName} />
        <AvatarFallback>{name.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground leading-tight">{name}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" size="sm" className="h-8 bg-transparent hover:bg-accent" asChild>
        <Link href={`/clients/${id}`}>View</Link>
      </Button>
    </CardContent>
  </Card>
)

const KeyClientsCard = ({
  clients = [],
  setClients = () => {},
  dndListeners,
  isOverlay = false,
}: {
  clients?: any[]
  setClients?: (clients: any[]) => void
  dndListeners?: any
  isOverlay?: boolean
}) => {
  const { clients: apiClients, loading: clientsLoading, error: clientsError } = useClients()
  
  const handleAddClient = (newClient: any) => {
    setClients([...clients, newClient])
  }

  const displayClients = clients.length > 0 ? clients : apiClients.slice(0, 5).map(client => ({
    id: client.id,
    name: client.name,
    lastContact: new Date(client.lastInteraction).toLocaleDateString(),
    revenue: 0
  }))

  return (
    <Card>
      <CardHeader className="p-3 flex flex-row items-center gap-2">
        {!isOverlay && (
          <button {...dndListeners} className="cursor-grab p-1 -ml-1">
            <GripVertical className="h-5 w-5 text-muted-foreground/60" />
          </button>
        )}
        <CardTitle className="text-sm font-semibold text-foreground flex-1">Key Clients</CardTitle>
        <AddClientDialog onAddClient={handleAddClient} />
      </CardHeader>
      <CardContent className="p-3 pt-0 flex flex-col gap-2">
        {clientsLoading ? (
          <div className="text-center py-4 text-sm text-gray-500">Loading clients...</div>
        ) : clientsError ? (
          <div className="text-center py-4 text-sm text-red-500">Failed to load clients</div>
        ) : displayClients.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">No clients found</div>
        ) : (
          displayClients.map((client) => (
            <ClientCard key={client.id} {...client} />
          ))
        )}
      </CardContent>
    </Card>
  )
}

const TasksCard = ({
  tasks,
  updateTask,
  dndListeners,
  isOverlay = false,
}: {
  tasks: Task[]
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>
  dndListeners?: any
  isOverlay?: boolean
}) => {
  const handleTaskToggle = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed'
      try {
        await updateTask(taskId, { status: newStatus })
      } catch (error) {
        console.error('Failed to update task:', error)
      }
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center p-3">
        {!isOverlay && (
          <button {...dndListeners} className="cursor-grab p-1 -ml-1 mr-1">
            <GripVertical className="h-5 w-5 text-muted-foreground/60" />
          </button>
        )}
        <CheckSquare className="h-4 w-4 mr-2 text-primary" />
        <CardTitle className="text-sm font-semibold text-foreground flex-1">Tasks</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-3 pt-0 grid gap-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center space-x-2 p-1 rounded-md hover:bg-accent">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.status === 'completed'}
              onCheckedChange={() => handleTaskToggle(task.id)}
            />
            <div className="grid gap-1.5 leading-none flex-1">
              <Label
                htmlFor={`task-${task.id}`}
                className={cn(
                  "text-xs font-medium cursor-pointer",
                  task.status === 'completed' && "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </Label>
              <p className="text-[10px] text-muted-foreground">{task.clients?.name || 'No client'}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

const NewNoteCard = ({
  dndListeners,
  isOverlay = false,
}: {
  dndListeners?: any
  isOverlay?: boolean
}) => {
  const router = useRouter()

  const handleNewNote = () => {
    router.push('/notes')
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center p-3">
        {!isOverlay && (
          <button {...dndListeners} className="cursor-grab p-1 -ml-1 mr-1">
            <GripVertical className="h-5 w-5 text-muted-foreground/60" />
          </button>
        )}
        <FilePenLine className="h-4 w-4 mr-2 text-yellow-600" />
        <CardTitle className="text-sm font-semibold text-foreground flex-1">Notes</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-4">Create and manage your notes with rich text formatting</p>
          <Button 
            onClick={handleNewNote}
            className="bg-yellow-600 text-white hover:bg-yellow-600/90"
          >
            <FilePenLine className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const ActivityFeedCard = ({
  activities,
  dndListeners,
  isOverlay = false,
}: {
  activities: any[]
  dndListeners?: any
  isOverlay?: boolean
}) => (
  <Card>
    <CardHeader className="p-3 flex flex-row items-center">
      {!isOverlay && (
        <button {...dndListeners} className="cursor-grab p-1 -ml-1 mr-1">
          <GripVertical className="h-5 w-5 text-muted-foreground/60" />
        </button>
      )}
      <Activity className="h-4 w-4 mr-2 text-green-500" />
      <CardTitle className="text-sm font-semibold text-foreground">Activity Feed</CardTitle>
    </CardHeader>
    <CardContent className="p-3 pt-0 grid gap-3 max-h-96 overflow-y-auto min-h-0">
      {activities.length > 0 ? (
        activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <Avatar className="h-8 w-8 border">
              <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
              <AvatarFallback>{activity.user.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{activity.user.name}</span>
                {activity.clientName ? ` added a note for ${activity.clientName}` : " added a note"}
              </p>
              <p className="text-sm bg-muted/50 p-2 rounded-md mt-1">{activity.description}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{activity.timestamp}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
      )}
    </CardContent>
  </Card>
)

const quickAccessItems = [
  { title: "Real Estate", icon: Home, href: "/matters/real-estate" },
  { title: "Title Policies", icon: ShieldCheck, href: "/matters/title-policy" },
  { title: "Successions", icon: BookMarked, href: "/matters/wills-successions" },
  { title: "Contracts", icon: GanttChartSquare, href: "/contract-templates" },
  { title: "Letters", icon: Mail, href: "/letter-templates" },
  { title: "Documents", icon: Folder, href: "/documents" },
]

const QuickAccessWidget = ({ title, icon: Icon, href }: { title: string; icon: React.ElementType; href: string }) => (
  <Link href={href} passHref>
    <Card
      as="a"
      className="aspect-square flex flex-col items-center justify-center text-center p-2 hover:bg-accent cursor-pointer transition-colors"
    >
      <Icon className="h-7 w-7 mb-2 text-primary" />
      <p className="text-xs font-semibold text-foreground leading-tight">{title}</p>
    </Card>
  </Link>
)

const QuickAccessGrid = ({ dndListeners, isOverlay = false }: { dndListeners?: any; isOverlay?: boolean }) => (
  <Card>
    <CardHeader className="p-3 flex flex-row items-center">
      {!isOverlay && (
        <button {...dndListeners} className="cursor-grab p-1 -ml-1 mr-1">
          <GripVertical className="h-5 w-5 text-muted-foreground/60" />
        </button>
      )}
      <CardTitle className="text-sm font-semibold text-foreground">Quick Access</CardTitle>
    </CardHeader>
    <CardContent className="p-3 pt-0 grid grid-cols-3 gap-2">
      {quickAccessItems.map((item) => (
        <QuickAccessWidget key={item.title} {...item} />
      ))}
    </CardContent>
  </Card>
)

const StatsCards = () => {
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats()
  
  const statsCardsData = [
    {
      title: "Active Matters",
      value: statsLoading ? "..." : statsError ? "Error" : stats?.activeMatters?.toString() || "0",
      change: statsError ? "Failed to load" : "Active cases",
      icon: Activity,
    },
    {
      title: "Billable Hours (Month)",
      value: statsLoading ? "..." : statsError ? "Error" : stats?.totalBillableHours?.toString() || "0",
      change: statsError ? "Failed to load" : "Total hours",
      icon: DollarSign,
    },
    {
      title: "Unbilled Revenue",
      value: statsLoading ? "..." : statsError ? "Error" : `$${stats?.unbilledRevenue?.toLocaleString() || 0}`,
      change: statsError ? "Failed to load" : "Ready to invoice",
      icon: CreditCard,
    },
    {
      title: "New Clients (YTD)",
      value: statsLoading ? "..." : statsError ? "Error" : stats?.newClients?.toString() || "0",
      change: statsError ? "Failed to load" : "This month",
      icon: Users,
    },
  ]

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {statsCardsData.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

type Layout = {
  [key: string]: string[]
}

type SavedLayout = { name: string; layout: Layout }
type KeyClient = { id: string; name: string; logoUrl?: string; description: string }

const ContractsInProgressWidget = ({
  dndListeners,
  isOverlay = false,
}: { dndListeners?: any; isOverlay?: boolean }) => (
  <CompactMatterList
    title="Contracts In Progress"
    matters={contractsInProgress}
    viewAllLink="/contract-templates"
    dndListeners={dndListeners}
    isOverlay={isOverlay}
  />
)

const PhoneDialerWidget = ({ dndListeners, isOverlay = false }: { dndListeners?: any; isOverlay?: boolean }) => (
  <PhoneDialerCard dndListeners={dndListeners} isOverlay={isOverlay} />
)

const widgetsMap: Record<string, React.FC<any>> = {
  "time-entry": TimeEntryCard,
  calendar: CalendarCard,
  meetings: MeetingsCard,
  "contracts-in-progress": ContractsInProgressWidget,
  dialer: PhoneDialerWidget,
  tasks: TasksCard,
  "new-note": NewNoteCard,
  "quick-access": QuickAccessGrid,
  clients: KeyClientsCard,
  "activity-feed": ActivityFeedCard,
}

const initialLayout: Layout = {
  col1: ["time-entry", "new-note", "tasks"],
  col2: ["clients", "contracts-in-progress"],
  col3: ["calendar", "meetings", "dialer", "quick-access", "activity-feed"],
}

export default function Dashboard() {
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats()
  const { clients, loading: clientsLoading, error: clientsError } = useClients()
  const { tasks, loading: tasksLoading, error: tasksError, updateTask } = useTasks()
  const [layout, setLayout] = React.useState<Layout>(initialLayout)
  const [keyClients, setKeyClients] = React.useState<KeyClient[]>([])
  const [activities, setActivities] = React.useState<any[]>([])
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [activeRect, setActiveRect] = React.useState(null)
  const [savedLayouts, setSavedLayouts] = React.useState<SavedLayout[]>([])
  const [currentLayoutName, setCurrentLayoutName] = React.useState<string | null>(null)
  const [layoutName, setLayoutName] = React.useState("")
  const [isSaveDialogOpen, setIsSaveDialogOpen] = React.useState(false)
  const [isManageDialogOpen, setIsManageDialogOpen] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    try {
      const storedLayouts = localStorage.getItem("dashboardLayouts")
      if (storedLayouts) setSavedLayouts(JSON.parse(storedLayouts))

      const storedClients = localStorage.getItem("dashboardKeyClients")
      if (storedClients) {
        setKeyClients(JSON.parse(storedClients))
      } else if (clients.length > 0) {
        const topClients = clients.slice(0, 5).map(client => ({
          id: client.id,
          name: client.name,
          lastContact: new Date(client.lastInteraction).toLocaleDateString(),
          revenue: 0
        }))
        setKeyClients(topClients)
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error)
      toast({
        title: "Error",
        description: "Could not load data from your browser's storage.",
        variant: "destructive",
      })
    }
  }, [toast, clients])

  const setAndPersistKeyClients = (clients: KeyClient[]) => {
    setKeyClients(clients)
    localStorage.setItem("dashboardKeyClients", JSON.stringify(clients))
  }

  const handleAddTask = ({ description, clientName }: { description: string; clientName: string }) => {
    const newTask: Task = {
      id: `TASK-${Date.now()}`,
      description,
      clientName,
      completed: false,
    }
    setTasks((prev) => [newTask, ...prev])
  }

  const handleAddActivity = ({ description, clientName }: { description: string; clientName?: string }) => {
    const newActivity = {
      id: `ACT-${Date.now()}`,
      user: USERS[0], // Assume current user is John Henchy
      description,
      clientName,
      timestamp: new Date().toLocaleString(),
    }
    setActivities((prev) => [newActivity, ...prev])
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const findContainer = (id: string) => {
    if (id in layout) {
      return id
    }
    return Object.keys(layout).find((key) => layout[key].includes(id))
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setActiveRect(event.active.rect.current.initial)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveRect(null)

    if (!over) {
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) {
      return
    }

    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId)

    if (!activeContainer || !overContainer) {
      return
    }

    if (activeContainer === overContainer) {
      // Moving within the same column
      const activeIndex = layout[activeContainer].indexOf(activeId)
      const overIndex = layout[overContainer].indexOf(overId)

      if (activeIndex !== overIndex) {
        setLayout((prev) => ({
          ...prev,
          [overContainer]: arrayMove(prev[overContainer], activeIndex, overIndex),
        }))
      }
    } else {
      // Moving to a different column
      setLayout((prev) => {
        const activeItems = [...prev[activeContainer]]
        const overItems = [...prev[overContainer]]

        const activeIndex = activeItems.indexOf(activeId)
        const overIndex = overItems.indexOf(overId)

        const [movedItem] = activeItems.splice(activeIndex, 1)

        const newOverItems = [...overItems]
        if (overIndex >= 0) {
          newOverItems.splice(overIndex, 0, movedItem)
        } else {
          // Dropping on the container itself
          newOverItems.push(movedItem)
        }

        return {
          ...prev,
          [activeContainer]: activeItems,
          [overContainer]: newOverItems,
        }
      })
    }
  }

  const handleSave = () => {
    if (!currentLayoutName) {
      toast({ title: "Error", description: "No layout is currently loaded to save.", variant: "destructive" })
      return
    }
    const newSavedLayouts = savedLayouts.map((l) => (l.name === currentLayoutName ? { ...l, layout: layout } : l))
    setSavedLayouts(newSavedLayouts)
    localStorage.setItem("dashboardLayouts", JSON.stringify(newSavedLayouts))
    toast({ title: "Success", description: `Layout "${currentLayoutName}" updated.` })
  }

  const handleSaveLayoutAs = () => {
    if (!layoutName) {
      toast({ title: "Error", description: "Please enter a name for the layout.", variant: "destructive" })
      return
    }
    const newSavedLayouts = [...savedLayouts.filter((l) => l.name !== layoutName), { name: layoutName, layout }]
    setSavedLayouts(newSavedLayouts)
    localStorage.setItem("dashboardLayouts", JSON.stringify(newSavedLayouts))
    setCurrentLayoutName(layoutName)
    toast({ title: "Success", description: `Layout "${layoutName}" saved.` })
    setIsSaveDialogOpen(false)
    setLayoutName("")
  }

  const handleLoadLayout = (name: string) => {
    const layoutToLoad = savedLayouts.find((l) => l.name === name)
    if (layoutToLoad) {
      setLayout(layoutToLoad.layout)
      setCurrentLayoutName(name)
      toast({ title: "Success", description: `Layout "${name}" loaded.` })
    } else {
      toast({ title: "Error", description: "Layout not found.", variant: "destructive" })
    }
  }

  const handleDeleteLayout = (name: string) => {
    const newSavedLayouts = savedLayouts.filter((l) => l.name !== name)
    setSavedLayouts(newSavedLayouts)
    localStorage.setItem("dashboardLayouts", JSON.stringify(newSavedLayouts))

    if (currentLayoutName === name) {
      setCurrentLayoutName(null)
      setLayout(initialLayout)
      toast({ title: "Success", description: `Layout "${name}" deleted. Reverted to default layout.` })
    } else {
      toast({ title: "Success", description: `Layout "${name}" deleted.` })
    }
  }

  const handleResetLayout = () => {
    setLayout(initialLayout)
    setCurrentLayoutName(null)
    toast({ title: "Success", description: "Layout reset to default." })
  }

  const renderWidget = (id: string, props = {}) => {
    const Widget = widgetsMap[id]
    if (!Widget) return null

    const allProps: { [key: string]: any } = { ...props }
    if (id === "clients") {
      allProps.clients = keyClients
      allProps.setClients = setAndPersistKeyClients
    }
    if (id === "tasks") {
      allProps.tasks = tasks
      allProps.updateTask = updateTask
    }
    if (id === "new-note") {
    }
    if (id === "activity-feed") {
      allProps.activities = activities
    }

    return <Widget {...allProps} />
  }

  return (
    <>
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Layout As</DialogTitle>
            <DialogDescription>Enter a new name for the current dashboard layout.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="name"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              placeholder="e.g., My Morning View"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLayoutAs}>Save As</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Layouts</DialogTitle>
            <DialogDescription>You can delete your saved layouts here.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4 max-h-64 overflow-y-auto">
            {savedLayouts.length > 0 ? (
              savedLayouts.map((sl) => (
                <div key={sl.name} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                  <p className="text-sm font-medium">{sl.name}</p>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteLayout(sl.name)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Delete layout</span>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No saved layouts.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Layouts
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onSelect={handleSave} disabled={!currentLayoutName}>
                Save
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsSaveDialogOpen(true)}>Save As...</DropdownMenuItem>
              {savedLayouts.length > 0 && (
                <DropdownMenuItem onSelect={() => setIsManageDialogOpen(true)}>Manage Layouts...</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Load Layout</DropdownMenuLabel>
              {savedLayouts.length > 0 ? (
                savedLayouts.map((sl) => (
                  <DropdownMenuItem key={sl.name} onSelect={() => handleLoadLayout(sl.name)}>
                    {sl.name}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No saved layouts</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleResetLayout}>Reset to Default</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <StatsCards />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
            {Object.keys(layout).map((colKey) => (
              <DroppableContainer key={colKey} id={colKey}>
                <SortableContext items={layout[colKey]} strategy={verticalListSortingStrategy}>
                  {layout[colKey].map((id) => (
                    <SortableWidget key={id} id={id}>
                      {renderWidget(id)}
                    </SortableWidget>
                  ))}
                </SortableContext>
              </DroppableContainer>
            ))}
          </div>
          <DragOverlay>
            {activeId && activeRect ? (
              <div style={{ width: activeRect.width, height: activeRect.height }}>
                {renderWidget(activeId, { isOverlay: true })}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </>
  )
}
