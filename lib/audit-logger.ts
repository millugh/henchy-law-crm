import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface AuditLogEntry {
  userId: string
  action: string
  resourceType: string
  resourceId?: string
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
}

function createClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase.rpc('create_audit_log', {
      p_user_id: entry.userId,
      p_action: entry.action,
      p_resource_type: entry.resourceType,
      p_resource_id: entry.resourceId || null,
      p_old_values: entry.oldValues ? JSON.stringify(entry.oldValues) : null,
      p_new_values: entry.newValues ? JSON.stringify(entry.newValues) : null,
      p_ip_address: entry.ipAddress || null,
      p_user_agent: entry.userAgent || null
    })
    
    if (error) {
      console.error('Failed to create audit log:', error)
    }
  } catch (error) {
    console.error('Error creating audit log:', error)
  }
}

export async function logFileUpload(
  userId: string,
  fileName: string,
  fileSize: number,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    action: 'FILE_UPLOAD',
    resourceType: 'document',
    newValues: { fileName, fileSize },
    ipAddress,
    userAgent
  })
}

export async function logFileDelete(
  userId: string,
  fileName: string,
  fileId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    action: 'FILE_DELETE',
    resourceType: 'document',
    resourceId: fileId,
    oldValues: { fileName },
    ipAddress,
    userAgent
  })
}

export async function logUserLogin(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    action: 'USER_LOGIN',
    resourceType: 'auth',
    ipAddress,
    userAgent
  })
}

export async function logUserLogout(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    action: 'USER_LOGOUT',
    resourceType: 'auth',
    ipAddress,
    userAgent
  })
}

export async function logDataCreate(
  userId: string,
  resourceType: string,
  resourceId: string,
  newValues: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    action: 'CREATE',
    resourceType,
    resourceId,
    newValues,
    ipAddress,
    userAgent
  })
}

export async function logDataUpdate(
  userId: string,
  resourceType: string,
  resourceId: string,
  oldValues: any,
  newValues: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    action: 'UPDATE',
    resourceType,
    resourceId,
    oldValues,
    newValues,
    ipAddress,
    userAgent
  })
}

export async function logDataDelete(
  userId: string,
  resourceType: string,
  resourceId: string,
  oldValues: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    action: 'DELETE',
    resourceType,
    resourceId,
    oldValues,
    ipAddress,
    userAgent
  })
}
