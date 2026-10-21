import { Checkbox } from "@/registry/proto-lab/ui/checkbox"
import { Label } from "@/registry/proto-lab/ui/label"

export default function CheckboxDemo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="notify" defaultChecked />
        <Label htmlFor="notify">Notify my team when this changes</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="archive" disabled />
        <Label htmlFor="archive">Archive after 30 days (admins only)</Label>
      </div>
    </div>
  )
}
