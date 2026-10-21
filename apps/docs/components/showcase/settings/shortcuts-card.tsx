"use client"

import * as React from "react"
import {
  ClockIcon,
  FilePlusIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/proto-lab/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/registry/proto-lab/ui/command"

type Shortcut = { id: string; label: string; keys: string; icon: LucideIcon }

const shortcuts: Shortcut[] = [
  { id: "search", label: "Search everything", keys: "⌘K", icon: SearchIcon },
  { id: "time", label: "Log time", keys: "⌘T", icon: ClockIcon },
  { id: "new", label: "New deliverable", keys: "⌘N", icon: FilePlusIcon },
  { id: "team", label: "Open team roles", keys: "⌘U", icon: UsersIcon },
  { id: "settings", label: "Open settings", keys: "⌘,", icon: SettingsIcon },
]

export function ShortcutsCard() {
  const [last, setLast] = React.useState<Shortcut | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyboard shortcuts</CardTitle>
        <CardDescription>Search a command, then press Enter to try it.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Command className="rounded-lg! border bg-card" label="Shortcuts">
          <CommandInput placeholder="Try log time" aria-label="Search shortcuts" />
          <CommandList>
            <CommandEmpty>No shortcut by that name. Try search or time.</CommandEmpty>
            <CommandGroup heading="Workspace">
              {shortcuts.map((s) => {
                const Icon = s.icon
                return (
                  <CommandItem key={s.id} value={s.label} onSelect={() => setLast(s)}>
                    <Icon aria-hidden />
                    {s.label}
                    <CommandShortcut>{s.keys}</CommandShortcut>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {last ? (
            <>
              Ran <span className="font-medium text-foreground">{last.label}</span>. Next time press{" "}
              <span className="font-medium text-foreground">{last.keys}</span>.
            </>
          ) : (
            "Pick a command to see what it does."
          )}
        </p>
      </CardContent>
    </Card>
  )
}
