"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { SIDEBAR_NAV_ITEMS } from "@/lib/data"
import { MissedCallsBadge } from "./missed-calls-badge"
import { cn } from "@/lib/utils"
import { UserProfile } from "@/components/user-profile"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image src="/henchy-law-firm-logo.png" width={32} height={32} alt="Henchy Law Firm" />
            <span className="">Henchy Law Firm, LLC</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {SIDEBAR_NAV_ITEMS.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === item.href && "text-primary bg-muted",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
                {item.title === "Calls" && <MissedCallsBadge />}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          <UserProfile />
        </div>
      </div>
    </div>
  )
}
