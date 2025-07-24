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

export default function DocumentsPage() {
  const [items, setItems] = React.useState<FileSystemItem[]>([])
  const [breadcrumbs, setBreadcrumbs] = React.useState<Breadcrumb[]>([])
  const [currentFolderId, setCurrentFolderId] = React.useState("legal")
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/files?parentId=${currentFolderId}`)
        const data = await response.json()
        setItems(data.items)
        setBreadcrumbs(data.breadcrumbs)
      } catch (error) {
        console.error("Failed to fetch files:", error)
        // Handle error state in UI
      } finally {
        setIsLoading(false)
      }
    }

    fetchFiles()
  }, [currentFolderId])

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
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
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
