import type React from "react"
import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

export const metadata: Metadata = {
  title: "Henchy Law Firm CRM",
  description: "Client Relationship Management for Henchy Law Firm",
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">{children}</main>
      </div>
    </div>
  )
}
