"use client"

import { useEffect, useState } from "react"
import { MonitorIcon, MoonIcon, SunIcon, SunMoonIcon } from "lucide-react"
import { Button } from "@/registry/proto-lab/ui/button"
import { nextSwitch, useTheme, type Theme } from "@/components/theme-provider"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/registry/proto-lab/ui/dropdown-menu"

const OPTIONS = [
  { value: "auto", label: "Auto", hint: "Light by day, dark by night", icon: SunMoonIcon },
  { value: "light", label: "Light", hint: "Always light", icon: SunIcon },
  { value: "dark", label: "Dark", hint: "Always dark", icon: MoonIcon },
  { value: "system", label: "System", hint: "Match this device's setting", icon: MonitorIcon },
] as const

const time = (d: Date) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // The button shows what's on screen now; the menu says why.
  const Icon = !mounted ? SunMoonIcon : resolvedTheme === "dark" ? MoonIcon : SunIcon
  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[0]
  const status = !mounted
    ? ""
    : theme === "auto"
      ? `${resolvedTheme === "dark" ? "Dark" : "Light"} until ${time(nextSwitch())}`
      : theme === "system"
        ? `${resolvedTheme === "dark" ? "Dark" : "Light"}, from this device`
        : `Always ${current.label.toLowerCase()}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label={mounted ? `Theme: ${current.label}. ${status}` : "Theme"} />}
      >
        <Icon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span>Theme</span>
            {status && <span className="text-caption-1 font-normal text-muted-foreground">{status}</span>}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={mounted ? theme : undefined} onValueChange={(v) => setTheme(v as Theme)}>
          {OPTIONS.map(({ value, label, hint, icon: ItemIcon }) => (
            <DropdownMenuRadioItem key={value} value={value} className="items-start">
              <ItemIcon className="mt-0.5" />
              <span className="flex flex-col">
                <span>{label}</span>
                <span className="text-caption-1 text-muted-foreground">{hint}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
