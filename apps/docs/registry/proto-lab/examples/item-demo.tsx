import { FileTextIcon, PresentationIcon } from "lucide-react"
import { Button } from "@/registry/proto-lab/ui/button"
import {
  Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle,
} from "@/registry/proto-lab/ui/item"

export default function ItemDemo() {
  return (
    <ItemGroup className="max-w-md gap-2">
      <Item variant="outline" role="listitem">
        <ItemMedia variant="icon"><PresentationIcon /></ItemMedia>
        <ItemContent>
          <ItemTitle>Journey mapping workshop</ItemTitle>
          <ItemDescription>Customer Experience. Thursday, 10 AM with the claims team.</ItemDescription>
        </ItemContent>
        <ItemActions><Button variant="outline" size="sm">Open</Button></ItemActions>
      </Item>
      <Item variant="outline" role="listitem">
        <ItemMedia variant="icon"><FileTextIcon /></ItemMedia>
        <ItemContent>
          <ItemTitle>Discovery findings</ItemTitle>
          <ItemDescription>12 findings ready for client review.</ItemDescription>
        </ItemContent>
        <ItemActions><Button variant="outline" size="sm">Review</Button></ItemActions>
      </Item>
    </ItemGroup>
  )
}
