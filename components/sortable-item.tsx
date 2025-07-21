import type React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

import { Button } from "@/components/ui/button"

export function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
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
