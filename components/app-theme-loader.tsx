"use client"

import { useTheme } from "next-themes"
import * as React from "react"

export function AppThemeLoader({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <div className={theme}>{children}</div>
}
