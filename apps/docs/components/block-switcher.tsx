"use client"

import { useEffect, useState } from "react"
import type { BlockSource } from "@/lib/block-source"
import { BlockFrame } from "@/components/block-frame"
import { Tabs, TabsList, TabsTrigger } from "@/registry/proto-lab/ui/tabs"
import { cn } from "cn"

type Block = {
  name: string
  title?: string
  group?: string
  description: string | null
  source: BlockSource
  height: number
  files: { path: string; raw: string; code: React.ReactNode }[]
}

// One block at a time, picked from tabs under the category, so a category
// with many blocks doesn't need scrolling. The pick lives in the URL hash
// (#match-finder), so links and search results land on the right block.
export function BlockSwitcher({ blocks }: { blocks: Block[] }) {
  const [active, setActive] = useState(blocks[0]?.name)

  useEffect(() => {
    const fromHash = () => {
      const name = decodeURIComponent(window.location.hash.slice(1))
      if (blocks.some((b) => b.name === name)) setActive(name)
    }
    fromHash()
    window.addEventListener("hashchange", fromHash)
    return () => window.removeEventListener("hashchange", fromHash)
  }, [blocks])

  const pick = (name: string) => {
    setActive(name)
    window.history.replaceState(null, "", `#${name}`)
  }

  const block = blocks.find((b) => b.name === active) ?? blocks[0]
  if (!block) return null

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {blocks.length > 1 && (
        <Tabs value={block.name} onValueChange={(v) => pick(String(v))}>
          <div className="overflow-x-auto border-b px-4 pt-2 md:px-6">
            <TabsList variant="line" aria-label="Patterns in this category" className="h-10 w-max gap-1">
              {blocks.map((b, i) => (
                <span key={b.name} className="flex items-center gap-1">
                  {b.group && b.group !== blocks[i - 1]?.group && (
                    <span aria-hidden="true" className={cn("text-caption-1-strong uppercase tracking-wide text-muted-foreground", i > 0 && "ml-4 border-l pl-4")}>
                      {b.group}
                    </span>
                  )}
                  <TabsTrigger value={b.name} className="flex-none px-2" aria-label={b.group ? `${b.title ?? b.name}, ${b.group}` : undefined}>
                    {b.title ?? b.name}
                  </TabsTrigger>
                </span>
              ))}
            </TabsList>
          </div>
        </Tabs>
      )}
      <BlockFrame key={block.name} name={block.name} title={block.title} group={block.group} source={block.source} description={block.description} height={block.height} files={block.files} />
    </div>
  )
}
