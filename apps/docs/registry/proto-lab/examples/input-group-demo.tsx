import { SearchIcon } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/registry/proto-lab/ui/input-group"

export default function InputGroupDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <InputGroup>
        <InputGroupInput placeholder="Search engagements" aria-label="Search engagements" />
        <InputGroupAddon><SearchIcon /></InputGroupAddon>
        <InputGroupAddon align="inline-end"><InputGroupText>12 results</InputGroupText></InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="185" inputMode="decimal" aria-label="Hourly rate" />
        <InputGroupAddon><InputGroupText>$</InputGroupText></InputGroupAddon>
        <InputGroupAddon align="inline-end"><InputGroupText>per hour</InputGroupText></InputGroupAddon>
      </InputGroup>
    </div>
  )
}
