"use client"

import { toast } from "sonner"
import { Button } from "@/registry/proto-lab/ui/button"
import { Toaster } from "@/registry/proto-lab/ui/sonner"

export default function SonnerDemo() {
  return (
    <>
      <Button
        variant="outline"
        onClick={() =>
          toast.success("Timesheet submitted", {
            description: "Week of Oct 19, 40 hours on Data & Analytics.",
            action: { label: "Undo", onClick: () => toast("Submission withdrawn") },
          })
        }
      >
        Submit timesheet
      </Button>
      <Toaster />
    </>
  )
}
