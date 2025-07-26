"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/loading-state'
import { ErrorState } from '@/components/error-state'
import { RoleGuard } from '@/components/role-guard'

interface AuditLog {
  id: string
  table_name: string
  action: string
  created_at: string
  user_profiles?: { full_name: string }
}

function AuditLogsContent() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/audit-logs')
      
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs')
      }

      const data = await response.json()
      setAuditLogs(data.auditLogs || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  if (loading) {
    return <LoadingState message="Loading audit logs..." />
  }

  if (error) {
    return <ErrorState title="Access Error" message={error} onRetry={fetchAuditLogs} />
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-green-100 text-green-800'
      case 'UPDATE': return 'bg-blue-100 text-blue-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            System activity log showing all database changes and user actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge className={getActionColor(log.action)}>
                    {log.action}
                  </Badge>
                  <div>
                    <p className="font-medium">{log.table_name}</p>
                    <p className="text-sm text-muted-foreground">
                      by {log.user_profiles?.full_name || 'Unknown User'}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No audit logs found.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuditLogsPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AuditLogsContent />
    </RoleGuard>
  )
}
