import { CopyIcon } from "lucide-react"
import { Button } from "@/registry/proto-lab/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/proto-lab/ui/tooltip"

export default function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" size="icon" aria-label="Copy link" />}>
        <CopyIcon />
      </TooltipTrigger>
      <TooltipContent>Copy link</TooltipContent>
    </Tooltip>
  )
}
