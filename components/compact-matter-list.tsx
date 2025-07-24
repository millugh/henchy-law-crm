import { Briefcase, GripVertical } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Matter = {
  id: string
  name: string
  status: string
}

interface CompactMatterListProps {
  title: string
  matters: Matter[]
  viewAllLink: string
  dndListeners?: Record<string, unknown>
  isOverlay?: boolean
}

export function CompactMatterList({
  title,
  matters,
  viewAllLink,
  dndListeners,
  isOverlay = false,
}: CompactMatterListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center p-3">
        {!isOverlay && (
          <button {...dndListeners} className="cursor-grab p-1 -ml-1 mr-1">
            <GripVertical className="h-5 w-5 text-muted-foreground/60" />
          </button>
        )}
        <CardTitle className="text-sm font-medium flex-1">{title}</CardTitle>
        <Link href={viewAllLink} className="text-sm text-muted-foreground hover:text-primary">
          View All
        </Link>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-4">
          {matters.map((matter) => (
            <div key={matter.id} className="flex items-center">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{matter.name}</p>
              </div>
              <div className="ml-auto">
                <Badge variant="outline">{matter.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
