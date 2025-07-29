"use client"

import { useState } from "react"
import { PlusCircle, MoreHorizontal, Search, FileText } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { TitlePolicyMatterDialog } from "@/components/title-policy-matter-dialog"

export default function TitlePolicyMattersPage() {
  const { matters, loading, error, createMatter } = useMatters('title_policy')
  const { clients } = useClients()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredMatters = matters.filter(matter => 
    matter.policy_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    matter.property_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    matter.insured_parties?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSaveMatter = async (data: {
    policyNumber: string
    propertyAddress: string
    insuredParties: string
    coverageAmount: number
    status: string
    clientId: string
  }) => {
    const result = await createMatter({
      title: `Policy ${data.policyNumber}`,
      description: `Title policy for ${data.propertyAddress}`,
      status: data.status,
      matter_type: 'title_policy',
      open_date: new Date().toISOString().split('T')[0],
      close_date: null,
      client_id: data.clientId,
      practice_area_id: null,
      policy_number: data.policyNumber,
      property_address: data.propertyAddress,
      insured_parties: data.insuredParties,
      coverage_amount: data.coverageAmount,
    })
    
    if (!result.success) {
      console.error('Failed to create matter:', result.error)
    }
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
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search policies, addresses, or insured parties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading matters...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">Error loading matters: {error}</div>
          </div>
        ) : filteredMatters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No title policies found</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {searchTerm ? "No policies match your search criteria. Try adjusting your search terms." : "Get started by creating your first title policy matter."}
            </p>
            <TitlePolicyMatterDialog onSave={handleSaveMatter}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Policy
              </Button>
            </TitlePolicyMatterDialog>
          </div>
        ) : (
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
              {filteredMatters.map((matter) => (
                <TableRow key={matter.id}>
                  <TableCell className="font-medium">
                    <Link href={`/matters/title-policy/${matter.id}`} className="hover:underline">
                      {matter.policy_number}
                    </Link>
                  </TableCell>
                  <TableCell>{matter.property_address}</TableCell>
                  <TableCell>{matter.insured_parties}</TableCell>
                  <TableCell>{formatCurrency(matter.coverage_amount || 0)}</TableCell>
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
        )}
      </CardContent>
    </Card>
  )
}
