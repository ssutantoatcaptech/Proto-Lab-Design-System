"use client"

import { useState } from "react"
import { CodeIcon, EyeIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/registry/proto-lab/ui/button"
import { CopyButton } from "@/components/copy-button"

// One chart in the gallery: the live chart, or its code, with copy actions.
export function ChartCard({ name, title, wide, code, raw, children }: {
  name: string
  title: string
  wide: boolean
  code: React.ReactNode
  raw: string
  children: React.ReactNode
}) {
  const [showCode, setShowCode] = useState(false)
  const command = `npx shadcn@latest add @proto-lab/${name}`
  return (
    <section id={name} aria-label={title} className={cn("scroll-mt-20 flex flex-col gap-2", wide && "md:col-span-2 xl:col-span-3")}>
      <div className="flex items-center justify-between gap-2">
        <a href={`#${name}`} className="focus-ring truncate rounded-sm text-caption-1 font-semibold text-muted-foreground hover:text-foreground">{title}</a>
        <div className="flex shrink-0 items-center gap-1">
          <CopyButton value={raw} label={`Copy code for ${name}`} className="size-7" />
          <Button variant="ghost" size="sm" aria-pressed={showCode} onClick={() => setShowCode((s) => !s)}>
            {showCode ? <EyeIcon /> : <CodeIcon />} {showCode ? "Chart" : "Code"}
          </Button>
        </div>
      </div>
      {showCode ? (
        <div className="relative max-h-112 overflow-auto rounded-md border bg-background">
          <div className="sticky top-0 flex items-center justify-between gap-2 border-b bg-background px-4 py-2">
            <code className="truncate font-mono text-caption-1 text-muted-foreground">{command}</code>
            <CopyButton value={command} label={`Copy install command for ${name}`} className="size-7" />
          </div>
          <div className="px-4 py-3 font-mono text-sm [&_pre]:bg-transparent!">{code}</div>
        </div>
      ) : (
        <div className="[&>[data-slot=card]]:h-full">{children}</div>
      )}
    </section>
  )
}
