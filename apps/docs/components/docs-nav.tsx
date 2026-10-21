"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type * as PageTree from "fumadocs-core/page-tree"
import { cn } from "cn"

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

export function DocsNav({ tree, onNavigate }: { tree: PageTree.Root; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Documentation" className="flex flex-col gap-6">
      {groups(tree).map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <h4 className="px-2 text-caption-1 text-muted-foreground">{group.title}</h4>
          <ul className="flex flex-col gap-0.5">
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
        </div>
      ))}
    </nav>
  )
}
