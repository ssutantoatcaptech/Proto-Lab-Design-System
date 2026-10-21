import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/proto-lab/ui/select"

const practices = [
  { value: "cx", label: "Customer Experience" },
  { value: "da", label: "Data & Analytics" },
  { value: "mc", label: "Management Consulting" },
  { value: "si", label: "Systems Integration" },
]

export default function SelectDemo() {
  return (
    <Select items={practices} defaultValue="cx">
      <SelectTrigger className="w-64" aria-label="Practice area">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {practices.map((p) => (
          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
