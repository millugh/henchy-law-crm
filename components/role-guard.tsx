"use client"

import { useEffect, useState } from 'react'
export type UserRole = 'attorney' | 'paralegal' | 'admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/profile')
        if (response.ok) {
          const { user } = await response.json()
          setUserRole(user?.role || null)
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Access Restricted</CardTitle>
          </div>
          <CardDescription>
            You don't have permission to access this content. Contact your administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return <>{children}</>
}
