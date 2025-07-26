"use client"

import { PlusCircle, MoreHorizontal } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMatters } from "@/hooks/use-matters"

export default function RealEstateMattersPage() {
  const { matters, loading, error, createMatter } = useMatters()

  const realEstateMatters = matters.filter(matter => 
    matter.matter_type === 'Real Estate' || 
    matter.matter_type === 'real-estate' ||
    matter.title.toLowerCase().includes('real estate')
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real Estate Matters</CardTitle>
          <CardDescription>Loading real estate matters...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real Estate Matters</CardTitle>
          <CardDescription>Error loading matters: {error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Real Estate Matters</CardTitle>
          <CardDescription>Manage all real estate transactions.</CardDescription>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Matter
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matter Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {realEstateMatters.map((matter) => (
              <TableRow key={matter.id}>
                <TableCell className="font-medium">
                  <Link href={`/matters/real-estate/${matter.id}`} className="hover:underline">
                    {matter.title}
                  </Link>
                </TableCell>
                <TableCell>{matter.clients?.name || "Unknown"}</TableCell>
                <TableCell>{matter.description || "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {matter.status.charAt(0).toUpperCase() + matter.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/matters/real-estate/${matter.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
