import { FolderOpenIcon } from "lucide-react"
import { Button } from "@/registry/proto-lab/ui/button"
import {
  Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle,
} from "@/registry/proto-lab/ui/empty"

export default function EmptyDemo() {
  return (
    <Empty className="max-w-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpenIcon />
        </EmptyMedia>
        <EmptyTitle>No engagements yet</EmptyTitle>
        <EmptyDescription>
          Create an engagement to track workshops, findings and hours in one place.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Create engagement</Button>
      </EmptyContent>
    </Empty>
  )
}
