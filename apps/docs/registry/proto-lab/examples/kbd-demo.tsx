import { Kbd, KbdGroup } from "@/registry/proto-lab/ui/kbd"

export default function KbdDemo() {
  return (
    <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
      <p>
        Press <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup> to search engagements.
      </p>
      <p>
        Press <KbdGroup><Kbd>Ctrl</Kbd><span>+</span><Kbd>S</Kbd></KbdGroup> to save your timesheet.
      </p>
    </div>
  )
}
