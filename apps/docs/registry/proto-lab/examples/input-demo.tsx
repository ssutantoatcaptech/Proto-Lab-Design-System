import { Input } from "@/registry/proto-lab/ui/input"
import { Label } from "@/registry/proto-lab/ui/label"

export default function InputDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="work-email">Work email</Label>
      <Input id="work-email" type="email" placeholder="name@captechconsulting.com" />
      <p className="text-caption-1 text-muted-foreground">We only use this to share the project brief.</p>
    </div>
  )
}
