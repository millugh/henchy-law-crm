"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { USERS } from "@/lib/data"
import { useState } from "react"

interface AddActivityFormProps {
  onAddActivity: (activity: { type: string; description: string; user: string }) => void
}

export function AddActivityForm({ onAddActivity }: AddActivityFormProps) {
  const [description, setDescription] = useState("")
  const [assignedTo, setAssignedTo] = useState(USERS[0].name)
  const [activityType, setActivityType] = useState("note")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description) return
    onAddActivity({
      type: activityType,
      description,
      user: assignedTo,
    })
    setDescription("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Add a note, log a call, or create a task..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Select value={activityType} onValueChange={setActivityType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="note">Note</SelectItem>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="task">Task</SelectItem>
            </SelectContent>
          </Select>
          <Select value={assignedTo} onValueChange={setAssignedTo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Assign to" />
            </SelectTrigger>
            <SelectContent>
              {USERS.map((user) => (
                <SelectItem key={user.id} value={user.name}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={!description}>
          Add Activity
        </Button>
      </div>
    </form>
  )
}
