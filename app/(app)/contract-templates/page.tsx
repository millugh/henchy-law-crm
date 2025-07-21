"use client"

import { CardFooter } from "@/components/ui/card"

import * as React from "react"
import { Download, Mail, PlusCircle, Search, UploadCloud, View, X } from "lucide-react"

import type { contractTemplates as initialTemplates } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { contractTemplates } from "@/lib/data"

type Template = (typeof initialTemplates)[0]

function NewTemplateDialog({ onSave }: { onSave: (newTemplate: Template) => void }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const [isDraggingOver, setIsDraggingOver] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const { toast } = useToast()

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      // You can add file type/size validation here
      setFile(selectedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0] ?? null)
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDraggingOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDraggingOver(false)
    handleFileSelect(e.dataTransfer.files?.[0] ?? null)
  }

  const resetForm = () => {
    setName("")
    setCategory("")
    setDescription("")
    setFile(null)
    setIsUploading(false)
    setUploadProgress(0)
  }

  const handleSubmit = () => {
    if (!name || !category || !description || !file) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields and select a file to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          return prev
        }
        return prev + 5
      })
    }, 100)

    setTimeout(() => {
      clearInterval(interval)
      setUploadProgress(100)

      const newTemplate: Template = {
        id: `TPL-${Date.now()}`,
        name,
        category,
        description,
      }

      onSave(newTemplate)

      toast({
        title: "Template Created",
        description: `The "${name}" template has been successfully added.`,
      })

      // Close dialog after a short delay
      setTimeout(() => {
        resetForm()
        setOpen(false)
      }, 500)
    }, 2000) // Simulate a 2-second upload
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isUploading) {
          resetForm()
        }
        setOpen(isOpen)
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Upload a document and provide details to add it to the template library.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Commercial Lease"
              disabled={isUploading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Real Estate"
              disabled={isUploading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the purpose of this template."
              rows={3}
              disabled={isUploading}
            />
          </div>
          <div className="grid gap-2">
            <Label>Template File</Label>
            {file && !isUploading ? (
              <div className="flex items-center justify-between p-2.5 pl-4 border rounded-md bg-secondary">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground truncate max-w-[250px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="file-upload"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-32 px-4 transition bg-background border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none",
                  isDraggingOver && "border-primary bg-primary/10",
                  isUploading && "cursor-not-allowed opacity-50",
                )}
              >
                {isUploading ? (
                  <div className="w-full px-4 text-center">
                    <p className="text-sm font-medium mb-2">Uploading {file?.name}...</p>
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{uploadProgress}%</p>
                  </div>
                ) : (
                  <span className="flex items-center space-x-2">
                    <UploadCloud className="w-6 h-6 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground">Click or drag file to upload</span>
                  </span>
                )}
              </label>
            )}
            <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Create Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ContractTemplatesPage() {
  const [templates, setTemplates] = React.useState<Template[]>(contractTemplates)
  const [searchTerm, setSearchTerm] = React.useState("")

  const handleSaveTemplate = (newTemplate: Template) => {
    setTemplates((prev) => [newTemplate, ...prev].sort((a, b) => a.name.localeCompare(b.name)))
  }

  const filteredTemplates = React.useMemo(() => {
    if (!searchTerm) return templates

    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm, templates])

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Contract Templates</CardTitle>
          <CardDescription>
            Browse and manage standardized contract templates for various legal matters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <NewTemplateDialog onSave={handleSaveTemplate} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {template.category}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => alert(`Viewing ${template.name}`)}
                  >
                    <View className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button className="w-full" onClick={() => alert(`Downloading ${template.name}`)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
