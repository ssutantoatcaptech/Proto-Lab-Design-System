"use client"

import { useEffect, useState } from "react"
import { cn } from "cn"

export type TocItem = { title: string; url: string; depth: number }

// Highlights the heading currently in view, like ui.shadcn.com's "On This Page".
export function DocsToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.url ?? null)

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(decodeURIComponent(i.url.slice(1))))
      .filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(`#${visible[0].target.id}`)
      },
      { rootMargin: "-80px 0px -70% 0px" }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items])

  if (!items.length) return null
  return (
    <nav aria-label="On this page" className="flex flex-col gap-2">
      <h4 className="text-caption-1 text-muted-foreground">On This Page</h4>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.url} style={{ paddingLeft: `${Math.max(0, item.depth - 2) * 12}px` }}>
            <a
              href={item.url}
              aria-current={active === item.url ? "location" : undefined}
              className={cn(
                "focus-ring block rounded-sm text-muted-foreground transition-colors hover:text-foreground",
                active === item.url && "text-foreground"
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
