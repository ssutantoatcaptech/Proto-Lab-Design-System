import { Button } from "@/registry/proto-lab/ui/button"
import {
  Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
} from "@/registry/proto-lab/ui/drawer"

export default function DrawerDemo() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>Review timesheet</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-sm flex-col">
          <DrawerHeader>
            <DrawerTitle>Week of October 13</DrawerTitle>
            <DrawerDescription>Submit your hours by Friday at 5 PM.</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-2 p-4 text-sm">
            <div className="flex justify-between"><span>Retail CX discovery</span><span>24 hrs</span></div>
            <div className="flex justify-between"><span>Data platform roadmap</span><span>14 hrs</span></div>
            <div className="flex justify-between font-medium"><span>Total</span><span>38 hrs</span></div>
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button />}>Submit hours</DrawerClose>
            <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
