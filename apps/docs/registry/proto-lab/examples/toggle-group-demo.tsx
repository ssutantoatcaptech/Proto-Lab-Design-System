import { KanbanIcon, ListIcon, TableIcon } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/registry/proto-lab/ui/toggle-group"

export default function ToggleGroupDemo() {
  return (
    <ToggleGroup variant="outline" spacing={0} defaultValue={["board"]} aria-label="Project view">
      <ToggleGroupItem value="list" aria-label="List view">
        <ListIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="board" aria-label="Board view">
        <KanbanIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="Table view">
        <TableIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
