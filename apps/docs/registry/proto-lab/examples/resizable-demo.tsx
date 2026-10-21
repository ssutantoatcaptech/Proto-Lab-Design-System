import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/registry/proto-lab/ui/resizable"

export default function ResizableDemo() {
  return (
    <ResizablePanelGroup orientation="horizontal" className="h-48 w-full max-w-lg rounded-md border">
      <ResizablePanel defaultSize="35%" minSize="20%">
        <div className="flex h-full flex-col gap-2 p-4 text-sm">
          <span className="font-medium">Findings</span>
          <span className="text-muted-foreground">12 open</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="65%" minSize="30%">
        <div className="flex h-full flex-col gap-2 p-4 text-sm">
          <span className="font-medium">Checkout drops at the address step</span>
          <span className="text-muted-foreground">
            Seven of ten participants paused when asked for a billing address twice.
          </span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
