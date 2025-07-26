"use client"

import * as React from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuditLogEntry } from "@/lib/audit"

interface AuditLogViewerProps {
  className?: string
}

interface AuditFilters {
  table_name: string
  record_id: string
  limit: number
  offset: number
}

export function AuditLogViewer({ className }: AuditLogViewerProps) {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filters, setFilters] = React.useState<AuditFilters>({
    table_name: '',
    record_id: '',
    limit: 50,
    offset: 0
  })

  const fetchLogs = React.useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.table_name) params.append('table_name', filters.table_name)
      if (filters.record_id) params.append('record_id', filters.record_id)
      params.append('limit', filters.limit.toString())
      params.append('offset', filters.offset.toString())

      const response = await fetch(`/api/audit-logs?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs')
      }

      const { data } = await response.json()
      setLogs(data)
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  React.useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatValue = (value: any) => {
    if (!value) return 'N/A'
    return JSON.stringify(value, null, 2)
  }

  return (
    <div className={className}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Audit Log Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="table-filter">Table</Label>
              <Select
                value={filters.table_name}
                onValueChange={(value) => setFilters(prev => ({ ...prev, table_name: value, offset: 0 }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All tables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All tables</SelectItem>
                  <SelectItem value="clients">Clients</SelectItem>
                  <SelectItem value="matters">Matters</SelectItem>
                  <SelectItem value="time_entries">Time Entries</SelectItem>
                  <SelectItem value="tasks">Tasks</SelectItem>
                  <SelectItem value="documents">Documents</SelectItem>
                  <SelectItem value="letter_templates">Letter Templates</SelectItem>
                  <SelectItem value="contract_templates">Contract Templates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="record-filter">Record ID</Label>
              <Input
                id="record-filter"
                value={filters.record_id}
                onChange={(e) => setFilters(prev => ({ ...prev, record_id: e.target.value, offset: 0 }))}
                placeholder="Enter record ID"
              />
            </div>
            <div>
              <Label htmlFor="limit-filter">Limit</Label>
              <Select
                value={filters.limit.toString()}
                onValueChange={(value) => setFilters(prev => ({ ...prev, limit: parseInt(value), offset: 0 }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No audit logs found</p>
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                    <span className="font-medium">{log.table_name}</span>
                    {log.record_id && (
                      <span className="text-sm text-gray-500">ID: {log.record_id}</span>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>User ID: {log.user_id || 'Unknown'}</div>
                    <div>{format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}</div>
                  </div>
                </div>

                {(log.old_values || log.new_values) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {log.old_values && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Previous Values</h4>
                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                          {formatValue(log.old_values)}
                        </pre>
                      </div>
                    )}
                    {log.new_values && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">New Values</h4>
                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                          {formatValue(log.new_values)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {logs.length >= filters.limit && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={() => setFilters(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
