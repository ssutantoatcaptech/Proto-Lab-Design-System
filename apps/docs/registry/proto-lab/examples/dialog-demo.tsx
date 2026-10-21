import { Button } from "@/registry/proto-lab/ui/button"
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/registry/proto-lab/ui/dialog"

export default function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Archive project</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive this project?</DialogTitle>
          <DialogDescription>It moves to Archived projects. You can restore it there for 30 days.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <DialogClose render={<Button />}>Archive</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
