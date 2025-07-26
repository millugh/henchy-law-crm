"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart, FileText, Users, Clock, Download, TrendingUp } from 'lucide-react'
import { useErrorHandler } from '@/hooks/use-error-handler'

interface ReportData {
  timeTracking?: any
  matters?: any
  clients?: any
  documents?: any
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({})
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedReportType, setSelectedReportType] = useState('time-tracking')
  const { error, handleError, clearError } = useErrorHandler()

  const generateReport = async (reportType: string) => {
    try {
      setLoading(true)
      clearError()
      
      const params = new URLSearchParams({ type: reportType })
      
      if (reportType === 'time-tracking') {
        if (!startDate || !endDate) {
          throw new Error('Start date and end date are required for time tracking reports')
        }
        params.append('startDate', startDate)
        params.append('endDate', endDate)
      }
      
      const response = await fetch(`/api/reports?${params}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate report')
      }
      
      const data = await response.json()
      setReportData(prev => ({ ...prev, [reportType.replace('-', '')]: data.report }))
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Advanced Reports
          </CardTitle>
          <CardDescription>
            Generate comprehensive reports for time tracking, matters, clients, and documents.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={selectedReportType} onValueChange={setSelectedReportType}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="time-tracking" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Tracking
          </TabsTrigger>
          <TabsTrigger value="matters" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Matters
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="time-tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Tracking Report</CardTitle>
              <CardDescription>
                Analyze billable hours, revenue, and time allocation across clients and matters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => generateReport('time-tracking')}
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>
                <Button variant="outline" disabled={!reportData.timetracking}>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>

              {error && (
                <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-md">
                  <p className="text-sm text-destructive">{error.message}</p>
                </div>
              )}

              {reportData.timetracking && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {formatHours(reportData.timetracking.totalHours)}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Hours</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {formatHours(reportData.timetracking.billableHours)}
                        </div>
                        <p className="text-sm text-muted-foreground">Billable Hours</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {formatCurrency(reportData.timetracking.totalRevenue)}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {formatCurrency(reportData.timetracking.averageHourlyRate)}
                        </div>
                        <p className="text-sm text-muted-foreground">Avg. Rate</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Clients by Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {reportData.timetracking.entriesByClient.slice(0, 5).map((client: any, index: number) => (
                          <div key={client.clientId} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{index + 1}</Badge>
                              <div>
                                <p className="font-medium">{client.clientName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatHours(client.hours)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(client.revenue)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matter Analysis Report</CardTitle>
              <CardDescription>
                Overview of matter status, types, and recent activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => generateReport('matters')}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>

              {reportData.matters && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {reportData.matters.totalMatters}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Matters</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Matters by Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {reportData.matters.mattersByStatus.map((status: any) => (
                            <div key={status.status} className="flex items-center justify-between">
                              <Badge variant="outline">{status.status}</Badge>
                              <span className="font-medium">{status.count}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Matters by Type</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {reportData.matters.mattersByType.map((type: any) => (
                            <div key={type.type} className="flex items-center justify-between">
                              <Badge variant="secondary">{type.type}</Badge>
                              <span className="font-medium">{type.count}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Analysis Report</CardTitle>
              <CardDescription>
                Client statistics, revenue analysis, and engagement metrics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => generateReport('clients')}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>

              {reportData.clients && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {reportData.clients.totalClients}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Clients</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {reportData.clients.activeClients}
                        </div>
                        <p className="text-sm text-muted-foreground">Active Clients</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Clients by Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {reportData.clients.topClientsByRevenue.slice(0, 10).map((client: any, index: number) => (
                          <div key={client.clientId} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{index + 1}</Badge>
                              <div>
                                <p className="font-medium">{client.clientName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {client.mattersCount} matters • {formatHours(client.totalHours)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(client.totalRevenue)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Storage Report</CardTitle>
              <CardDescription>
                File storage usage, document types, and upload activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => generateReport('documents')}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>

              {reportData.documents && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {reportData.documents.totalDocuments}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Documents</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {(reportData.documents.storageUsage.totalSize / (1024 * 1024)).toFixed(1)} MB
                        </div>
                        <p className="text-sm text-muted-foreground">Storage Used</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {(reportData.documents.storageUsage.averageFileSize / 1024).toFixed(1)} KB
                        </div>
                        <p className="text-sm text-muted-foreground">Avg. File Size</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Documents by Type</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {reportData.documents.documentsByType.map((type: any) => (
                            <div key={type.type} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline">{type.type}</Badge>
                                <span className="text-sm">{type.count} files</span>
                              </div>
                              <Progress 
                                value={(type.count / reportData.documents.totalDocuments) * 100} 
                                className="h-2"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Uploads</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {reportData.documents.recentUploads.slice(0, 5).map((upload: any) => (
                            <div key={upload.id} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium truncate max-w-[200px]">{upload.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  by {upload.uploadedBy}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm">
                                  {new Date(upload.uploadedAt).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(upload.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
