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
import { titlePolicyMatters, CLIENTS, type TitlePolicyMatter } from "@/lib/data"
import { TitlePolicyMatterDialog } from "@/components/title-policy-matter-dialog"

export default function TitlePolicyMattersPage() {
  const [matters, setMatters] = useState<TitlePolicyMatter[]>(titlePolicyMatters)

  const handleSaveMatter = (data: Omit<TitlePolicyMatter, "id" | "clientName">) => {
    const client = CLIENTS.find((c) => c.id === data.clientId)
    if (!client) return

    const newMatter: TitlePolicyMatter = {
      id: `TPM-${Date.now()}`,
      ...data,
      clientName: client.name,
    }
    setMatters([newMatter, ...matters])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Title Policy Matters</CardTitle>
          <CardDescription>Manage all title policy underwriting matters.</CardDescription>
        </div>
        <TitlePolicyMatterDialog onSave={handleSaveMatter}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Policy
          </Button>
        </TitlePolicyMatterDialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy #</TableHead>
              <TableHead>Property Address</TableHead>
              <TableHead>Insured</TableHead>
              <TableHead>Coverage</TableHead>
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
                  <Link href={`/matters/title-policy/${matter.id}`} className="hover:underline">
                    {matter.policyNumber}
                  </Link>
                </TableCell>
                <TableCell>{matter.propertyAddress}</TableCell>
                <TableCell>{matter.insuredParties}</TableCell>
                <TableCell>{formatCurrency(matter.coverageAmount)}</TableCell>
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
                        <Link href={`/matters/title-policy/${matter.id}`}>View Details</Link>
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
