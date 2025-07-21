"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { mainNavLinks } from "@/lib/data"
import { cn } from "@/lib/utils"

export function Nav() {
  const pathname = usePathname()

  return (
    <TooltipProvider>
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        {mainNavLinks.map((link) => {
          const isActive = link.href === "/dashboard" ? pathname === link.href : pathname.startsWith(link.href)
          return (
            <Tooltip key={link.title}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    isActive && "bg-accent text-accent-foreground",
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="sr-only">{link.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{link.title}</TooltipContent>
            </Tooltip>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}
