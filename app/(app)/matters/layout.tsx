import type React from "react"

interface MattersLayoutProps {
  children: React.ReactNode
}

export default function MattersLayout({ children }: MattersLayoutProps) {
  return (
    <main className="flex-1 p-4 md:p-6">{children}</main>
  )
}
