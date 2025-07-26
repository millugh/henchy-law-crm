"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WithRoleGuard, UserRole } from '@/components/with-role-guard'
import { Search, Filter, Download } from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  resource_type: string
  resource_id?: string
  old_values?: any
  new_values?: any
  ip_address?: string
  user_agent?: string
  created_at: string
  user_profiles?: {
    first_name?: string
    last_name?: string
    email: string
  }
}

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [resourceTypeFilter, setResourceTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchAuditLogs()
  }, [page, actionFilter, resourceTypeFilter])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      })
      
      if (actionFilter) params.append('action', actionFilter)
      if (resourceTypeFilter) params.append('resourceType', resourceTypeFilter)
      
      const response = await fetch(`/api/audit-logs?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs')
      }
      
      const data = await response.json()
      setAuditLogs(data.auditLogs || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'CREATE': return 'default'
      case 'UPDATE': return 'secondary'
      case 'DELETE': return 'destructive'
      case 'FILE_UPLOAD': return 'outline'
      case 'USER_LOGIN': return 'default'
      case 'USER_LOGOUT': return 'secondary'
      default: return 'outline'
    }
  }

  const filteredLogs = auditLogs.filter(log => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.resource_type.toLowerCase().includes(searchLower) ||
      log.user_profiles?.email.toLowerCase().includes(searchLower) ||
      (log.resource_id && log.resource_id.toLowerCase().includes(searchLower))
    )
  })

  return (
    <WithRoleGuard allowedRoles={['admin']}>
      <div className="p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>
              Track all user actions and system changes for security and compliance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="FILE_UPLOAD">File Upload</SelectItem>
                  <SelectItem value="USER_LOGIN">User Login</SelectItem>
                  <SelectItem value="USER_LOGOUT">User Logout</SelectItem>
                </SelectContent>
              </Select>
              <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Resources</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="matter">Matters</SelectItem>
                  <SelectItem value="time_entry">Time Entries</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                Error: {error}
              </div>
            ) : (
              <>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Resource ID</TableHead>
                        <TableHead>IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {formatDate(log.created_at)}
                          </TableCell>
                          <TableCell>
                            {log.user_profiles ? (
                              <div>
                                <div className="font-medium">
                                  {log.user_profiles.first_name} {log.user_profiles.last_name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {log.user_profiles.email}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">System</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getActionBadgeVariant(log.action)}>
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {log.resource_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.resource_id || '—'}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.ip_address || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </WithRoleGuard>
  )
}
