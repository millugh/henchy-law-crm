"use client"

import { PlusCircle, Download } from "lucide-react"
import * as React from "react"
import { useSearchParams } from "next/navigation"
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, startOfWeek, endOfWeek, startOfDay, endOfDay, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { exportToExcel, exportToPDF, exportToCSV } from "@/lib/export"
import { TimeEntryDialog } from "@/components/time-entry-dialog"
import { useTimeEntries } from "@/hooks/use-time-entries"

export default function TimeTrackingPage() {
  const { timeEntries, loading, error, refetch, createTimeEntry } = useTimeEntries()
  const [filter, setFilter] = React.useState("")
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const searchParams = useSearchParams()
  
  React.useEffect(() => {
    if (searchParams.get('openDialog') === 'true') {
      setDialogOpen(true)
      window.history.replaceState({}, '', '/time-tracking')
    }
  }, [searchParams])

  const handleTimeEntrySave = async (data: any) => {
    try {
      const result = await createTimeEntry({
        date: data.date,
        hours: data.hours,
        description: data.description,
        rate: data.rate,
        client_id: data.client_id,
        matter_id: data.matter_id
      })
      
      if (result.success) {
        setDialogOpen(false)
        refetch()
      }
    } catch (error) {
      console.error('Failed to save time entry:', error)
    }
  }

  const filteredEntries = timeEntries.filter((entry) => {
    const clientName = entry.clients?.name || ''
    const matchesText = clientName.toLowerCase().includes(filter.toLowerCase()) ||
      entry.description.toLowerCase().includes(filter.toLowerCase())
    
    const entryDate = parseISO(entry.date)
    const matchesDate = !dateRange?.from || !dateRange?.to || 
      isWithinInterval(entryDate, { start: dateRange.from, end: dateRange.to })
    
    return matchesText && matchesDate
  })

  const totalHours = filteredEntries.reduce((acc, entry) => acc + entry.hours, 0)
  const totalBilled = filteredEntries.filter((e) => e.rate && e.rate > 0).reduce((acc, entry) => acc + entry.hours, 0)
  const totalUnbilled = totalHours - totalBilled

  const handleExportPDF = () => {
    const headers = ["Date", "Client", "Hours", "Description", "Rate"]
    const data = filteredEntries.map((e) => ({
      date: e.date,
      client: e.clients?.name || 'Unknown',
      hours: e.hours.toFixed(2),
      description: e.description,
      rate: e.rate ? `$${e.rate.toFixed(2)}` : 'N/A',
    }))
    exportToPDF(data, headers, "Time Entries", "time_entries")
  }

  const handleExportExcel = () => {
    const data = filteredEntries.map((e) => ({
      Date: e.date,
      Client: e.clients?.name || 'Unknown',
      Hours: e.hours,
      Description: e.description,
      Rate: e.rate || 0,
    }))
    exportToExcel(data, "time_entries", "Time Entries")
  }

  const handleExportCSV = () => {
    const data = filteredEntries.map((e) => ({
      Date: e.date,
      Client: e.clients?.name || 'Unknown',
      Hours: e.hours,
      Description: e.description,
      Rate: e.rate || 0,
    }))
    exportToCSV(data, "time_entries")
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Time Tracking</CardTitle>
          <CardDescription>Log and manage billable hours for all clients and matters.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Input
                placeholder="Filter by client or description..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-[300px]"
              />
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange({ from: startOfDay(new Date()), to: endOfDay(new Date()) })}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) })}
                  >
                    This Week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })}
                  >
                    This Month
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange({ from: subDays(new Date(), 30), to: new Date() })}
                  >
                    Last 30 Days
                  </Button>
                </div>
                <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportPDF}>Export as PDF</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel}>Export as Excel</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => setDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </div>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="w-[200px]">Description</TableHead>
                  <TableHead className="text-right w-[80px]">Hours</TableHead>
                  <TableHead className="text-center w-[100px]">Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-red-500">Error: {error}</TableCell>
                  </TableRow>
                ) : filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{entry.clients?.name || 'Unknown'}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.description}</TableCell>
                    <TableCell className="text-right">{entry.hours.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{entry.rate ? `$${entry.rate}` : 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-bold">
                    Totals
                  </TableCell>
                  <TableCell className="text-right font-bold">{totalHours.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3}>Hours with Rate</TableCell>
                  <TableCell className="text-right">{totalBilled.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3}>Hours without Rate</TableCell>
                  <TableCell className="text-right">{totalUnbilled.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <TimeEntryDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleTimeEntrySave}
      />
    </div>
  )
}
