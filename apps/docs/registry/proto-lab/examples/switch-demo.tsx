import { Label } from "@/registry/proto-lab/ui/label"
import { Switch } from "@/registry/proto-lab/ui/switch"

export default function SwitchDemo() {
  return (
    <div className="flex items-center gap-2">
      <Switch id="beta" />
      <Label htmlFor="beta">Enable beta features</Label>
    </div>
  )
}
