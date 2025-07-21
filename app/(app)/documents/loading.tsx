import { Skeleton } from "@/components/ui/skeleton"
import { FileTableSkeleton } from "@/components/file-table-skeleton"

export default function DocumentsLoading() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-1/3" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <FileTableSkeleton />
    </div>
  )
}
