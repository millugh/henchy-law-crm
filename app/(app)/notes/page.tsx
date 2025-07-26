"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { RichTextEditor } from "@/components/rich-text-editor"
import { CLIENTS } from "@/lib/data"
import type { Task } from "@/lib/data"

function DashboardClientSearch({ 
  clients, 
  selectedClient, 
  onSelectClient 
}: { 
  clients: any[]
  selectedClient: any
  onSelectClient: (client: any) => void 
}) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <div className="grid gap-2">
      <Label htmlFor="client">Client (Optional)</Label>
      <div className="relative">
        <Input
          value={selectedClient?.name || value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search clients..."
          className="w-full"
        />
        {value && !selectedClient && (
          <div className="absolute top-full left-0 right-0 bg-background border border-t-0 rounded-b-md shadow-lg z-10 max-h-40 overflow-y-auto">
            {clients.filter(client => 
              client.name.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5).map((client) => (
              <div
                key={client.id}
                className="p-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                onClick={() => {
                  onSelectClient(client)
                  setValue("")
                }}
              >
                {client.name}
              </div>
            ))}
          </div>
        )}
        {selectedClient && (
          <div className="mt-2 p-2 bg-accent rounded-md flex items-center justify-between">
            <span className="text-sm">{selectedClient.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedClient(null)}
            >
              ×
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function NotesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedClient, setSelectedClient] = React.useState<any>(null)
  const [noteContent, setNoteContent] = React.useState("")
  const [noteTitle, setNoteTitle] = React.useState("")

  const handleSave = () => {
    if (!noteContent.trim()) {
      toast({ 
        title: "Note is empty", 
        description: "Please write a note before saving.", 
        variant: "destructive" 
      })
      return
    }

    const newActivity = {
      id: `ACT-${Date.now()}`,
      user: { name: "John Henchy" }, // Current user
      description: noteTitle || noteContent.substring(0, 50) + "...",
      clientName: selectedClient?.name,
      timestamp: new Date().toLocaleString(),
    }

    toast({ 
      title: "Note Saved", 
      description: "Your note has been added to the activity feed." 
    })
    
    setNoteContent("")
    setNoteTitle("")
    setSelectedClient(null)
  }

  const handleConvertToTask = () => {
    if (!noteContent.trim()) {
      toast({
        title: "Note is empty",
        description: "Please write a note before converting to a task.",
        variant: "destructive",
      })
      return
    }

    const newTask: Task = {
      id: `TASK-${Date.now()}`,
      description: noteTitle || noteContent.substring(0, 100),
      clientName: selectedClient?.name || "Unassigned",
      completed: false,
    }

    toast({ 
      title: "Task Created", 
      description: "The note has been converted to a task." 
    })
    
    setNoteContent("")
    setNoteTitle("")
    setSelectedClient(null)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">Create and manage your notes with rich text formatting</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Enter a title for your note..."
            />
          </div>

          <DashboardClientSearch 
            clients={CLIENTS} 
            selectedClient={selectedClient} 
            onSelectClient={setSelectedClient} 
          />

          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor
              content={noteContent}
              onChange={setNoteContent}
              placeholder="Write your note here..."
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Note
            </Button>
            <Button 
              className="bg-yellow-600 text-white hover:bg-yellow-600/90" 
              onClick={handleConvertToTask}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Convert to Task
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
