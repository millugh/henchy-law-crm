import { MoreHorizontal } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useClients } from "@/hooks/use-clients"
import { ClientSearch } from "@/components/client-search"

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  status: 'active' | 'inactive' | 'archived'
  created_at: string
}

function ClientAvatar({ client }: { client: Client }) {
  return (
    <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
        {client.name.charAt(0)}
      </div>
    </div>
  )
}

export default function ClientsPage({ searchParams }: { searchParams?: { query?: string } }) {
  const query = searchParams?.query || ""
  const { clients, loading, error } = useClients()

  const filteredClients = clients.filter((client) => {
    const searchTerm = query.toLowerCase()
    return (
      client.name.toLowerCase().includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchTerm))
    )
  })

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>Loading clients...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>Error loading clients: {error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
          <CardDescription>A list of all clients in the firm.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <ClientSearch placeholder="Search clients or practice areas..." />
            <Button asChild>
              <Link href="/clients/new">Add Client</Link>
            </Button>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Interaction</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <Link href={`/clients/${client.id}`} className="flex items-center gap-3 hover:underline">
                        <ClientAvatar client={client} />
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.status === "active" ? "secondary" : "outline"}>
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(client.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {client.email || "—"}
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
                            <Link href={`/clients/${client.id}`}>View details</Link>
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
