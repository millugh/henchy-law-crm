"use client"

import { notFound, useParams } from "next/navigation"
import { realEstateMatters, ACTIVITY_TIMELINE, type ActivityEvent } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActivityTimeline } from "@/components/activity-timeline"
import { AddActivityForm } from "@/components/add-activity-form"
import { useState } from "react"
import { FileText, User, MapPin } from "lucide-react"

export default function RealEstateMatterDetailPage() {
  const params = useParams()
  const matterId = params.matterId as string
  const matter = realEstateMatters.find((m) => m.id === matterId)

  const [activity, setActivity] = useState<ActivityEvent[]>(
    ACTIVITY_TIMELINE.filter((a) => a.matterId === matterId).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    ),
  )

  if (!matter) {
    notFound()
  }

  const handleAddActivity = (newActivity: { type: string; description: string; user: string }) => {
    const event: ActivityEvent = {
      id: `act-${Date.now()}`,
      clientId: matter.clientId,
      matterId: matter.id,
      type: newActivity.type as ActivityEvent["type"],
      timestamp: new Date().toISOString(),
      user: newActivity.user,
      description: `added a ${newActivity.type} to '${matter.name}'.`,
      details: newActivity.description,
    }
    setActivity([event, ...activity])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="secondary" className="mb-2">
                Real Estate
              </Badge>
              <CardTitle className="text-3xl">{matter.name}</CardTitle>
              <CardDescription>{matter.id}</CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {matter.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Matter Details</h3>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <span>{matter.clientName}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{matter.propertyAddress}</span>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-1" />
              <p className="text-muted-foreground">{matter.description}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Key Documents</h3>
            <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <ActivityTimeline activity={activity} title="Matter Timeline" />
          <AddActivityForm onAddActivity={handleAddActivity} />
        </div>
        <div className="space-y-6">{/* Placeholder for related contacts or other info */}</div>
      </div>
    </div>
  )
}
