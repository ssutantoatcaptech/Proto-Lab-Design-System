import { Label } from "@/registry/proto-lab/ui/label"
import { NativeSelect, NativeSelectOption } from "@/registry/proto-lab/ui/native-select"

export default function NativeSelectDemo() {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="practice">Practice area</Label>
      <NativeSelect id="practice" defaultValue="" className="w-64">
        <NativeSelectOption value="" disabled>Choose a practice</NativeSelectOption>
        <NativeSelectOption value="cx">Customer Experience</NativeSelectOption>
        <NativeSelectOption value="da">Data &amp; Analytics</NativeSelectOption>
        <NativeSelectOption value="mc">Management Consulting</NativeSelectOption>
        <NativeSelectOption value="si">Systems Integration</NativeSelectOption>
      </NativeSelect>
    </div>
  )
}
