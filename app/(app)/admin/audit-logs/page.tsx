"use client"

import { AuditLogViewer } from "@/components/audit-log-viewer"

export default function AuditLogsPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          View and filter system audit logs to track user actions and changes.
        </p>
      </div>
      
      <AuditLogViewer />
    </div>
  )
}
