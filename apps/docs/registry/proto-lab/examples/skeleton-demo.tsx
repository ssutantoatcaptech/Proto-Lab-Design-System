import { Skeleton } from "@/registry/proto-lab/ui/skeleton"

export default function SkeletonDemo() {
  return (
    <div className="flex w-full max-w-sm items-center gap-4" aria-busy="true" aria-label="Loading engagement">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}
