import { Separator } from "@/registry/proto-lab/ui/separator"

export default function SeparatorDemo() {
  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-medium">Retail checkout redesign</h4>
        <p className="text-sm text-muted-foreground">Customer Experience engagement, phase two.</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <span>Findings</span>
        <Separator orientation="vertical" />
        <span>Workshops</span>
        <Separator orientation="vertical" />
        <span>Timesheets</span>
      </div>
    </div>
  )
}
