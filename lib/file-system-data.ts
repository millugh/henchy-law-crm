export type FileSystemItem = {
  id: string
  name: string
  type: "file" | "folder"
  parentId?: string
  size?: string
  lastModified?: string
  fileType?: "pdf" | "docx" | "xlsx" | "txt" | string
  url?: string
}

export const fileSystemItems: FileSystemItem[] = [
  {
    id: "legal",
    name: "Legal Documents",
    type: "folder",
  },
  
  {
    id: "ep-breaux-folder",
    name: "E.P. Breaux Utility Services, LLC",
    type: "folder",
    parentId: "legal",
  },
  {
    id: "hancock-whitney-folder", 
    name: "Hancock Whitney Bank",
    type: "folder",
    parentId: "legal",
  },
  {
    id: "red-river-folder",
    name: "Red River Bank", 
    type: "folder",
    parentId: "legal",
  },
  {
    id: "community-behavioral-folder",
    name: "Community Behavioral Healthcare, LLC",
    type: "folder",
    parentId: "legal",
  },
  {
    id: "harmony-center-folder",
    name: "Harmony Center, Inc.",
    type: "folder", 
    parentId: "legal",
  },

  {
    id: "real-estate-folder",
    name: "Real Estate",
    type: "folder",
    parentId: "legal",
  },
  {
    id: "title-policy-folder",
    name: "Title Policies",
    type: "folder", 
    parentId: "legal",
  },
  {
    id: "wills-successions-folder",
    name: "Wills & Successions",
    type: "folder",
    parentId: "legal",
  },

  {
    id: "purchase-agreement-file",
    name: "Purchase Agreement - 123 Main St.pdf",
    type: "file",
    parentId: "ep-breaux-folder",
    size: "2.1 MB",
    lastModified: "2024-07-15",
    fileType: "pdf",
    url: "/documents/purchase-agreement.pdf",
  },
  {
    id: "title-policy-file",
    name: "Title Policy HW-2024-589.pdf", 
    type: "file",
    parentId: "hancock-whitney-folder",
    size: "850 KB",
    lastModified: "2024-07-12",
    fileType: "pdf",
    url: "/documents/title-policy.pdf",
  },
  {
    id: "intake-form-file",
    name: "Client Intake Form - CBH.docx",
    type: "file",
    parentId: "community-behavioral-folder", 
    size: "120 KB",
    lastModified: "2024-07-09",
    fileType: "docx",
    url: "/documents/intake-form.docx",
  },

  {
    id: "lease-agreement-file",
    name: "Commercial Lease Agreement Template.docx",
    type: "file",
    parentId: "real-estate-folder",
    size: "95 KB", 
    lastModified: "2024-06-20",
    fileType: "docx",
    url: "/documents/lease-template.docx",
  },
  {
    id: "will-template-file",
    name: "Last Will and Testament Template.docx",
    type: "file",
    parentId: "wills-successions-folder",
    size: "78 KB",
    lastModified: "2024-05-15", 
    fileType: "docx",
    url: "/documents/will-template.docx",
  },
  {
    id: "contract-template-file",
    name: "Service Agreement Template.docx",
    type: "file",
    parentId: "ep-breaux-folder",
    size: "112 KB",
    lastModified: "2024-07-10",
    fileType: "docx",
    url: "/documents/service-agreement-template.docx",
  },
  {
    id: "discovery-response-file",
    name: "Discovery Response - RRB Case.pdf",
    type: "file",
    parentId: "red-river-folder",
    size: "1.8 MB",
    lastModified: "2024-07-08",
    fileType: "pdf",
    url: "/documents/discovery-response.pdf",
  },
  {
    id: "succession-petition-file",
    name: "Succession Petition - Doe Estate.pdf",
    type: "file",
    parentId: "wills-successions-folder",
    size: "945 KB",
    lastModified: "2024-06-25",
    fileType: "pdf",
    url: "/documents/succession-petition.pdf",
  },
]
