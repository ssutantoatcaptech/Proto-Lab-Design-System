"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronDownIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import type * as PageTree from "fumadocs-core/page-tree"
import { cn } from "cn"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/registry/proto-lab/ui/collapsible"

type Group = { title: string; items: PageTree.Item[] }

// Separators in meta.json ("---Foundations---") start a new sidebar group.
function groups(tree: PageTree.Root): Group[] {
  const out: Group[] = []
  const add = (node: PageTree.Node) => {
    if (node.type === "separator") out.push({ title: String(node.name ?? ""), items: [] })
    else if (node.type === "page") {
      if (!out.length) out.push({ title: "Get Started", items: [] })
      out.at(-1)!.items.push(node)
    } else if (node.type === "folder") {
      if (node.index) add(node.index)
      node.children.forEach(add)
    }
  }
  tree.children.forEach(add)
  return out.filter((g) => g.items.length)
}

const KEY = "proto-lab:nav-collapsed"

function readCollapsed(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") } catch { return [] }
}

// Each section expands and collapses, and the choice is remembered. The
// section holding the current page opens when you arrive on it.
export function DocsNav({ tree, onNavigate }: { tree: PageTree.Root; onNavigate?: () => void }) {
  const pathname = usePathname()
  const all = groups(tree)
  const activeGroup = all.find((g) => g.items.some((i) => i.url === pathname))?.title
  const [collapsed, setCollapsed] = useState<string[]>([])

  const save = (next: string[]) => {
    setCollapsed(next)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
  }

  // Restore on load, and open the current page's section whenever you
  // navigate. It can still be collapsed afterwards.
  useEffect(() => {
    const stored = readCollapsed()
    save(activeGroup ? stored.filter((t) => t !== activeGroup) : stored)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroup])

  const isOpen = (title: string) => !collapsed.includes(title)
  const toggle = (title: string, open: boolean) =>
    save(open ? collapsed.filter((t) => t !== title) : [...new Set([...collapsed, title])])

  return (
    <nav aria-label="Documentation" className="flex flex-col gap-3">
      {all.map((group) => {
        const open = isOpen(group.title)
        return (
          <Collapsible key={group.title} open={open} onOpenChange={(o) => toggle(group.title, o)}>
            <CollapsibleTrigger
              className="focus-ring group/section flex h-8 w-full items-center justify-between rounded-md px-2 text-caption-1-strong text-foreground transition-colors hover:bg-accent"
            >
              {group.title}
              <ChevronDownIcon aria-hidden="true" className="size-4 text-foreground transition-transform duration-150 group-data-[panel-open]/section:rotate-0 -rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-150 ease-easy-ease data-[ending-style]:h-0 data-[starting-style]:h-0">
              <ul className="flex flex-col gap-0.5 pb-2 pt-1">
                {group.items.map((item) => {
                  const active = pathname === item.url
                  return (
                    <li key={item.url}>
                      <Link
                        href={item.url}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "focus-ring flex h-8 items-center rounded-md px-2 transition-colors hover:bg-accent",
                          active && "bg-accent font-semibold text-foreground"
                        )}
                      >
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </nav>
  )
}
