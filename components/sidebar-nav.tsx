"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  title: string
  href: string
  icon?: LucideIcon
}

type SidebarNavProps = {
  items: NavItem[]
  className?: string
}

export function SidebarNav({ items, className }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-1 flex-col gap-1", className)}>
      {items.map(({ title, href, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/" && pathname?.startsWith(`${href}/`))

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-muted hover:text-foreground/90",
              isActive ? "bg-muted text-foreground" : "text-foreground/70",
            )}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            <span className="truncate">{title}</span>
          </Link>
        )
      })}
    </nav>
  )
}
