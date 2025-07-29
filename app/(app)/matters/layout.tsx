import type React from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { PRACTICE_AREAS } from "@/lib/data"

interface MattersLayoutProps {
  children: React.ReactNode
}

export default function MattersLayout({ children }: MattersLayoutProps) {
  const matterNavItems = PRACTICE_AREAS.map((area) => ({
    title: area.name,
    href: `/matters/${area.name.toLowerCase().replace(/\s+/g, '-')}`,
  }))

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside className="hidden md:block w-64 border-r p-4">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Practice Areas</h2>
        <SidebarNav items={matterNavItems} />
      </aside>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  )
}
