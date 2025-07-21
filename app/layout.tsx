import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AppThemeLoader } from "@/components/app-theme-loader"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Henchy Law Firm, LLC - CRM",
  description: "Client Relationship Management for Henchy Law Firm, LLC",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <AppThemeLoader>
              {children}
              <Toaster />
            </AppThemeLoader>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
