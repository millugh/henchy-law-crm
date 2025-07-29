import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setRole(profile?.role || 'attorney')
      setLoading(false)
    }

    fetchUserRole()
  }, [])

  return { role, loading, isAdmin: role === 'admin', isAttorney: role === 'attorney', isParalegal: role === 'paralegal' }
}
