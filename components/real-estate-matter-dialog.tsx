"use client"

import type React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useClients } from "@/hooks/use-clients"
import { TRANSACTION_TYPES, type RealEstateMatter } from "@/lib/data"
import { useState } from "react"

const realEstateMatterSchema = z.object({
  name: z.string().min(1, "Matter name is required"),
  propertyAddress: z.string().min(1, "Property address is required"),
  status: z.string().min(1, "Status is required"),
  clientId: z.string().min(1, "Client is required"),
  description: z.string().optional(),
  buyer: z.string().optional(),
  seller: z.string().optional(),
  municipalAddress: z.string().min(1, "Municipal address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  subdivision: z.string().optional(),
  lot: z.string().optional(),
  block: z.string().optional(),
  parcelNumber: z.string().optional(),
  priorYearTaxes: z.number().optional(),
  transactionType: z.enum(['Lease', 'Purchase and Sale Agreement', 'Lease with Option to Purchase', 'Lease Purchase', 'Option to Purchase', 'Sale-Leaseback']),
  dueDiligencePeriod: z.number().optional(),
  asIsLanguage: z.boolean(),
  titlePolicyNeeded: z.boolean(),
  henchyLawFileNumber: z.string().optional(),
})

type RealEstateMatterFormValues = z.infer<typeof realEstateMatterSchema>

interface RealEstateMatterDialogProps {
  matter?: RealEstateMatter
  onSave: (matter: Omit<RealEstateMatter, "id" | "clientName">) => void
  children: React.ReactNode
}

export function RealEstateMatterDialog({ matter, onSave, children }: RealEstateMatterDialogProps) {
  const { clients } = useClients()
  const [isOpen, setIsOpen] = useState(false)
  
  const form = useForm<RealEstateMatterFormValues>({
    resolver: zodResolver(realEstateMatterSchema),
    defaultValues: {
      name: matter?.name || "",
      propertyAddress: matter?.propertyAddress || "",
      status: matter?.status || "Under Contract",
      clientId: matter?.clientId || "",
      description: matter?.description || "",
      buyer: matter?.buyer || "",
      seller: matter?.seller || "",
      municipalAddress: matter?.municipalAddress || "",
      city: matter?.city || "",
      state: matter?.state || "",
      zipCode: matter?.zipCode || "",
      subdivision: matter?.subdivision || "",
      lot: matter?.lot || "",
      block: matter?.block || "",
      parcelNumber: matter?.parcelNumber || "",
      priorYearTaxes: matter?.priorYearTaxes || undefined,
      transactionType: matter?.transactionType || "Purchase and Sale Agreement",
      dueDiligencePeriod: matter?.dueDiligencePeriod || undefined,
      asIsLanguage: matter?.asIsLanguage || false,
      titlePolicyNeeded: matter?.titlePolicyNeeded || false,
      henchyLawFileNumber: matter?.henchyLawFileNumber || "",
    },
  })

  const watchedTransactionType = form.watch("transactionType")
  const showDueDiligence = watchedTransactionType === "Purchase and Sale Agreement" || watchedTransactionType === "Option to Purchase"

  const handleSave = (data: RealEstateMatterFormValues) => {
    onSave(data as Omit<RealEstateMatter, "id" | "clientName">)
    setIsOpen(false)
    form.reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{matter ? "Edit Real Estate Matter" : "Add Real Estate Matter"}</DialogTitle>
          <DialogDescription>
            {matter
              ? "Update the details of the existing matter."
              : "Enter the details for the new real estate matter."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matter Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="henchyLawFileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Henchy Law Firm File #</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="buyer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buyer</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seller"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seller</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Property Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="propertyAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="municipalAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Municipal Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="subdivision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subdivision</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lot</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="block"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Block</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parcelNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcel #</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transaction type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRANSACTION_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priorYearTaxes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prior Year Taxes ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {showDueDiligence && (
              <FormField
                control={form.control}
                name="dueDiligencePeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Diligence Period (days)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="asIsLanguage"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>As-Is Language</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="titlePolicyNeeded"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Title Policy Needed</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.filter(c => c.practiceAreas?.includes('Real Estate')).map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Under Contract">Under Contract</SelectItem>
                        <SelectItem value="Negotiation">Negotiation</SelectItem>
                        <SelectItem value="Closing">Closing</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Matter</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
