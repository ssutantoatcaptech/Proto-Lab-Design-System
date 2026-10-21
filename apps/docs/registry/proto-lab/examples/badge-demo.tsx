import { Badge } from "@/registry/proto-lab/ui/badge"

export default function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>New</Badge>
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="outline">Internal</Badge>
      <Badge variant="destructive">Blocked</Badge>
    </div>
  )
}
