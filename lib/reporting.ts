import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
          }
        },
      },
    }
  )
}

export interface TimeTrackingReport {
  totalHours: number
  billableHours: number
  nonBillableHours: number
  totalRevenue: number
  averageHourlyRate: number
  entriesByClient: Array<{
    clientId: string
    clientName: string
    hours: number
    revenue: number
  }>
  entriesByMatter: Array<{
    matterId: string
    matterTitle: string
    hours: number
    revenue: number
  }>
  dailyBreakdown: Array<{
    date: string
    hours: number
    revenue: number
  }>
}

export interface MatterReport {
  totalMatters: number
  mattersByStatus: Array<{
    status: string
    count: number
  }>
  mattersByType: Array<{
    type: string
    count: number
  }>
  recentActivity: Array<{
    matterId: string
    title: string
    lastActivity: string
    documentsCount: number
    timeEntriesCount: number
  }>
}

export interface ClientReport {
  totalClients: number
  activeClients: number
  clientsByStatus: Array<{
    status: string
    count: number
  }>
  topClientsByRevenue: Array<{
    clientId: string
    clientName: string
    totalRevenue: number
    totalHours: number
    mattersCount: number
  }>
}

export interface DocumentReport {
  totalDocuments: number
  documentsByType: Array<{
    type: string
    count: number
    totalSize: number
  }>
  recentUploads: Array<{
    id: string
    name: string
    uploadedBy: string
    uploadedAt: string
    size: number
  }>
  storageUsage: {
    totalSize: number
    averageFileSize: number
  }
}

export async function generateTimeTrackingReport(
  startDate: string,
  endDate: string,
  userId?: string
): Promise<TimeTrackingReport> {
  const supabase = await createClient()
  
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      clients (id, name),
      matters (id, title)
    `)
    .gte('date', startDate)
    .lte('date', endDate)
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data: timeEntries, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch time entries: ${error.message}`)
  }
  
  const entries = timeEntries || []
  
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0)
  const billableHours = entries.filter(entry => entry.billed).reduce((sum, entry) => sum + entry.hours, 0)
  const nonBillableHours = totalHours - billableHours
  const totalRevenue = entries.reduce((sum, entry) => sum + (entry.hours * (entry.hourly_rate || 0)), 0)
  const averageHourlyRate = totalRevenue > 0 ? totalRevenue / totalHours : 0
  
  const clientMap = new Map()
  entries.forEach(entry => {
    if (entry.clients) {
      const key = entry.clients.id
      if (!clientMap.has(key)) {
        clientMap.set(key, {
          clientId: key,
          clientName: entry.clients.name,
          hours: 0,
          revenue: 0
        })
      }
      const client = clientMap.get(key)
      client.hours += entry.hours
      client.revenue += entry.hours * (entry.hourly_rate || 0)
    }
  })
  
  const matterMap = new Map()
  entries.forEach(entry => {
    if (entry.matters) {
      const key = entry.matters.id
      if (!matterMap.has(key)) {
        matterMap.set(key, {
          matterId: key,
          matterTitle: entry.matters.title,
          hours: 0,
          revenue: 0
        })
      }
      const matter = matterMap.get(key)
      matter.hours += entry.hours
      matter.revenue += entry.hours * (entry.hourly_rate || 0)
    }
  })
  
  const dailyMap = new Map()
  entries.forEach(entry => {
    const date = entry.date
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { date, hours: 0, revenue: 0 })
    }
    const day = dailyMap.get(date)
    day.hours += entry.hours
    day.revenue += entry.hours * (entry.hourly_rate || 0)
  })
  
  return {
    totalHours,
    billableHours,
    nonBillableHours,
    totalRevenue,
    averageHourlyRate,
    entriesByClient: Array.from(clientMap.values()).sort((a, b) => b.revenue - a.revenue),
    entriesByMatter: Array.from(matterMap.values()).sort((a, b) => b.revenue - a.revenue),
    dailyBreakdown: Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  }
}

export async function generateMatterReport(userId?: string): Promise<MatterReport> {
  const supabase = await createClient()
  
  let query = supabase
    .from('matters')
    .select(`
      *,
      clients (name),
      documents (id),
      time_entries (id)
    `)
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data: matters, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch matters: ${error.message}`)
  }
  
  const matterList = matters || []
  
  const statusMap = new Map()
  matterList.forEach(matter => {
    const status = matter.status
    statusMap.set(status, (statusMap.get(status) || 0) + 1)
  })
  
  const typeMap = new Map()
  matterList.forEach(matter => {
    const type = matter.matter_type
    typeMap.set(type, (typeMap.get(type) || 0) + 1)
  })
  
  const recentActivity = matterList
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10)
    .map(matter => ({
      matterId: matter.id,
      title: matter.title,
      lastActivity: matter.updated_at,
      documentsCount: matter.documents?.length || 0,
      timeEntriesCount: matter.time_entries?.length || 0
    }))
  
  return {
    totalMatters: matterList.length,
    mattersByStatus: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
    mattersByType: Array.from(typeMap.entries()).map(([type, count]) => ({ type, count })),
    recentActivity
  }
}

export async function generateClientReport(userId?: string): Promise<ClientReport> {
  const supabase = await createClient()
  
  let query = supabase
    .from('clients')
    .select(`
      *,
      matters (id),
      time_entries (hours, hourly_rate)
    `)
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data: clients, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch clients: ${error.message}`)
  }
  
  const clientList = clients || []
  
  const statusMap = new Map()
  clientList.forEach(client => {
    const status = client.status
    statusMap.set(status, (statusMap.get(status) || 0) + 1)
  })
  
  const topClients = clientList
    .map(client => {
      const totalRevenue = client.time_entries?.reduce((sum: number, entry: any) => 
        sum + (entry.hours * (entry.hourly_rate || 0)), 0) || 0
      const totalHours = client.time_entries?.reduce((sum: number, entry: any) => 
        sum + entry.hours, 0) || 0
      
      return {
        clientId: client.id,
        clientName: client.name,
        totalRevenue,
        totalHours,
        mattersCount: client.matters?.length || 0
      }
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10)
  
  return {
    totalClients: clientList.length,
    activeClients: clientList.filter(client => client.status === 'active').length,
    clientsByStatus: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
    topClientsByRevenue: topClients
  }
}

export async function generateDocumentReport(userId?: string): Promise<DocumentReport> {
  const supabase = await createClient()
  
  let query = supabase
    .from('documents')
    .select(`
      *,
      user_profiles!documents_user_id_fkey (first_name, last_name)
    `)
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data: documents, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch documents: ${error.message}`)
  }
  
  const documentList = documents || []
  
  const typeMap = new Map()
  documentList.forEach(doc => {
    const type = doc.file_type
    if (!typeMap.has(type)) {
      typeMap.set(type, { count: 0, totalSize: 0 })
    }
    const typeData = typeMap.get(type)
    typeData.count += 1
    typeData.totalSize += doc.file_size || 0
  })
  
  const recentUploads = documentList
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map(doc => ({
      id: doc.id,
      name: doc.name,
      uploadedBy: doc.user_profiles ? 
        `${doc.user_profiles.first_name} ${doc.user_profiles.last_name}`.trim() : 
        'Unknown',
      uploadedAt: doc.created_at,
      size: doc.file_size || 0
    }))
  
  const totalSize = documentList.reduce((sum, doc) => sum + (doc.file_size || 0), 0)
  const averageFileSize = documentList.length > 0 ? totalSize / documentList.length : 0
  
  return {
    totalDocuments: documentList.length,
    documentsByType: Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      totalSize: data.totalSize
    })),
    recentUploads,
    storageUsage: {
      totalSize,
      averageFileSize
    }
  }
}
