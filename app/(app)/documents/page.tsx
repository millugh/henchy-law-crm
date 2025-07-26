"use client"

import { Folder, File, Upload, FolderPlus, MoreVertical, HardDrive } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { FileSystemItem, Breadcrumb } from "@/lib/data"
import { FileTableSkeleton } from "@/components/file-table-skeleton"
import { DocumentUploadDialog } from "@/components/document-upload-dialog"
import { useToast } from "@/components/ui/use-toast"

interface DocumentRecord {
  id: string
  name: string
  file_type: string
  file_size: number
  file_url: string
  created_at: string
}

export default function DocumentsPage() {
  const [items, setItems] = React.useState<FileSystemItem[]>([])
  const [breadcrumbs, setBreadcrumbs] = React.useState<Breadcrumb[]>([])
  const [currentFolderId, setCurrentFolderId] = React.useState("documents")
  const [isLoading, setIsLoading] = React.useState(true)
  const { toast } = useToast()

  React.useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/documents')
        if (!response.ok) {
          throw new Error('Failed to fetch documents')
        }
        const data = await response.json()
        
        const documentItems: FileSystemItem[] = data.documents.map((doc: DocumentRecord) => ({
          id: doc.id,
          name: doc.name,
          type: "file" as const,
          size: doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} KB` : undefined,
          lastModified: doc.created_at ? new Date(doc.created_at).toLocaleDateString() : undefined,
          fileType: doc.file_type,
          url: doc.file_url,
          parentId: currentFolderId
        }))

        setItems(documentItems)
        setBreadcrumbs([{ id: "documents", name: "Documents" }])
      } catch (error) {
        console.error("Failed to fetch files:", error)
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFiles()
  }, [currentFolderId, toast])

  const handleDocumentUpload = (documents: DocumentRecord[]) => {
    const newItems: FileSystemItem[] = documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: "file" as const,
      size: doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} KB` : undefined,
      lastModified: new Date(doc.created_at).toLocaleDateString(),
      fileType: doc.file_type,
      url: doc.file_url,
      parentId: currentFolderId
    }))
    setItems([...newItems, ...items])
  }

  const handleItemClick = (item: FileSystemItem) => {
    if (item.type === "folder") {
      setCurrentFolderId(item.id)
    } else {
      // Handle file click (e.g., open preview)
      console.log("Opening file:", item.name)
    }
  }

  const handleBreadcrumbClick = (folderId: string) => {
    setCurrentFolderId(folderId)
  }

  const getFileIcon = (item: FileSystemItem) => {
    if (item.type === "folder") return <Folder className="h-5 w-5 text-yellow-500" />
    switch (item.fileType) {
      case "pdf":
        return <File className="h-5 w-5 text-red-500" />
      case "docx":
        return <File className="h-5 w-5 text-blue-500" />
      case "xlsx":
        return <File className="h-5 w-5 text-green-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <HardDrive className="h-4 w-4" />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => handleBreadcrumbClick(crumb.id)}
                    className={index === breadcrumbs.length - 1 ? "font-semibold text-primary" : "cursor-pointer"}
                  >
                    {crumb.name.replace("F: > ", "")}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <DocumentUploadDialog onUpload={handleDocumentUpload}>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
          </DocumentUploadDialog>
        </div>
      </div>

      {isLoading ? (
        <FileTableSkeleton />
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-[100px]">Size</TableHead>
                <TableHead className="w-[200px]">Last Modified</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={item.type === "folder" ? "cursor-pointer" : ""}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getFileIcon(item)}
                      <span>{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.size || "—"}</TableCell>
                  <TableCell>{item.lastModified || "—"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
