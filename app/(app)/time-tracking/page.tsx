"use client"

import { PlusCircle, Download } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { TIME_ENTRIES, type TimeEntry } from "@/lib/data"
import { exportToExcel, exportToPDF } from "@/lib/export"

export default function TimeTrackingPage() {
  const [entries, setEntries] = React.useState<TimeEntry[]>(TIME_ENTRIES)
  const [filter, setFilter] = React.useState("")

  const filteredEntries = entries.filter(
    (entry) =>
      entry.clientName.toLowerCase().includes(filter.toLowerCase()) ||
      entry.description.toLowerCase().includes(filter.toLowerCase()),
  )

  const totalHours = filteredEntries.reduce((acc, entry) => acc + entry.hours, 0)
  const totalBilled = filteredEntries.filter((e) => e.billed).reduce((acc, entry) => acc + entry.hours, 0)
  const totalUnbilled = totalHours - totalBilled

  const handleExportPDF = () => {
    const headers = ["Date", "Client", "Hours", "Description", "Billed"]
    const data = filteredEntries.map((e) => ({
      date: e.date,
      client: e.clientName,
      hours: e.hours.toFixed(2),
      description: e.description,
      billed: e.billed ? "Yes" : "No",
    }))
    exportToPDF(data, headers, "Time Entries", "time_entries")
  }

  const handleExportExcel = () => {
    const data = filteredEntries.map((e) => ({
      Date: e.date,
      Client: e.clientName,
      Hours: e.hours,
      Description: e.description,
      Billed: e.billed ? "Yes" : "No",
    }))
    exportToExcel(data, "time_entries", "Time Entries")
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
              <DatePickerWithRange />
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
                </DropdownMenuContent>
              </DropdownMenu>
              <Button>
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
                  <TableHead className="text-center w-[100px]">Billed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{entry.clientName}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.description}</TableCell>
                    <TableCell className="text-right">{entry.hours.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{entry.billed ? "Yes" : "No"}</TableCell>
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
                  <TableCell colSpan={3}>Unbilled Hours</TableCell>
                  <TableCell className="text-right">{totalUnbilled.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3}>Billed Hours</TableCell>
                  <TableCell className="text-right">{totalBilled.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
