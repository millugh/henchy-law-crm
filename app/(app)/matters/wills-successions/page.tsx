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
import { WillsSuccessionMatterDialog } from "@/components/wills-succession-matter-dialog"

export default function WillsSuccessionsMattersPage() {
  const { matters, loading, error, createMatter } = useMatters('wills_successions')
  const { clients } = useClients()

  const handleSaveMatter = async (data: {
    name: string
    status: string
    clientId: string
    decedentName: string
    dateOfDeath?: string
    keyBeneficiaries: string
  }) => {
    const result = await createMatter({
      title: data.name,
      description: `Wills & Successions matter for ${data.decedentName}`,
      status: data.status,
      matter_type: 'wills_successions',
      open_date: new Date().toISOString().split('T')[0],
      close_date: null,
      client_id: data.clientId,
      practice_area_id: null,
      decedent_name: data.decedentName,
      date_of_death: data.dateOfDeath,
      key_beneficiaries: data.keyBeneficiaries,
    })
    
    if (!result.success) {
      console.error('Failed to create matter:', result.error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Wills & Successions Matters</CardTitle>
          <CardDescription>Manage all wills, trusts, and succession matters.</CardDescription>
        </div>
        <WillsSuccessionMatterDialog onSave={handleSaveMatter}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Matter
          </Button>
        </WillsSuccessionMatterDialog>
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
                <TableHead>Decedent</TableHead>
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
                    <Link href={`/matters/wills-successions/${matter.id}`} className="hover:underline">
                      {matter.title}
                    </Link>
                  </TableCell>
                  <TableCell>{matter.clients?.name}</TableCell>
                  <TableCell>{matter.decedent_name}</TableCell>
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
        )}
      </CardContent>
    </Card>
  )
}
