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
import { RealEstateMatterDialog } from "@/components/real-estate-matter-dialog"
import { useRealEstateMatters } from "@/hooks/use-real-estate-matters"
import type { RealEstateMatter } from "@/lib/data"

export default function RealEstateMattersPage() {
  const { matters, loading, error, createMatter } = useRealEstateMatters()

  const handleSaveMatter = async (data: Omit<RealEstateMatter, "id" | "clientName">) => {
    await createMatter(data)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Real Estate Matters</CardTitle>
          <CardDescription>Manage all real estate transactions.</CardDescription>
        </div>
        <RealEstateMatterDialog onSave={handleSaveMatter}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Matter
          </Button>
        </RealEstateMatterDialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading matters...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">Error: {error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matter Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Property Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matters.map((matter) => (
                <TableRow key={matter.id}>
                  <TableCell className="font-medium">
                    <Link href={`/matters/real-estate/${matter.id}`} className="hover:underline">
                      {matter.name}
                    </Link>
                  </TableCell>
                  <TableCell>{matter.clientName}</TableCell>
                  <TableCell>{matter.propertyAddress}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{matter.status}</Badge>
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
        )}
      </CardContent>
    </Card>
  )
}
