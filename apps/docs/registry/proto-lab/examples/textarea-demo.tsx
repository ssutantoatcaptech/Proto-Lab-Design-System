import { Label } from "@/registry/proto-lab/ui/label"
import { Textarea } from "@/registry/proto-lab/ui/textarea"

export default function TextareaDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="workshop-notes">Workshop notes</Label>
      <Textarea id="workshop-notes" placeholder="Agents asked for one view of member history across claims and billing." />
      <p className="text-xs text-muted-foreground">Visible to everyone on the engagement.</p>
    </div>
  )
}
