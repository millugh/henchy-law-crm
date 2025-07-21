"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CLIENTS, type RealEstateMatter } from "@/lib/data"
import { useState } from "react"

interface RealEstateMatterDialogProps {
  matter?: RealEstateMatter
  onSave: (matter: Omit<RealEstateMatter, "id" | "clientName">) => void
  children: React.ReactNode
}

export function RealEstateMatterDialog({ matter, onSave, children }: RealEstateMatterDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(matter?.name || "")
  const [propertyAddress, setPropertyAddress] = useState(matter?.propertyAddress || "")
  const [status, setStatus] = useState(matter?.status || "Under Contract")
  const [clientId, setClientId] = useState(matter?.clientId || "")
  const [description, setDescription] = useState(matter?.description || "")

  const handleSave = () => {
    if (!name || !propertyAddress || !status || !clientId) {
      // Add some validation feedback
      return
    }
    onSave({ name, propertyAddress, status, clientId, description })
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{matter ? "Edit Real Estate Matter" : "Add Real Estate Matter"}</DialogTitle>
          <DialogDescription>
            {matter
              ? "Update the details of the existing matter."
              : "Enter the details for the new real estate matter."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Matter Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Property Address
            </Label>
            <Input
              id="address"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="client" className="text-right">
              Client
            </Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {CLIENTS.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Under Contract">Under Contract</SelectItem>
                <SelectItem value="Negotiation">Negotiation</SelectItem>
                <SelectItem value="Closing">Closing</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Matter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
