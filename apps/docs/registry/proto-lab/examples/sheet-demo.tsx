import { Button } from "@/registry/proto-lab/ui/button"
import { Input } from "@/registry/proto-lab/ui/input"
import { Label } from "@/registry/proto-lab/ui/label"
import {
  Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
} from "@/registry/proto-lab/ui/sheet"

export default function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Edit engagement</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit engagement</SheetTitle>
          <SheetDescription>Changes apply to the whole project team.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4">
          <div className="grid gap-1.5">
            <Label htmlFor="engagement-name">Name</Label>
            <Input id="engagement-name" defaultValue="Retail checkout redesign" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="engagement-lead">Engagement lead</Label>
            <Input id="engagement-lead" defaultValue="Jordan Ellis" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose render={<Button />}>Save changes</SheetClose>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
