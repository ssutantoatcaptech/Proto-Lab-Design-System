"use client"

import { Button } from "@/registry/proto-lab/ui/button"
import { Toaster, toast } from "@/registry/proto-lab/ui/toast"

export default function ToastDemo() {
  return (
    <Toaster>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({
            type: "success",
            title: "Findings shared",
            description: "The client team can now view 12 findings.",
            actionProps: { children: "Undo", onClick: () => toast.add({ title: "Sharing undone" }) },
          })
        }
      >
        Share findings
      </Button>
    </Toaster>
  )
}
