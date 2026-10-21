import { Input } from "@/registry/proto-lab/ui/input"
import { Label } from "@/registry/proto-lab/ui/label"

export default function LabelDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="engagement-name">Engagement name</Label>
      <Input id="engagement-name" placeholder="Claims modernization roadmap" />
    </div>
  )
}
