import Link from "next/link"
import { source } from "@/lib/source"

// Every component page, alphabetically, like ui.shadcn.com/docs/components.
export function ComponentsIndex() {
  const pages = source.getPages()
    .filter((p) => p.slugs[0] === "components" && p.slugs.length === 2)
    .sort((a, b) => a.data.title.localeCompare(b.data.title))
  return (
    <div className="not-prose my-2">
      <p className="mb-4 text-caption-1 text-muted-foreground">{pages.length} components</p>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
        {pages.map((p) => (
          <li key={p.url}>
            <Link href={p.url} className="focus-ring block rounded-sm py-1.5 text-base underline-offset-4 hover:underline">
              {p.data.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
