"use client"

import { useState } from "react"
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
import { useClients } from "@/hooks/use-clients"
import { type Matter } from "@/lib/api"
import { RealEstateMatterDialog } from "@/components/real-estate-matter-dialog"

export default function RealEstateMattersPage() {
  const { matters, loading, error, createMatter } = useMatters('real_estate')
  const { clients } = useClients()

  const handleSaveMatter = async (data: {
    name: string
    description: string
    status: string
    clientId: string
    propertyAddress: string
  }) => {
    const result = await createMatter({
      title: data.name,
      description: data.description,
      status: data.status,
      matter_type: 'real_estate',
      open_date: new Date().toISOString().split('T')[0],
      close_date: null,
      client_id: data.clientId,
      practice_area_id: null,
      property_address: data.propertyAddress,
    })
    
    if (!result.success) {
      console.error('Failed to create matter:', result.error)
    }
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
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading matters...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">Error loading matters: {error}</div>
          </div>
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
                      {matter.title}
                    </Link>
                  </TableCell>
                  <TableCell>{matter.clients?.name}</TableCell>
                  <TableCell>{matter.property_address}</TableCell>
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
