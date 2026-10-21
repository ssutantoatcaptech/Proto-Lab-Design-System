import { Label } from "@/registry/proto-lab/ui/label"
import { RadioGroup, RadioGroupItem } from "@/registry/proto-lab/ui/radio-group"

const practices = [
  { value: "cx", label: "Customer Experience" },
  { value: "da", label: "Data & Analytics" },
  { value: "mc", label: "Management Consulting" },
  { value: "si", label: "Systems Integration" },
]

export default function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="cx" aria-label="Lead practice" className="w-fit">
      {practices.map((p) => (
        <div key={p.value} className="flex items-center gap-3">
          <RadioGroupItem value={p.value} id={`practice-${p.value}`} />
          <Label htmlFor={`practice-${p.value}`}>{p.label}</Label>
        </div>
      ))}
    </RadioGroup>
  )
}
