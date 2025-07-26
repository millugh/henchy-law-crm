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

export default function WillsSuccessionsMattersPage() {
  const { matters, loading, error } = useMatters()

  const willsSuccessionMatters = matters.filter(matter => 
    matter.matter_type === 'Wills & Successions' || 
    matter.matter_type === 'wills-successions' ||
    matter.title.toLowerCase().includes('will') ||
    matter.title.toLowerCase().includes('succession')
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wills & Successions Matters</CardTitle>
          <CardDescription>Loading wills & successions matters...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wills & Successions Matters</CardTitle>
          <CardDescription>Error loading matters: {error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Wills & Successions Matters</CardTitle>
          <CardDescription>Manage all wills, trusts, and succession matters.</CardDescription>
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
              <TableHead>Matter Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {willsSuccessionMatters.map((matter) => (
              <TableRow key={matter.id}>
                <TableCell className="font-medium">
                  <Link href={`/matters/wills-successions/${matter.id}`} className="hover:underline">
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
                        <Link href={`/matters/wills-successions/${matter.id}`}>View Details</Link>
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
