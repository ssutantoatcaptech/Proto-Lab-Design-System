"use client"

import * as React from "react"
import { Button } from "@/registry/proto-lab/ui/button"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/registry/proto-lab/ui/alert-dialog"

export default function AlertDialogDemo() {
  const [open, setOpen] = React.useState(false)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="destructive" />}>Delete timesheet</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this timesheet?</AlertDialogTitle>
          <AlertDialogDescription>
            All 38 hours logged for the week of March 9 will be removed. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep timesheet</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => setOpen(false)}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
