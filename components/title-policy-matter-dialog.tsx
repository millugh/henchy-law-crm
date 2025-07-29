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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useClients } from "@/hooks/use-clients"
import { type Matter } from "@/lib/api"
import { useState } from "react"

interface TitlePolicyMatterDialogProps {
  matter?: Matter
  onSave: (matter: {
    policyNumber: string
    propertyAddress: string
    insuredParties: string
    coverageAmount: number
    status: string
    clientId: string
  }) => void
  children: React.ReactNode
}

export function TitlePolicyMatterDialog({ matter, onSave, children }: TitlePolicyMatterDialogProps) {
  const { clients } = useClients()
  const [isOpen, setIsOpen] = useState(false)
  const [policyNumber, setPolicyNumber] = useState(matter?.policy_number || "")
  const [propertyAddress, setPropertyAddress] = useState(matter?.property_address || "")
  const [insuredParties, setInsuredParties] = useState(matter?.insured_parties || "")
  const [coverageAmount, setCoverageAmount] = useState(matter?.coverage_amount || 0)
  const [status, setStatus] = useState(matter?.status || "Pending")
  const [clientId, setClientId] = useState(matter?.client_id || "")

  const handleSave = () => {
    if (!policyNumber || !propertyAddress || !status || !clientId || !insuredParties || coverageAmount <= 0) {
      // Add some validation feedback
      return
    }
    onSave({ policyNumber, propertyAddress, insuredParties, coverageAmount, status, clientId })
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{matter ? "Edit Title Policy Matter" : "Add Title Policy Matter"}</DialogTitle>
          <DialogDescription>
            {matter
              ? "Update the details of the existing title policy."
              : "Enter the details for the new title policy."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="policyNumber" className="text-right">
              Policy #
            </Label>
            <Input
              id="policyNumber"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              className="col-span-3"
            />
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
            <Label htmlFor="insured" className="text-right">
              Insured Parties
            </Label>
            <Input
              id="insured"
              value={insuredParties}
              onChange={(e) => setInsuredParties(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="coverage" className="text-right">
              Coverage ($)
            </Label>
            <Input
              id="coverage"
              type="number"
              value={coverageAmount}
              onChange={(e) => setCoverageAmount(Number(e.target.value))}
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
                {clients.filter((c) => c.practiceAreas?.includes("Title Policy Underwriting")).map((client) => (
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
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
                <SelectItem value="Issued">Issued</SelectItem>
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
