import { Button } from "@/registry/proto-lab/ui/button"
import { Input } from "@/registry/proto-lab/ui/input"
import { Label } from "@/registry/proto-lab/ui/label"
import {
  Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger,
} from "@/registry/proto-lab/ui/popover"

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Set workshop time</PopoverTrigger>
      <PopoverContent className="w-72">
        <PopoverHeader>
          <PopoverTitle>Discovery workshop</PopoverTitle>
          <PopoverDescription>Customer Experience kickoff with the client team.</PopoverDescription>
        </PopoverHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="workshop-date">Date</Label>
            <Input id="workshop-date" type="date" defaultValue="2026-11-04" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="workshop-length">Length in hours</Label>
            <Input id="workshop-length" type="number" defaultValue={3} min={1} max={8} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
