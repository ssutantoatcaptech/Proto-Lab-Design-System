"use client"

import { useEffect, useState } from "react"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { Button } from "@/registry/proto-lab/ui/button"
import { useTheme, type Theme } from "@/components/theme-provider"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger,
} from "@/registry/proto-lab/ui/dropdown-menu"

const OPTIONS = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] as const

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const Icon = !mounted ? SunIcon : resolvedTheme === "dark" ? MoonIcon : SunIcon
  const current = OPTIONS.find((o) => o.value === theme)?.label ?? "System"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label={mounted ? `Theme: ${current}` : "Theme"} />}
      >
        <Icon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuRadioGroup value={mounted ? theme : undefined} onValueChange={(v) => setTheme(v as Theme)}>
          {OPTIONS.map(({ value, label, icon: ItemIcon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <ItemIcon /> {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
