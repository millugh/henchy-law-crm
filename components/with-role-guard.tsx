"use client"

import React from 'react'
import { RoleGuard } from './role-guard'

export type UserRole = 'attorney' | 'paralegal' | 'admin'

interface WithRoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
}

export function withRoleGuard(allowedRoles: UserRole[], fallback?: React.ReactNode) {
  return function WithRoleGuardWrapper({ children }: { children: React.ReactNode }) {
    return (
      <RoleGuard allowedRoles={allowedRoles} fallback={fallback}>
        {children}
      </RoleGuard>
    )
  }
}

export function WithRoleGuard({ children, allowedRoles, fallback }: WithRoleGuardProps) {
  return (
    <RoleGuard allowedRoles={allowedRoles} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}
