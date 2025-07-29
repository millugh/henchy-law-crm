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
import { useClients } from "@/hooks/use-clients"
import { type Matter } from "@/lib/api"
import { useState } from "react"
import { DatePicker } from "@/components/ui/date-picker"

interface WillsSuccessionMatterDialogProps {
  matter?: Matter
  onSave: (matter: {
    name: string
    status: string
    clientId: string
    decedentName: string
    dateOfDeath?: string
    keyBeneficiaries: string
  }) => void
  children: React.ReactNode
}

export function WillsSuccessionMatterDialog({ matter, onSave, children }: WillsSuccessionMatterDialogProps) {
  const { clients } = useClients()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(matter?.title || "")
  const [status, setStatus] = useState(matter?.status || "Drafting")
  const [clientId, setClientId] = useState(matter?.client_id || "")
  const [decedentName, setDecedentName] = useState(matter?.decedent_name || "")
  const [dateOfDeath, setDateOfDeath] = useState<Date | undefined>(
    matter?.date_of_death ? new Date(matter.date_of_death) : undefined,
  )
  const [keyBeneficiaries, setKeyBeneficiaries] = useState(matter?.key_beneficiaries || "")

  const handleSave = () => {
    if (!name || !status || !clientId || !decedentName) {
      // Add some validation feedback
      return
    }
    onSave({
      name,
      status,
      clientId,
      decedentName,
      dateOfDeath: dateOfDeath?.toISOString().split("T")[0],
      keyBeneficiaries,
    })
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{matter ? "Edit Wills & Succession Matter" : "Add Wills & Succession Matter"}</DialogTitle>
          <DialogDescription>
            {matter ? "Update the details of the existing matter." : "Enter the details for the new matter."}
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
            <Label htmlFor="client" className="text-right">
              Client
            </Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.filter((c) => c.practiceAreas?.includes("Wills & Successions")).map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="decedent" className="text-right">
              Decedent
            </Label>
            <Input
              id="decedent"
              value={decedentName}
              onChange={(e) => setDecedentName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dod" className="text-right">
              Date of Death
            </Label>
            <DatePicker date={dateOfDeath} setDate={setDateOfDeath} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="beneficiaries" className="text-right">
              Beneficiaries
            </Label>
            <Textarea
              id="beneficiaries"
              value={keyBeneficiaries}
              onChange={(e) => setKeyBeneficiaries(e.target.value)}
              className="col-span-3"
              placeholder="List key beneficiaries, separated by commas"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus as (value: string) => void}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Drafting">Drafting</SelectItem>
                <SelectItem value="Executed">Executed</SelectItem>
                <SelectItem value="Filed">Filed</SelectItem>
                <SelectItem value="Awaiting Judgment">Awaiting Judgment</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
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
