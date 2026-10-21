"use client"

import { useEffect, useState } from "react"
import { cn } from "cn"

const LAYOUTS = [
  { value: "01", label: "01", title: "Engagement workspace" },
  { value: "02", label: "02", title: "Settings" },
] as const
type Layout = (typeof LAYOUTS)[number]["value"]

// 01 / 02 switch, like the one on shadcn Create, kept in the URL (?layout=02).
export function ShowcaseLayouts({ workspace, settings }: { workspace: React.ReactNode; settings: React.ReactNode }) {
  const [layout, setLayout] = useState<Layout>("01")
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("layout")
    if (v === "02") setLayout("02")
  }, [])
  const choose = (v: Layout) => {
    setLayout(v)
    const p = new URLSearchParams(window.location.search)
    if (v === "01") p.delete("layout")
    else p.set("layout", v)
    const qs = p.toString()
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`)
  }
  const current = LAYOUTS.find((l) => l.value === layout)!
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-subtitle-1">{current.title}</h2>
        <div role="radiogroup" aria-label="Showcase layout" className="inline-flex rounded-md bg-muted p-0.5">
          {LAYOUTS.map((l) => (
            <button
              key={l.value}
              type="button"
              role="radio"
              aria-checked={layout === l.value}
              aria-label={`${l.label} ${l.title}`}
              onClick={() => choose(l.value)}
              className={cn(
                "focus-ring flex h-7 items-center rounded-sm px-3 font-mono text-caption-1 font-semibold text-muted-foreground transition-colors hover:text-foreground",
                layout === l.value && "bg-card text-foreground shadow-xs"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      {layout === "01" ? workspace : settings}
    </div>
  )
}
