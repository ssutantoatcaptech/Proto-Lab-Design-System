import { Button } from "@/registry/proto-lab/ui/button"

export default function ButtonVariants() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}
