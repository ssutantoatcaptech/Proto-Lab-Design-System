import { PlayIcon } from "lucide-react"
import { AspectRatio } from "@/registry/proto-lab/ui/aspect-ratio"

export default function AspectRatioDemo() {
  return (
    <div className="w-full max-w-sm">
      <AspectRatio ratio={16 / 9} className="flex items-center justify-center rounded-md border bg-muted">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <PlayIcon className="size-6" />
          <span className="text-sm">Journey mapping workshop recording</span>
        </div>
      </AspectRatio>
    </div>
  )
}
