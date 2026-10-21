import { Avatar, AvatarFallback } from "@/registry/proto-lab/ui/avatar"
import { Button } from "@/registry/proto-lab/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/registry/proto-lab/ui/hover-card"

export default function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger render={<Button variant="link" />}>Priya Natarajan</HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="flex gap-3">
          <Avatar>
            <AvatarFallback>PN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Priya Natarajan</span>
            <span className="text-sm text-muted-foreground">
              Engagement lead, Data &amp; Analytics. Leading the claims modernization roadmap.
            </span>
            <span className="text-xs text-muted-foreground">Richmond office</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
