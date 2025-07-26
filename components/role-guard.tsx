"use client"

import React from 'react'
import { useUserRole } from '@/hooks/use-user-role'
import { LoadingState } from '@/components/loading-state'
import { ErrorState } from '@/components/error-state'

interface RoleGuardProps {
  allowedRoles: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { role, loading } = useUserRole()

  if (loading) {
    return <LoadingState message="Checking permissions..." />
  }

  if (!role || !allowedRoles.includes(role)) {
    return fallback || (
      <ErrorState 
        title="Access Denied" 
        message="You don't have permission to access this feature." 
      />
    )
  }

  return <>{children}</>
}
