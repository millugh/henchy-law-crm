"use client"

import { notFound, useParams } from "next/navigation"
import { titlePolicyMatters, ACTIVITY_TIMELINE, type ActivityEvent } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActivityTimeline } from "@/components/activity-timeline"
import { AddActivityForm } from "@/components/add-activity-form"
import { useState } from "react"
import { FileText, User, MapPin, ShieldCheck, DollarSign, Upload } from "lucide-react"
import { DocumentUploadDialog } from "@/components/document-upload-dialog"

interface DocumentRecord {
  id: string
  name: string
  file_type: string
  file_size: number
  file_url: string
  created_at: string
}
import { Button } from "@/components/ui/button"

type Document = {
  name: string
  type: "pdf" | "docx" | "png"
  size: string
}

export default function TitlePolicyMatterDetailPage() {
  const params = useParams()
  const matterId = params.matterId as string
  const matter = titlePolicyMatters.find((m) => m.id === matterId)

  const [activity, setActivity] = useState<ActivityEvent[]>(
    ACTIVITY_TIMELINE.filter((a) => a.matterId === matterId).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    ),
  )
  const [documents, setDocuments] = useState<Document[]>([])

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
      description: `added a ${newActivity.type} to '${matter.policyNumber}'.`,
      details: newActivity.description,
    }
    setActivity([event, ...activity])
  }

  const handleDocumentUpload = (uploadedDocuments: DocumentRecord[]) => {
    const newDocuments: Document[] = uploadedDocuments.map((doc) => ({
      name: doc.name,
      type: doc.file_type as Document["type"],
      size: doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} KB` : "0 KB",
    }))
    setDocuments([...documents, ...newDocuments])
  }

  React.useEffect(() => {
    const fetchMatterDocuments = async () => {
      try {
        const response = await fetch(`/api/documents?matterId=${matterId}`)
        if (response.ok) {
          const data = await response.json()
          const matterDocs: Document[] = data.documents.map((doc: DocumentRecord) => ({
            name: doc.name,
            type: doc.file_type as Document["type"],
            size: doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} KB` : "0 KB",
          }))
          setDocuments(matterDocs)
        }
      } catch (error) {
        console.error('Failed to fetch matter documents:', error)
      }
    }

    fetchMatterDocuments()
  }, [matterId])

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
              <DocumentUploadDialog 
                onUpload={handleDocumentUpload}
                matterId={matterId}
                clientId={matter.clientId}
              >
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
          <ActivityTimeline activity={activity} title="Matter Timeline" />
          <AddActivityForm onAddActivity={handleAddActivity} />
        </div>
        <div className="space-y-6">{/* Placeholder for related contacts or other info */}</div>
      </div>
    </div>
  )
}
