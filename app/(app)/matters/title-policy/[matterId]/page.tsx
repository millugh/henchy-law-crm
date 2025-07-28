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
import { FileText, User, MapPin, ShieldCheck, DollarSign, Upload } from "lucide-react"
import { DocumentUploadDialog } from "@/components/document-upload-dialog"
import { Button } from "@/components/ui/button"

type Document = {
  name: string
  type: "pdf" | "docx" | "png"
  size: string
}

export default function TitlePolicyMatterDetailPage() {
  const params = useParams()
  const matterId = params.matterId as string
  const { matters } = useMatters('title_policy')
  const { activities, createActivity } = useMatterActivities(matterId)
  
  const matter = matters.find((m) => m.id === matterId)
  const [documents, setDocuments] = useState<Document[]>([])

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

  const handleUploadDocuments = (files: File[]) => {
    const newDocuments: Document[] = files.map((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase()
      let type: Document["type"] = "docx"
      if (extension === "pdf") type = "pdf"
      if (extension === "png") type = "png"

      return {
        name: file.name,
        type: type,
        size: `${(file.size / 1024).toFixed(2)} KB`,
      }
    })
    setDocuments([...documents, ...newDocuments])
  }

  const getFileIcon = (type: Document["type"]) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "png":
        return <FileText className="h-5 w-5 text-purple-500" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="secondary" className="mb-2">
                Title Policy
              </Badge>
              <CardTitle className="text-3xl">Policy #{matter.policyNumber}</CardTitle>
              <CardDescription>{matter.id}</CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {matter.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Policy Details</h3>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <span>Client: {matter.clientName}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>Property: {matter.propertyAddress}</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <span>Insured: {matter.insuredParties}</span>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span>Coverage: {formatCurrency(matter.coverageAmount)}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Key Documents</h3>
              <DocumentUploadDialog onUpload={handleUploadDocuments}>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </DocumentUploadDialog>
            </div>
            {documents.length > 0 ? (
              <ul className="space-y-2">
                {documents.map((doc, i) => (
                  <li key={i} className="flex items-center gap-3 p-2 border rounded-md">
                    {getFileIcon(doc.type)}
                    <span className="flex-grow font-medium text-sm">{doc.name}</span>
                    <span className="text-xs text-muted-foreground">{doc.size}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            )}
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
