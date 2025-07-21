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
import { UploadCloud } from "lucide-react"
import { useState, useRef } from "react"

interface DocumentUploadDialogProps {
  onUpload: (files: File[]) => void
  children: React.ReactNode
}

export function DocumentUploadDialog({ onUpload, children }: DocumentUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files))
    }
  }

  const handleUpload = () => {
    if (files.length > 0) {
      onUpload(files)
      setFiles([])
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>Select files from your computer to upload.</DialogDescription>
        </DialogHeader>
        <div
          className="mt-4 border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            {files.length > 0 ? `${files.length} file(s) selected` : "Click or drag files to upload"}
          </p>
          <Input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
        </div>
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <Label>Selected files:</Label>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              {files.map((file, i) => (
                <li key={i}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={files.length === 0}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
