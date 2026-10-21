"use client"

import { useEffect, useState } from "react"
import { TerminalIcon } from "lucide-react"
import { cn } from "cn"
import { CopyButton } from "@/components/copy-button"

const MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const
type Manager = (typeof MANAGERS)[number]
const RUNNER: Record<Manager, string> = { pnpm: "pnpm dlx", npm: "npx", yarn: "yarn dlx", bun: "bunx --bun" }
const KEY = "proto-lab:package-manager"
const EVENT = "proto-lab:package-manager"

function readManager(): Manager {
  try {
    const v = localStorage.getItem(KEY)
    return MANAGERS.includes(v as Manager) ? (v as Manager) : "pnpm"
  } catch { return "pnpm" }
}

// The chosen package manager is remembered and shared by every command on the site.
export function InstallCommand({ args }: { args: string }) {
  const [pm, setPm] = useState<Manager>("pnpm")
  useEffect(() => {
    setPm(readManager())
    const sync = () => setPm(readManager())
    window.addEventListener(EVENT, sync)
    window.addEventListener("storage", sync)
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener("storage", sync) }
  }, [])
  const choose = (m: Manager) => {
    setPm(m)
    try { localStorage.setItem(KEY, m) } catch {}
    window.dispatchEvent(new Event(EVENT))
  }
  const command = `${RUNNER[pm]} shadcn@latest ${args}`

  return (
    <div className="my-6 overflow-hidden rounded-lg border bg-muted">
      <div className="flex h-10 items-center gap-1 border-b px-2" role="tablist" aria-label="Package manager">
        <TerminalIcon aria-hidden="true" className="mx-1 size-4 text-muted-foreground" />
        {MANAGERS.map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={pm === m}
            onClick={() => choose(m)}
            className={cn(
              "focus-ring rounded-md px-2 py-0.5 font-mono text-caption-1 text-muted-foreground transition-colors hover:text-foreground",
              pm === m && "bg-background text-foreground shadow-xs"
            )}
          >
            {m}
          </button>
        ))}
        <CopyButton value={command} label="Copy command" className="ml-auto" />
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-sm"><code>{command}</code></pre>
    </div>
  )
}
