import {
  BookUser,
  Briefcase,
  Building2,
  FileText,
  Gavel,
  Landmark,
  Scale,
  ScrollText,
  Calendar,
  Clock,
  HelpCircle,
  Home,
  LineChart,
  Settings,
  Users,
  CheckSquare,
} from "lucide-react"

export type { FileSystemItem } from "./file-system-data"
export { fileSystemItems } from "./file-system-data"

export type ActivityEvent = {
  id: string
  type: "note" | "call" | "email" | "meeting" | "document" | "task" | "update"
  description: string
  details?: string
  user: string
  timestamp: string
}

export type User = {
  name: string
  email: string
  avatar: string
}

export interface Meeting {
  id: string
  title: string
  time: string
  attendees: string[]
  client?: string
}

export interface Breadcrumb {
  id: string
  name: string
}

export type Client = {
  id: string
  name: string
  status: "Active" | "Inactive" | "Prospect"
  lastInteraction: string
  practiceAreas: string[]
  logoUrl?: string
}

export type PracticeArea = {
  name: string
  description: string
  clientCount: number
}

export type Matter = {
  id: string
  clientName: string
  matterType: string
  status: "Open" | "Closed" | "Pending"
  openDate: string
  [key: string]: unknown
}

export type TimeEntry = {
  id: string
  date: string
  clientName: string
  hours: number
  description: string
  billed: boolean
}

export type Task = {
  id: string
  description: string
  clientName: string
  completed: boolean
}

export type RealEstateMatter = {
  id: string
  name: string
  propertyAddress: string
  status: string
  clientId: string
  clientName: string
  description: string
}

export type Document = {
  name: string
  type: string
  size: string
  modified: string
  url: string
}

export type TimelineActivity = {
  id: string
  user: string
  avatar: string
  activity: string
  timestamp: string
}

export type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  color?: string
}

export type TitlePolicyMatter = {
  id: string
  policyNumber: string
  propertyAddress: string
  insuredParties: string
  coverageAmount: number
  status: string
  clientId: string
  clientName: string
  description?: string
}

export type WillsSuccessionMatter = {
  id: string
  name: string
  status: "Drafting" | "Executed" | "Filed" | "Awaiting Judgment" | "Closed"
  clientId: string
  clientName: string
  decedentName: string
  dateOfDeath?: string
  keyBeneficiaries: string
  description?: string
}

export const USERS: User[] = [
  { name: "John Henchy", email: "jlh@johnhenchylaw.com", avatar: "/avatars/john-henchy.jpg" },
  { name: "Samantha Riley", email: "samantha@henchylaw.com", avatar: "/avatars/samantha.jpg" },
  { name: "David Chen", email: "david@henchylaw.com", avatar: "/avatars/david.jpg" },
]

export const CLIENTS: Client[] = [
  {
    id: "1",
    name: "E.P. Breaux Utility Services, LLC",
    status: "Active",
    lastInteraction: "2024-07-15",
    practiceAreas: ["Corporate", "Real Estate"],
    logoUrl: "/ep-breaux-logo.png",
  },
  {
    id: "2",
    name: "Hancock Whitney Bank",
    status: "Active",
    lastInteraction: "2024-07-12",
    practiceAreas: ["Banking", "Litigation"],
    logoUrl: "/hancock-whitney-bank-logo.png",
  },
  {
    id: "3",
    name: "Red River Bank",
    status: "Active",
    lastInteraction: "2024-07-10",
    practiceAreas: ["Banking"],
    logoUrl: "/red-river-bank-logo.png",
  },
  {
    id: "4",
    name: "Community Behavioral Healthcare, LLC",
    status: "Active",
    lastInteraction: "2024-07-09",
    practiceAreas: ["Healthcare"],
    logoUrl: "/community-behavioral-logo.png",
  },
  {
    id: "5",
    name: "Harmony Center, Inc.",
    status: "Inactive",
    lastInteraction: "2024-05-20",
    practiceAreas: ["Non-profit", "Healthcare"],
    logoUrl: "/harmony-center-logo.png",
  },
  {
    id: "6",
    name: "3CX",
    status: "Prospect",
    lastInteraction: "2024-07-18",
    practiceAreas: ["Technology"],
    logoUrl: "/3cx-logo.png",
  },
]

// ---------------------------------------------------------------------------
//  Dashboard widgets – Key Clients + Contracts in Progress
// ---------------------------------------------------------------------------

export const KEY_CLIENTS_DATA = [
  {
    id: "ep-breaux",
    name: "E.P. Breaux Utility Services, LLC",
    logoUrl: "/ep-breaux-logo.png",
    description: "Utility and construction contracts.",
    logoClassName: "object-contain p-1",
    avatarClassName: "bg-white",
  },
  {
    id: "harmony-center",
    name: "Harmony Center, Inc.",
    logoUrl: "/harmony-center-logo.png",
    description: "Healthcare facility transactions.",
    logoClassName: "object-contain p-1",
    avatarClassName: "bg-white",
  },
  {
    id: "red-river-bank",
    name: "Red River Bank",
    logoUrl: "/red-river-bank-logo.png",
    description: "Commercial banking and loans.",
    logoClassName: "object-contain p-1",
    avatarClassName: "bg-white",
  },
  {
    id: "hancock-whitney",
    name: "Hancock Whitney",
    logoUrl: "/hancock-whitney-bank-logo.png",
    description: "Regional banking services.",
  },
  {
    id: "community-behavioral",
    name: "Community Behavioral Healthcare, LLC",
    logoUrl: "/community-behavioral-logo.png",
    description: "Behavioral health services and contracts.",
    logoClassName: "object-contain p-1",
    avatarClassName: "bg-white",
  },
]

export const contractsInProgress = [
  { id: "CTR-001", name: "MSA – Tech Solutions Inc.", status: "Review", clientId: "ep-breaux" },
  { id: "CTR-002", name: "Lease – Downtown Office", status: "Negotiation", clientId: "harmony-center" },
  { id: "CTR-003", name: "Partnership – Innovate Co.", status: "Drafting", clientId: "red-river-bank" },
  { id: "CTR-004", name: "Employment – J. Smith", status: "Awaiting Signature", clientId: "community-behavioral" },
]

// ---------------------------------------------------------------------------
//  Dashboard widget – My Tasks
// ---------------------------------------------------------------------------
export const tasks: Task[] = [
  {
    id: "TASK-001",
    description: "Draft response to discovery request",
    clientName: "E.P. Breaux Utility Services, LLC",
    completed: false,
  },
  {
    id: "TASK-002",
    description: "Follow up on title commitment",
    clientName: "Hancock Whitney Bank",
    completed: false,
  },
  {
    id: "TASK-003",
    description: "Schedule final walkthrough",
    clientName: "Red River Bank",
    completed: true,
  },
  {
    id: "TASK-004",
    description: "Prepare for deposition",
    clientName: "Community Behavioral Healthcare, LLC",
    completed: false,
  },
  {
    id: "TASK-005",
    description: "Review loan documents",
    clientName: "Harmony Center, Inc.",
    completed: false,
  },
]

export const PRACTICE_AREAS: PracticeArea[] = [
  { name: "Corporate", description: "General corporate law and governance.", clientCount: 12 },
  { name: "Real Estate", description: "Commercial and residential real estate transactions.", clientCount: 8 },
  { name: "Litigation", description: "Civil litigation and dispute resolution.", clientCount: 5 },
  { name: "Banking", description: "Regulatory compliance and financial transactions.", clientCount: 3 },
  { name: "Healthcare", description: "Healthcare regulations and compliance.", clientCount: 4 },
  { name: "Non-profit", description: "Legal services for non-profit organizations.", clientCount: 2 },
  { name: "Technology", description: "Tech-related legal matters, including IP.", clientCount: 1 },
]

export const MATTERS: Matter[] = [
  {
    id: "M001",
    clientName: "E.P. Breaux Utility Services, LLC",
    matterType: "Real Estate",
    status: "Open",
    openDate: "2024-06-01",
    propertyAddress: "123 Main St, Anytown, USA",
  },
  {
    id: "M002",
    clientName: "Hancock Whitney Bank",
    matterType: "Title Policy",
    status: "Open",
    openDate: "2024-06-15",
    policyNumber: "HW-2024-589",
  },
  {
    id: "M003",
    clientName: "Community Behavioral Healthcare, LLC",
    matterType: "Wills & Successions",
    status: "Pending",
    openDate: "2024-07-01",
    testator: "John Doe",
  },
  {
    id: "M004",
    clientName: "Red River Bank",
    matterType: "Litigation",
    status: "Closed",
    openDate: "2023-01-20",
  },
]

export const TIME_ENTRIES: TimeEntry[] = [
  {
    id: "T001",
    date: "2024-07-15",
    clientName: "E.P. Breaux Utility Services, LLC",
    hours: 2.5,
    description: "Drafting purchase agreement for new property.",
    billed: false,
  },
  {
    id: "T002",
    date: "2024-07-15",
    clientName: "Hancock Whitney Bank",
    hours: 1.0,
    description: "Conference call with opposing counsel.",
    billed: false,
  },
  {
    id: "T003",
    date: "2024-07-14",
    clientName: "Red River Bank",
    hours: 3.0,
    description: "Reviewing discovery documents.",
    billed: true,
  },
]

export const DOCUMENTS: Document[] = [
  {
    name: "Purchase Agreement - 123 Main St.pdf",
    type: "PDF",
    size: "2.1 MB",
    modified: "2024-07-15",
    url: "/documents/purchase-agreement.pdf",
  },
  {
    name: "Title Policy HW-2024-589.pdf",
    type: "PDF",
    size: "850 KB",
    modified: "2024-07-12",
    url: "/documents/title-policy.pdf",
  },
  {
    name: "Client Intake Form - CBH.docx",
    type: "Word Document",
    size: "120 KB",
    modified: "2024-07-09",
    url: "/documents/intake-form.docx",
  },
]

// =====================================
// Recent Calls (mock data for dialer)
// =====================================
export const recentCalls = [
  {
    name: "John Smith",
    number: "(555) 876-5432",
    type: "incoming",
    time: "10m ago",
  },
  {
    name: "Jane Doe",
    number: "(555) 123-4567",
    type: "outgoing",
    time: "1h ago",
  },
  {
    name: "Unknown Caller",
    number: "(555) 999-8888",
    type: "missed",
    time: "3h ago",
  },
  {
    name: "E.P. Breaux",
    number: "(555) 222-3333",
    type: "incoming",
    time: "yesterday",
  },
]

// =====================================
// Today's Meetings (mock data)
// =====================================
export const todaysMeetings = [
  {
    time: "10:00 AM",
    title: "Closing ‒ 123 Main St",
    attendees: ["John Henchy", "Samantha Riley"],
  },
  {
    time: "1:30 PM",
    title: "Deposition ‒ Smith v. Jones",
    attendees: ["David Chen", "Litigation Team"],
  },
  {
    time: "4:00 PM",
    title: "Client Intake ‒ New Startup Co.",
    attendees: ["John Henchy"],
  },
]

export const TIMELINE_ACTIVITIES: TimelineActivity[] = [
  {
    id: "A001",
    user: "John Henchy",
    avatar: "/avatars/john-henchy.jpg",
    activity: "Created matter M001 for E.P. Breaux Utility Services, LLC.",
    timestamp: "2024-06-01T09:00:00Z",
  },
  {
    id: "A002",
    user: "Samantha Riley",
    avatar: "/avatars/samantha.jpg",
    activity: "Uploaded document 'Purchase Agreement - 123 Main St.pdf'.",
    timestamp: "2024-06-02T14:30:00Z",
  },
  {
    id: "A003",
    user: "David Chen",
    avatar: "/avatars/david.jpg",
    activity: "Added note to matter M002: 'Client requested expedited review.'",
    timestamp: "2024-06-16T11:00:00Z",
  },
]

export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "E001",
    title: "Deposition: Smith v. Jones",
    start: new Date(2024, 6, 25, 10, 0),
    end: new Date(2024, 6, 25, 13, 0),
    color: "hsl(var(--chart-1))",
  },
  {
    id: "E002",
    title: "Real Estate Closing: 123 Main St",
    start: new Date(2024, 6, 26, 14, 0),
    end: new Date(2024, 6, 26, 15, 0),
    color: "hsl(var(--chart-2))",
  },
  {
    id: "E003",
    title: "Court Hearing: State v. Johnson",
    start: new Date(2024, 7, 2, 9, 0),
    end: new Date(2024, 7, 2, 12, 0),
    color: "hsl(var(--chart-3))",
  },
  {
    id: "E004",
    title: "Firm Holiday",
    start: new Date(2024, 8, 2),
    end: new Date(2024, 8, 2),
    allDay: true,
    color: "hsl(var(--chart-4))",
  },
]

export const SIDEBAR_NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Landmark,
  },
  {
    title: "Matters",
    href: "/matters",
    icon: Briefcase,
    subItems: [
      { title: "Real Estate", href: "/matters/real-estate", icon: Building2 },
      { title: "WFG Title Policies", href: "/matters/title-policy", icon: FileText },
      { title: "Wills & Successions", href: "/matters/wills-successions", icon: ScrollText },
    ],
  },
  {
    title: "Clients",
    href: "/clients",
    icon: BookUser,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "Time & Billing",
    href: "/time-tracking",
    icon: Scale,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: Gavel,
  },
]

// Top-level navigation used by the header / main Nav component
export const mainNavLinks = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Clients", href: "/clients", icon: Users },
  { title: "Matters", href: "/matters", icon: Briefcase },
  { title: "Time Tracking", href: "/time-tracking", icon: Clock },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Documents", href: "/documents", icon: FileText },
  { title: "Reports", href: "/reports", icon: LineChart },
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Help", href: "/help", icon: HelpCircle },
]

// ---------------------------------------------------------------------------
//  Practice-area pages – Real Estate Matters
// ---------------------------------------------------------------------------
export const realEstateMatters: RealEstateMatter[] = [
  {
    id: "MAT-013",
    name: "Sale of 123 Main St",
    propertyAddress: "123 Main St, Baton Rouge, LA 70808",
    status: "Closing",
    clientId: "ep-breaux",
    clientName: "E.P. Breaux Utility Services, LLC",
    description: "Closing scheduled for next week. All documents have been prepared.",
  },
  {
    id: "MAT-014",
    name: "Purchase of Lot 45",
    propertyAddress: "Lot 45, Oak Hills Subdivision, Prairieville, LA 70769",
    status: "Under Contract",
    clientId: "harmony-center",
    clientName: "Harmony Center, Inc.",
    description: "Awaiting inspection reports before proceeding.",
  },
  {
    id: "MAT-015",
    name: "Commercial Lease – Downtown",
    propertyAddress: "459 Lafayette St, Baton Rouge, LA 70801",
    status: "Negotiation",
    clientId: "red-river-bank",
    clientName: "Red River Bank",
    description: "Reviewing tenant’s proposed changes to the lease agreement.",
  },
]

// ---------------------------------------------------------------------------
//  Practice-area pages – Title Policy Matters
// ---------------------------------------------------------------------------

export const titlePolicyMatters: TitlePolicyMatter[] = [
  {
    id: "TPM-001",
    policyNumber: "HW-2024-589",
    propertyAddress: "456 Oak Ave, Baton Rouge, LA 70808",
    insuredParties: "John & Jane Smith",
    coverageAmount: 350_000,
    status: "Issued",
    clientId: "hancock-whitney",
    clientName: "Hancock Whitney Bank",
    description: "Policy issued and delivered to lender.",
  },
  {
    id: "TPM-002",
    policyNumber: "RRB-2024-112",
    propertyAddress: "789 Pine Ln, Prairieville, LA 70769",
    insuredParties: "Developer Group LLC",
    coverageAmount: 1_200_000,
    status: "Pending",
    clientId: "red-river-bank",
    clientName: "Red River Bank",
    description: "Awaiting survey before issuing policy.",
  },
  {
    id: "TPM-003",
    policyNumber: "WFG-2024-105",
    propertyAddress: "123 Main St, Gonzales, LA 70737",
    insuredParties: "Commercial Holdings Inc.",
    coverageAmount: 750_000,
    status: "In Review",
    clientId: "community-behavioral",
    clientName: "Community Behavioral Healthcare, LLC",
    description: "Examiner reviewing title exceptions.",
  },
]

export const willsSuccessionMatters: WillsSuccessionMatter[] = [
  {
    id: "WSM-001",
    name: "Succession of Jane Doe",
    status: "Filed",
    clientId: "4", // Community Behavioral
    clientName: "Community Behavioral Healthcare, LLC",
    decedentName: "Jane M. Doe",
    dateOfDeath: "2024-05-15",
    keyBeneficiaries: "John Doe Jr. (Son), Emily Doe (Daughter)",
    description: "Petition for Possession filed; waiting on judgment.",
  },
  {
    id: "WSM-002",
    name: "Last Will of Robert Smith",
    status: "Executed",
    clientId: "1", // E.P. Breaux
    clientName: "E.P. Breaux Utility Services, LLC",
    decedentName: "Robert L. Smith",
    keyBeneficiaries: "Mary Smith (Spouse)",
    description: "Will signed and delivered to heirs; originals stored.",
  },
  {
    id: "WSM-003",
    name: "Succession of Richard Johnson",
    status: "Awaiting Judgment",
    clientId: "2", // Hancock Whitney
    clientName: "Hancock Whitney Bank",
    decedentName: "Richard P. Johnson",
    dateOfDeath: "2023-11-20",
    keyBeneficiaries: "Multiple heirs (see file)",
    description: "Awaiting court’s final judgment on heirship.",
  },
]
