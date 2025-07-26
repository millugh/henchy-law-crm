import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function requireRole(allowedRoles: string[]) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
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
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('User profile not found')
  }

  if (!allowedRoles.includes(profile.role)) {
    throw new Error('Insufficient permissions')
  }

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    first_name: profile.first_name,
    last_name: profile.last_name
  }
}

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

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(['admin'])
    
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action')
    const resourceType = searchParams.get('resourceType')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const offset = (page - 1) * limit
    
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        user_profiles!audit_logs_user_id_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (action) {
      query = query.eq('action', action)
    }
    
    if (resourceType) {
      query = query.eq('resource_type', resourceType)
    }
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate)
    }
    
    const { data: auditLogs, error } = await query
    
    if (error) {
      console.error('Error fetching audit logs:', error)
      return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
    }
    
    let countQuery = supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
    
    if (action) countQuery = countQuery.eq('action', action)
    if (resourceType) countQuery = countQuery.eq('resource_type', resourceType)
    if (userId) countQuery = countQuery.eq('user_id', userId)
    if (startDate) countQuery = countQuery.gte('created_at', startDate)
    if (endDate) countQuery = countQuery.lte('created_at', endDate)
    
    const { count, error: countError } = await countQuery
    
    if (countError) {
      console.error('Error counting audit logs:', countError)
      return NextResponse.json({ error: 'Failed to count audit logs' }, { status: 500 })
    }
    
    return NextResponse.json({
      auditLogs: auditLogs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in audit logs API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
