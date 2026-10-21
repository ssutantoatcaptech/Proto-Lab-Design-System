import { ArrowRightIcon } from "lucide-react"
import { Button } from "@/registry/proto-lab/ui/button"

export default function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Save changes</Button>
      <Button variant="outline">
        Continue <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </div>
  )
}
