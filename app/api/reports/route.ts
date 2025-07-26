import { NextRequest, NextResponse } from 'next/server'
import { 
  generateTimeTrackingReport, 
  generateMatterReport, 
  generateClientReport, 
  generateDocumentReport 
} from '@/lib/reporting'
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

async function requireAuth() {
  const supabase = await createClient()
  
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

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    first_name: profile.first_name,
    last_name: profile.last_name
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    
    const reportType = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const userId = searchParams.get('userId')
    
    if (!reportType) {
      return NextResponse.json({ error: 'Report type is required' }, { status: 400 })
    }
    
    let report
    
    switch (reportType) {
      case 'time-tracking':
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'Start date and end date are required for time tracking reports' }, { status: 400 })
        }
        report = await generateTimeTrackingReport(startDate, endDate, userId || user.id)
        break
        
      case 'matters':
        report = await generateMatterReport(userId || user.id)
        break
        
      case 'clients':
        report = await generateClientReport(userId || user.id)
        break
        
      case 'documents':
        report = await generateDocumentReport(userId || user.id)
        break
        
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }
    
    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
