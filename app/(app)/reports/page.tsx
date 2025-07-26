"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingState } from '@/components/loading-state'
import { ErrorState } from '@/components/error-state'
import { Download, Calendar, DollarSign, Clock } from 'lucide-react'
import { exportToPDF, exportToExcel } from '@/lib/export'

interface ReportData {
  totalHours: number
  totalRevenue: number
  billedHours: number
  unbilledHours: number
  entries: any[]
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchReport = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/reports?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch report data')
      }

      const data = await response.json()
      setReportData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const handleExportPDF = () => {
    if (!reportData) return
    
    const headers = ['Date', 'Client', 'Matter', 'Hours', 'Rate', 'Amount', 'Billed']
    const data = reportData.entries.map(entry => [
      entry.date,
      entry.clients?.name || 'N/A',
      entry.matters?.title || 'N/A',
      entry.hours,
      `$${entry.hourly_rate || 150}`,
      `$${(entry.hours * (entry.hourly_rate || 150)).toFixed(2)}`,
      entry.billed ? 'Yes' : 'No'
    ])

    exportToPDF(data, headers, 'Time & Billing Report', 'time-billing-report')
  }

  const handleExportExcel = () => {
    if (!reportData) return
    
    const data = reportData.entries.map(entry => ({
      Date: entry.date,
      Client: entry.clients?.name || 'N/A',
      Matter: entry.matters?.title || 'N/A',
      Hours: entry.hours,
      Rate: entry.hourly_rate || 150,
      Amount: entry.hours * (entry.hourly_rate || 150),
      Billed: entry.billed ? 'Yes' : 'No'
    }))

    exportToExcel(data, 'time-billing-report', 'Time Entries')
  }

  if (loading) {
    return <LoadingState message="Generating report..." />
  }

  if (error) {
    return <ErrorState title="Report Error" message={error} onRetry={fetchReport} />
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Reports</CardTitle>
          <CardDescription>
            Generate detailed reports with custom date ranges and export options.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchReport} className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </div>

          {reportData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Total Hours</p>
                        <p className="text-2xl font-bold">{reportData.totalHours}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Total Revenue</p>
                        <p className="text-2xl font-bold">${reportData.totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Billed Hours</p>
                        <p className="text-2xl font-bold">{reportData.billedHours}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">Unbilled Hours</p>
                        <p className="text-2xl font-bold">{reportData.unbilledHours}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex space-x-2 mb-4">
                <Button onClick={handleExportPDF} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button onClick={handleExportExcel} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Client</th>
                      <th className="px-4 py-2 text-left">Matter</th>
                      <th className="px-4 py-2 text-left">Hours</th>
                      <th className="px-4 py-2 text-left">Rate</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.entries.map((entry, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{entry.date}</td>
                        <td className="px-4 py-2">{entry.clients?.name || 'N/A'}</td>
                        <td className="px-4 py-2">{entry.matters?.title || 'N/A'}</td>
                        <td className="px-4 py-2">{entry.hours}</td>
                        <td className="px-4 py-2">${entry.hourly_rate || 150}</td>
                        <td className="px-4 py-2">${(entry.hours * (entry.hourly_rate || 150)).toFixed(2)}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            entry.billed ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {entry.billed ? 'Billed' : 'Unbilled'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
