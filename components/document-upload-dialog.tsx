"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
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
import { UploadCloud, X } from "lucide-react"
import { useState, useRef } from "react"
import { validateFile } from "@/lib/file-validation"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

interface DocumentRecord {
  id: string
  name: string
  file_type: string
  file_size: number
  file_url: string
  created_at: string
}

interface DocumentUploadDialogProps {
  onUpload?: (documents: DocumentRecord[]) => void
  children: React.ReactNode
  clientId?: string
  matterId?: string
  folderPath?: string
}

export function DocumentUploadDialog({ 
  onUpload, 
  children, 
  clientId, 
  matterId, 
  folderPath = '/' 
}: DocumentUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files)
      const validFiles: File[] = []
      const errors: string[] = []

      selectedFiles.forEach(file => {
        const validationError = validateFile(file)
        if (validationError) {
          errors.push(`${file.name}: ${validationError.message}`)
        } else {
          validFiles.push(file)
        }
      })

      if (errors.length > 0) {
        toast({
          title: "File Validation Errors",
          description: errors.join('\n'),
          variant: "destructive",
        })
      }

      setFiles(validFiles)
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const uploadedDocuments = []
      const totalFiles = files.length

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)
        if (clientId) formData.append('clientId', clientId)
        if (matterId) formData.append('matterId', matterId)
        formData.append('folderPath', folderPath)

        const response = await fetch('/api/documents', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const result = await response.json()
        uploadedDocuments.push(result.document)

        setUploadProgress(((i + 1) / totalFiles) * 100)
      }

      toast({
        title: "Upload Successful",
        description: `${files.length} file(s) uploaded successfully`,
      })

      if (onUpload) {
        onUpload(uploadedDocuments)
      }

      setFiles([])
      setIsOpen(false)
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'An error occurred during upload',
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Select files to upload. Supported formats: PDF, DOCX, XLSX, TXT, PNG, JPG (max 10MB each)
          </DialogDescription>
        </DialogHeader>
        
        {!isUploading && (
          <div
            className="mt-4 border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {files.length > 0 ? `${files.length} file(s) selected` : "Click or drag files to upload"}
            </p>
            <Input 
              ref={fileInputRef} 
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleFileChange}
              accept=".pdf,.docx,.xlsx,.txt,.png,.jpg,.jpeg"
            />
          </div>
        )}

        {isUploading && (
          <div className="mt-4 space-y-4">
            <div className="text-center">
              <p className="text-sm font-medium mb-2">Uploading files...</p>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(uploadProgress)}%</p>
            </div>
          </div>
        )}

        {files.length > 0 && !isUploading && (
          <div className="mt-4 space-y-2">
            <Label>Selected files:</Label>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeFile(i)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={files.length === 0 || isUploading}>
            {isUploading ? "Uploading..." : `Upload ${files.length} file(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
