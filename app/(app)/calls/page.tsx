"use client"

import { useState, useEffect } from 'react'
import { Phone, PhoneCall, PhoneIncoming, PhoneOutgoing, PhoneMissed, Play, Clock, Filter, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ApiClient, PhoneCall as PhoneCallType } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import { CallTimeEntryDialog } from '@/components/call-time-entry-dialog'

const apiClient = new ApiClient()

export default function CallsPage() {
  const [calls, setCalls] = useState<PhoneCallType[]>([])
  const [filteredCalls, setFilteredCalls] = useState<PhoneCallType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [directionFilter, setDirectionFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedCall, setSelectedCall] = useState<PhoneCallType | null>(null)
  const [timeEntryOpen, setTimeEntryOpen] = useState(false)

  useEffect(() => {
    fetchCalls()
  }, [])

  useEffect(() => {
    filterCalls()
  }, [calls, searchTerm, directionFilter, statusFilter])

  const fetchCalls = async () => {
    setLoading(true)
    const response = await apiClient.fetchPhoneCalls()
    if (response.data) {
      setCalls(response.data)
    }
    setLoading(false)
  }

  const filterCalls = () => {
    let filtered = calls

    if (searchTerm) {
      filtered = filtered.filter(call => 
        call.caller_number.includes(searchTerm) ||
        call.callee_number.includes(searchTerm) ||
        call.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (directionFilter !== 'all') {
      filtered = filtered.filter(call => call.direction === directionFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(call => call.status === statusFilter)
    }

    setFilteredCalls(filtered)
  }

  const getCallIcon = (call: PhoneCallType) => {
    if (call.direction === 'inbound') {
      return call.status === 'missed' ? PhoneMissed : PhoneIncoming
    }
    return PhoneOutgoing
  }

  const getCallIconColor = (call: PhoneCallType) => {
    if (call.status === 'missed') return 'text-red-500'
    if (call.direction === 'inbound') return 'text-green-500'
    return 'text-blue-500'
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleLogTime = (call: PhoneCallType) => {
    setSelectedCall(call)
    setTimeEntryOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      missed: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
      ringing: 'bg-yellow-100 text-yellow-800',
      connected: 'bg-blue-100 text-blue-800'
    }
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Phone className="h-8 w-8 animate-pulse mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading calls...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calls</h1>
          <p className="text-gray-600">Manage your phone calls and call history</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by phone number or client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={directionFilter} onValueChange={setDirectionFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Directions</SelectItem>
                <SelectItem value="inbound">Inbound</SelectItem>
                <SelectItem value="outbound">Outbound</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="ringing">Ringing</SelectItem>
                <SelectItem value="connected">Connected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
          <CardDescription>
            {filteredCalls.length} call{filteredCalls.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCalls.length === 0 ? (
            <div className="text-center py-8">
              <PhoneCall className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No calls found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCalls.map((call) => {
                const CallIcon = getCallIcon(call)
                return (
                  <div
                    key={call.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <CallIcon className={`h-5 w-5 ${getCallIconColor(call)}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {call.direction === 'inbound' ? call.caller_number : call.callee_number}
                          </span>
                          {call.clients && (
                            <span className="text-sm text-gray-600">({call.clients.name})</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(call.start_time), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge className={getStatusBadge(call.status)}>
                          {call.status}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatDuration(call.duration)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {call.recording_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(call.recording_url, '_blank')}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {call.status === 'completed' && call.clients && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLogTime(call)}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCall && (
        <CallTimeEntryDialog
          open={timeEntryOpen}
          onOpenChange={setTimeEntryOpen}
          call={selectedCall}
        />
      )}
    </div>
  )
}
