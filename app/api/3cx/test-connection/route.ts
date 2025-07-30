import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { threeCxService } from '@/lib/3cx-service'

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: config, error } = await supabase
      .from('threecx_config')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !config) {
      return NextResponse.json({ 
        success: false, 
        message: '3CX configuration not found. Please configure 3CX settings first.' 
      })
    }

    threeCxService.setConfig(config)
    const result = await threeCxService.testConnection()

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Connection test failed' 
    })
  }
}
