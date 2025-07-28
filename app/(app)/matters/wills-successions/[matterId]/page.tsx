"use client"

import { notFound, useParams } from "next/navigation"
import { useMatters } from "@/hooks/use-matters"
import { useMatterActivities } from "@/hooks/use-matter-activities"
import { type ActivityEvent } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActivityTimeline } from "@/components/activity-timeline"
import { AddActivityForm } from "@/components/add-activity-form"
import { useState } from "react"
import { FileSignature, User, Users2, Calendar } from "lucide-react"

export default function WillsSuccessionMatterDetailPage() {
  const params = useParams()
  const matterId = params.matterId as string
  const { matters } = useMatters('wills_successions')
  const { activities, createActivity } = useMatterActivities(matterId)
  
  const matter = matters.find((m) => m.id === matterId)

  if (!matter) {
    notFound()
  }

  const handleAddActivity = async (newActivity: { type: string; description: string; user: string }) => {
    if (!matter) return
    
    const result = await createActivity({
      client_id: matter.client_id,
      type: newActivity.type as ActivityEvent["type"],
      user: newActivity.user,
      description: `added a ${newActivity.type} to '${matter.title}'.`,
      details: newActivity.description,
      timestamp: new Date().toISOString(),
    })
    
    if (!result.success) {
      console.error('Failed to create activity:', result.error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="secondary" className="mb-2">
                Wills & Successions
              </Badge>
              <CardTitle className="text-3xl">{matter.title}</CardTitle>
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
              <span>Client: {matter.clientName}</span>
            </div>
            <div className="flex items-center gap-3">
              <FileSignature className="h-5 w-5 text-muted-foreground" />
              <span>Decedent: {matter.decedentName}</span>
            </div>
            {matter.dateOfDeath && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>Date of Death: {new Date(matter.dateOfDeath).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Users2 className="h-5 w-5 text-muted-foreground mt-1" />
              <p>
                <span className="font-semibold">Key Beneficiaries: </span>
                <span className="text-muted-foreground">{matter.keyBeneficiaries}</span>
              </p>
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
          <ActivityTimeline activity={activities} title="Matter Timeline" />
          <AddActivityForm onAddActivity={handleAddActivity} />
        </div>
        <div className="space-y-6">{/* Placeholder for related contacts or other info */}</div>
      </div>
    </div>
  )
}
