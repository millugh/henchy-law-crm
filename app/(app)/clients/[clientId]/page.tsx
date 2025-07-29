"use client"

import { notFound, useParams } from "next/navigation"
import {
  CLIENTS,
  TIMELINE_ACTIVITIES,
  type Client,
  type ActivityEvent,
  realEstateMatters,
  titlePolicyMatters,
  willsSuccessionMatters,
} from "@/lib/data"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Mail, PlusCircle, Briefcase } from "lucide-react"
import { ActivityTimeline } from "@/components/activity-timeline"
import { AddActivityForm } from "@/components/add-activity-form"
import { useState } from "react"
import { CXDialer } from "@/components/3cx-dialer"

function ClientHeader({ client }: { client: Client }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
      <div className="relative flex h-24 w-24 shrink-0 overflow-hidden rounded-lg border">
        {client.logoUrl ? (
          <Image
            src={client.logoUrl || "/placeholder.svg"}
            alt={`${client.name} logo`}
            layout="fill"
            objectFit="contain"
            className="p-2"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-3xl">
            {client.name.charAt(0)}
          </div>
        )}
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={client.status === "Active" ? "secondary" : "outline"}>{client.status}</Badge>
          <span className="text-sm text-muted-foreground">
            Last interaction: {new Date(client.lastInteraction).toLocaleDateString()}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {client.practiceAreas.map((area) => (
            <Badge key={area} variant="outline" className="font-normal">
              {area}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

function KeyContacts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Contacts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">No contacts available for this client.</p>
        <Button variant="outline" className="w-full bg-transparent">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Contact
        </Button>
      </CardContent>
    </Card>
  )
}

function ClientMatters({ clientId }: { clientId: string }) {
  const matters = [...realEstateMatters, ...titlePolicyMatters, ...willsSuccessionMatters].filter(
    (m) => m.clientId === clientId,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {matters.length > 0 ? (
          matters.map((matter) => (
            <div key={matter.id} className="flex items-center gap-4">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">{matter.name}</p>
                <p className="text-sm text-muted-foreground">{matter.id}</p>
              </div>
              <Badge variant="outline" className="ml-auto">
                {matter.status}
              </Badge>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No matters for this client.</p>
        )}
        <Button variant="outline" className="w-full bg-transparent">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Matter
        </Button>
      </CardContent>
    </Card>
  )
}

export default function ClientDetailPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const client = CLIENTS.find((c) => c.id === clientId)
  const [activity, setActivity] = useState<ActivityEvent[]>(
    TIMELINE_ACTIVITIES.filter((a) => a.clientId === clientId).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    ),
  )

  if (!client) {
    notFound()
  }

  const handleAddActivity = (newActivity: { type: string; description: string; user: string }) => {
    const event: ActivityEvent = {
      id: `act-${Date.now()}`,
      clientId: client.id,
      type: newActivity.type as ActivityEvent["type"],
      timestamp: new Date().toISOString(),
      user: newActivity.user,
      description: `added a ${newActivity.type}.`,
      details: newActivity.description,
    }
    setActivity([event, ...activity])
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <ClientHeader client={client} />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <ActivityTimeline activity={activity} />
          <AddActivityForm onAddActivity={handleAddActivity} />
        </div>
        <div className="space-y-6">
          <KeyContacts />
          <ClientMatters clientId={client.id} />
        </div>
      </div>
    </div>
  )
}
