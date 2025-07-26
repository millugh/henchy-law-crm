"use client"

import { AdvancedReports } from "@/components/advanced-reports"

export default function ReportsPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Advanced Reports</h1>
        <p className="text-muted-foreground">
          Generate detailed reports with custom filters and export options.
        </p>
      </div>
      
      <AdvancedReports />
    </div>
  )
}
