import { CheckCircleIcon, ClockIcon } from "lucide-react"
import { Marker, MarkerContent, MarkerIcon } from "@/registry/proto-lab/ui/marker"

export default function MarkerDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Marker variant="separator">
        <MarkerContent>Monday, October 20</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon><CheckCircleIcon /></MarkerIcon>
        <MarkerContent>Priya approved your timesheet</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerIcon><ClockIcon /></MarkerIcon>
        <MarkerContent>Discovery workshop moved to Thursday</MarkerContent>
      </Marker>
    </div>
  )
}
