import { BookmarkIcon } from "lucide-react"
import { Toggle } from "@/registry/proto-lab/ui/toggle"

export default function ToggleDemo() {
  return (
    <Toggle variant="outline" aria-label="Follow engagement">
      <BookmarkIcon data-icon="inline-start" />
      Follow
    </Toggle>
  )
}
