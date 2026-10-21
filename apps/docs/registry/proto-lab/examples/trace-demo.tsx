import { CheckIcon, FileSearchIcon, LoaderIcon } from "lucide-react"
import {
  Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon,
  TraceLine, TraceTitle,
} from "@/registry/proto-lab/ui/trace"

export default function TraceDemo() {
  return (
    <Trace className="max-w-sm">
      <TraceLine>
        <TraceIcon><CheckIcon /></TraceIcon>
        <TraceTitle>Read 14 interview transcripts</TraceTitle>
        <TraceDescription>8s</TraceDescription>
      </TraceLine>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon><FileSearchIcon /></TraceIcon>
            <TraceTitle>Grouped findings into 4 themes</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          Checkout friction, search accuracy, delivery dates and loyalty visibility.
        </TraceCollapsibleContent>
      </TraceCollapsible>
      <TraceLine status="running">
        <TraceIcon><LoaderIcon className="animate-spin" /></TraceIcon>
        <TraceTitle>Drafting the readout deck</TraceTitle>
      </TraceLine>
      <TraceLine status="pending">
        <TraceTitle>Share with the engagement lead</TraceTitle>
      </TraceLine>
    </Trace>
  )
}
