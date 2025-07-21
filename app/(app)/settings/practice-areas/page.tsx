"use client"

import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, PlusCircle, Trash2 } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PRACTICE_AREAS } from "@/lib/data"

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center gap-2">
      <Button variant="ghost" size="icon" {...listeners} className="cursor-grab">
        <GripVertical className="h-4 w-4" />
      </Button>
      {children}
    </div>
  )
}

export default function PracticeAreasPage() {
  const [practiceAreas, setPracticeAreas] = React.useState(PRACTICE_AREAS.map((area) => ({ id: area.name, ...area })))
  const [newAreaName, setNewAreaName] = React.useState("")

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setPracticeAreas((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const addPracticeArea = () => {
    if (newAreaName.trim() && !practiceAreas.some((area) => area.name === newAreaName.trim())) {
      const newArea = {
        id: newAreaName.trim(),
        name: newAreaName.trim(),
        href: `/matters/${newAreaName.trim().toLowerCase().replace(/\s+/g, "-")}`,
        icon: () => null, // No icon for new areas
      }
      setPracticeAreas([...practiceAreas, newArea])
      setNewAreaName("")
    }
  }

  const removePracticeArea = (id: string) => {
    setPracticeAreas(practiceAreas.filter((area) => area.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice Areas</CardTitle>
        <CardDescription>Organize and manage the firm's practice areas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Active Practice Areas</Label>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={practiceAreas} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {practiceAreas.map((area) => (
                  <SortableItem key={area.id} id={area.id}>
                    <Input value={area.name} readOnly className="flex-1" />
                    <Button variant="ghost" size="icon" onClick={() => removePracticeArea(area.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-area">Add New Practice Area</Label>
          <div className="flex items-center gap-2">
            <Input
              id="new-area"
              value={newAreaName}
              onChange={(e) => setNewAreaName(e.target.value)}
              placeholder="e.g., Corporate Law"
            />
            <Button onClick={addPracticeArea}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
