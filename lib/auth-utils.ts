import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export type UserRole = 'attorney' | 'paralegal' | 'admin'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  first_name?: string
  last_name?: string
}

function createClient() {
  const cookieStore = cookies()
  
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

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return null
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role as UserRole,
      first_name: profile.first_name,
      last_name: profile.last_name
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireRole(allowedRoles: UserRole[]): Promise<UserProfile> {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }
  return user
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'admin'
}

export function isAttorney(userRole: UserRole): boolean {
  return userRole === 'attorney'
}

export function canManageUsers(userRole: UserRole): boolean {
  return userRole === 'admin'
}

export function canViewAllMatters(userRole: UserRole): boolean {
  return userRole === 'admin' || userRole === 'attorney'
}

export function canEditMatter(userRole: UserRole): boolean {
  return userRole === 'admin' || userRole === 'attorney'
}

export function canDeleteMatter(userRole: UserRole): boolean {
  return userRole === 'admin'
}
