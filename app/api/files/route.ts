import { NextResponse } from "next/server"
import { fileSystemItems } from "@/lib/data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parentId = searchParams.get("parentId") || "legal" // Default to root

  try {
    const items = fileSystemItems.filter((item) => item.parentId === parentId)
    const currentFolder = fileSystemItems.find((item) => item.id === parentId)
    const breadcrumbs = []
    let current = currentFolder
    while (current) {
      breadcrumbs.unshift({ id: current.id, name: current.name })
      current = fileSystemItems.find((item) => item.id === current?.parentId)
    }

    return NextResponse.json({ items, breadcrumbs })
  } catch (err) {
    console.error('API Error:', err)
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
  }
}
