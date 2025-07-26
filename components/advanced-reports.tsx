"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Download, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { exportToPDF, exportToExcel } from "@/lib/export"

interface ReportFilters {
  type: string
  start_date: Date | undefined
  end_date: Date | undefined
  client_id: string
  matter_id: string
}

export function AdvancedReports() {
  const [filters, setFilters] = React.useState<ReportFilters>({
    type: '',
    start_date: undefined,
    end_date: undefined,
    client_id: '',
    matter_id: ''
  })
  const [reportData, setReportData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)

  const generateReport = async () => {
    if (!filters.type) return

    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('type', filters.type)
      if (filters.start_date) params.append('start_date', format(filters.start_date, 'yyyy-MM-dd'))
      if (filters.end_date) params.append('end_date', format(filters.end_date, 'yyyy-MM-dd'))
      if (filters.client_id) params.append('client_id', filters.client_id)
      if (filters.matter_id) params.append('matter_id', filters.matter_id)

      const response = await fetch(`/api/reports?${params}`)
      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const { data } = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = (format: 'pdf' | 'excel') => {
    if (!reportData) return

    const reportTitle = `${filters.type.replace('_', ' ').toUpperCase()} Report`
    
    if (format === 'pdf') {
      exportToPDF(reportData, reportTitle)
    } else {
      exportToExcel(reportData, reportTitle)
    }
  }

  const renderReportContent = () => {
    if (!reportData) return null

    switch (filters.type) {
      case 'time_summary':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{reportData.totalHours}</div>
                  <div className="text-sm text-gray-500">Total Hours</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">${reportData.totalBillable?.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">Total Billable</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{reportData.entries?.length}</div>
                  <div className="text-sm text-gray-500">Time Entries</div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Time Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.entries?.map((entry: any) => (
                    <div key={entry.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{entry.matters?.name}</div>
                        <div className="text-sm text-gray-500">{entry.description}</div>
                      </div>
                      <div className="text-right">
                        <div>{entry.hours}h</div>
                        <div className="text-sm text-gray-500">${entry.billable_amount?.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'client_summary':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Client Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reportData.clients?.map((client: any) => (
                  <div key={client.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{client.matters?.length || 0} matters</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case 'matter_summary':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Matter Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reportData.matters?.map((matter: any) => (
                  <div key={matter.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium">{matter.name}</div>
                      <div className="text-sm text-gray-500">{matter.clients?.name}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{matter.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time_summary">Time Summary</SelectItem>
                  <SelectItem value="client_summary">Client Summary</SelectItem>
                  <SelectItem value="matter_summary">Matter Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.start_date ? format(filters.start_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.start_date}
                    onSelect={(date) => setFilters(prev => ({ ...prev, start_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.end_date ? format(filters.end_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.end_date}
                    onSelect={(date) => setFilters(prev => ({ ...prev, end_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="client-id">Client ID</Label>
              <Input
                id="client-id"
                value={filters.client_id}
                onChange={(e) => setFilters(prev => ({ ...prev, client_id: e.target.value }))}
                placeholder="Optional"
              />
            </div>

            <div>
              <Label htmlFor="matter-id">Matter ID</Label>
              <Input
                id="matter-id"
                value={filters.matter_id}
                onChange={(e) => setFilters(prev => ({ ...prev, matter_id: e.target.value }))}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={generateReport} disabled={!filters.type || loading}>
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
            
            {reportData && (
              <>
                <Button variant="outline" onClick={() => exportReport('pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={() => exportReport('excel')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {reportData && renderReportContent()}
    </div>
  )
}
