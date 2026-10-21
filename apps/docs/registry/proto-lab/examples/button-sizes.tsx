import { PlusIcon } from "lucide-react"
import { Button } from "@/registry/proto-lab/ui/button"

export default function ButtonSizes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Add item"><PlusIcon /></Button>
    </div>
  )
}
