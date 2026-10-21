"use client"

import * as React from "react"
import { ChevronsUpDownIcon } from "lucide-react"
import { Button } from "@/registry/proto-lab/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/registry/proto-lab/ui/collapsible"

export default function CollapsibleDemo() {
  const [open, setOpen] = React.useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="flex w-full max-w-sm flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">3 open findings on Claims portal audit</span>
        <CollapsibleTrigger render={<Button variant="ghost" size="icon-sm" aria-label={open ? "Hide findings" : "Show findings"} />}>
          <ChevronsUpDownIcon />
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-2 text-sm">Search returns no results for claim numbers</div>
      <CollapsibleContent className="flex flex-col gap-2">
        <div className="rounded-md border px-4 py-2 text-sm">Upload fails silently over 10 MB</div>
        <div className="rounded-md border px-4 py-2 text-sm">Status labels differ between web and mobile</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
