import { ClockIcon, FileTextIcon, FolderIcon, SettingsIcon } from "lucide-react"
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from "@/registry/proto-lab/ui/command"

export default function CommandDemo() {
  return (
    <Command className="max-w-sm rounded-lg border">
      <CommandInput placeholder="Search projects and actions" />
      <CommandList>
        <CommandEmpty>No results. Try a project or client name.</CommandEmpty>
        <CommandGroup heading="Projects">
          <CommandItem><FolderIcon /> Member portal redesign</CommandItem>
          <CommandItem><FolderIcon /> Claims data platform</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem><ClockIcon /> Log time <CommandShortcut>⌘T</CommandShortcut></CommandItem>
          <CommandItem><FileTextIcon /> New finding <CommandShortcut>⌘N</CommandShortcut></CommandItem>
          <CommandItem><SettingsIcon /> Settings <CommandShortcut>⌘,</CommandShortcut></CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
