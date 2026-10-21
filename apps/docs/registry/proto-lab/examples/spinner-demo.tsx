import { Spinner } from "@/registry/proto-lab/ui/spinner"

export default function SpinnerDemo() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner />
      Syncing engagement data
    </div>
  )
}
