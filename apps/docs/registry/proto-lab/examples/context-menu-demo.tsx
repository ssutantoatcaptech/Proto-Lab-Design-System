import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger,
} from "@/registry/proto-lab/ui/context-menu"

export default function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-36 w-full max-w-sm items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        Right click the Discovery readout card
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem>Open <ContextMenuShortcut>⌘O</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuItem>Duplicate <ContextMenuShortcut>⌘D</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuItem>Share with client</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
