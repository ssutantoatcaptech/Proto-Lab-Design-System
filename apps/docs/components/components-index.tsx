import Link from "next/link"
import type * as PageTree from "fumadocs-core/page-tree"
import { source } from "@/lib/source"

type Group = { title: string; items: PageTree.Item[] }

// Groups come from the separators in content/docs/components/meta.json, the
// same ones the sidebar uses, so the two can't disagree.
function componentGroups(): Group[] {
  const groups: Group[] = []
  const walk = (nodes: PageTree.Node[]) => {
    for (const node of nodes) {
      if (node.type === "separator") groups.push({ title: String(node.name ?? ""), items: [] })
      else if (node.type === "folder") walk(node.children)
      else if (node.type === "page" && /^\/docs\/components\/.+/.test(node.url)) groups.at(-1)?.items.push(node)
    }
  }
  walk(source.getPageTree().children)
  return groups.filter((g) => g.items.length)
}

export function ComponentsIndex() {
  const groups = componentGroups()
  const total = groups.reduce((n, g) => n + g.items.length, 0)
  return (
    <div className="not-prose my-2 flex flex-col gap-8">
      <p className="text-caption-1 text-muted-foreground">{total} components in {groups.length} groups</p>
      {groups.map((g) => (
        <section key={g.title} aria-labelledby={`group-${g.title}`} className="flex flex-col gap-2">
          <h2 id={`group-${g.title}`} className="text-subtitle-2">
            {g.title} <span className="font-normal text-muted-foreground">{g.items.length}</span>
          </h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
            {g.items.map((p) => (
              <li key={p.url}>
                <Link href={p.url} className="focus-ring block rounded-sm py-1.5 text-base underline-offset-4 hover:underline">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
