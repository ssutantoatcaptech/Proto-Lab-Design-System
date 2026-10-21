"use client"

import { useState } from "react"
import { cn } from "cn"
import { CopyButton } from "@/components/copy-button"

export function ComponentPreviewTabs({ preview, code, raw, align }: {
  preview: React.ReactNode
  code: React.ReactNode
  raw: string
  align: "center" | "start"
}) {
  const [tab, setTab] = useState<"preview" | "code">("preview")
  return (
    <div className="not-prose my-6">
      <div role="tablist" aria-label="Example view" className="mb-2 flex gap-4 border-b">
        {(["preview", "code"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "focus-ring -mb-px border-b-2 border-transparent px-1 pb-2 capitalize text-muted-foreground transition-colors hover:text-foreground",
              tab === t && "border-foreground font-semibold text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "preview" ? (
        <div
          role="tabpanel"
          className={cn(
            "flex min-h-72 w-full flex-wrap gap-4 rounded-lg border bg-background p-10",
            align === "center" ? "items-center justify-center" : "items-start"
          )}
        >
          {preview}
        </div>
      ) : (
        <div role="tabpanel" className="relative max-h-112 overflow-auto rounded-lg border bg-muted">
          <div className="px-4 py-3 font-mono text-sm [&_pre]:bg-transparent!">{code}</div>
          <CopyButton value={raw} label="Copy code" className="absolute right-2 top-2" />
        </div>
      )}
    </div>
  )
}
