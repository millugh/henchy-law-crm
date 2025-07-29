"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useClients } from "@/hooks/use-clients"
import { useToast } from "@/hooks/use-toast"
import { PRACTICE_AREAS } from "@/lib/data"

interface ClientFormData {
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'archived'
  practiceAreas: string[]
}

export default function NewClientPage() {
  const router = useRouter()
  const { createClient } = useClients()
  const { toast } = useToast()
  
  const [data, setData] = useState<ClientFormData>({
    name: "",
    email: "",
    phone: "",
    status: "active",
    practiceAreas: [],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePracticeAreaChange = (practiceArea: string, checked: boolean) => {
    setData(prev => ({
      ...prev,
      practiceAreas: checked
        ? [...prev.practiceAreas, practiceArea]
        : prev.practiceAreas.filter(area => area !== practiceArea)
    }))
  }

  const validateForm = () => {
    if (!data.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" })
      return false
    }
    if (!data.email.trim()) {
      toast({ title: "Email is required", variant: "destructive" })
      return false
    }
    if (!data.phone.trim()) {
      toast({ title: "Phone is required", variant: "destructive" })
      return false
    }
    if (data.practiceAreas.length === 0) {
      toast({ title: "At least one practice area must be selected", variant: "destructive" })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const clientData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status
      }
      
      const result = await createClient(clientData)
      
      if (result.success) {
        toast({ title: "Client created successfully" })
        router.push("/clients")
      } else {
        toast({ title: "Failed to create client", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "An error occurred", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Client</CardTitle>
          <CardDescription>Create a new client record for the firm.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="Enter client name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder="client@example.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                placeholder="(555) 123-4567"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Client Status *</Label>
              <Select value={data.status} onValueChange={(value: 'active' | 'inactive' | 'archived') => setData({ ...data, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Practice Areas *</Label>
              <div className="grid grid-cols-2 gap-3">
                {PRACTICE_AREAS.map((area) => (
                  <div key={area.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={area.name}
                      checked={data.practiceAreas.includes(area.name)}
                      onCheckedChange={(checked) => handlePracticeAreaChange(area.name, checked as boolean)}
                    />
                    <Label htmlFor={area.name} className="text-sm font-normal">
                      {area.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/clients")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Client"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
