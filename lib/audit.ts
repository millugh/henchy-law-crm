import { createClient } from './supabase'

export interface AuditLogEntry {
  id: string
  user_id: string | null
  action: string
  table_name: string
  record_id: string | null
  old_values: any
  new_values: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export async function logAuditEvent(
  action: string,
  tableName: string,
  recordId?: string,
  oldValues?: any,
  newValues?: any
) {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.rpc('log_audit_event', {
      p_action: action,
      p_table_name: tableName,
      p_record_id: recordId || null,
      p_old_values: oldValues || null,
      p_new_values: newValues || null
    })

    if (error) {
      console.error('Failed to log audit event:', error)
    }
  } catch (error) {
    console.error('Failed to log audit event:', error)
  }
}

export async function getAuditLogs(
  tableName?: string,
  recordId?: string,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogEntry[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (tableName) {
    query = query.eq('table_name', tableName)
  }

  if (recordId) {
    query = query.eq('record_id', recordId)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data || []
}

export async function getUserAuditLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogEntry[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw error
  }

  return data || []
}
