import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/registry/proto-lab/ui/button"
import { ButtonGroup } from "@/registry/proto-lab/ui/button-group"

export default function ButtonGroupDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ButtonGroup aria-label="Timesheet view">
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
        <Button variant="outline">Month</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Submit timesheet">
        <Button>Submit timesheet</Button>
        <Button size="icon" aria-label="More submit options">
          <ChevronDownIcon />
        </Button>
      </ButtonGroup>
    </div>
  )
}
