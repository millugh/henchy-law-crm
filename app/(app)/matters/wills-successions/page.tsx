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
import { willsSuccessionMatters, CLIENTS, type WillsSuccessionMatter } from "@/lib/data"
import { WillsSuccessionMatterDialog } from "@/components/wills-succession-matter-dialog"

export default function WillsSuccessionsMattersPage() {
  const [matters, setMatters] = useState<WillsSuccessionMatter[]>(willsSuccessionMatters)

  const handleSaveMatter = (data: Omit<WillsSuccessionMatter, "id" | "clientName">) => {
    const client = CLIENTS.find((c) => c.id === data.clientId)
    if (!client) return

    const newMatter: WillsSuccessionMatter = {
      id: `WSM-${Date.now()}`,
      ...data,
      clientName: client.name,
    }
    setMatters([newMatter, ...matters])
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
                    {matter.name}
                  </Link>
                </TableCell>
                <TableCell>{matter.clientName}</TableCell>
                <TableCell>{matter.decedentName}</TableCell>
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
      </CardContent>
    </Card>
  )
}
