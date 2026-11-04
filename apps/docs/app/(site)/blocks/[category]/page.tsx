import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cn } from "cn"
import { BlockSwitcher } from "@/components/block-switcher"
import { blockFiles, blocksIn, categories, type Category } from "@/lib/blocks"

type Props = { params: Promise<{ category: string }> }

const find = (slug: string) => categories.find((c) => c.slug === slug)

export default async function BlocksPage({ params }: Props) {
  const { category } = await params
  const current = find(category)
  if (!current) notFound()
  const blocks = await Promise.all(blocksIn(current.slug).map(async (b) => ({ ...b, files: await blockFiles(b.name, current.slug) })))

  return (
    <main id="content" className="mx-auto flex max-w-screen-2xl flex-col gap-6 px-4 py-10 md:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-title-1">Patterns</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Sections and screens to start from. Preview at any width, read the code, and install with one command.
        </p>
      </header>

      <section aria-label="Browse patterns" className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between md:px-6">
          <nav aria-label="Block categories" className="-mx-1 overflow-x-auto px-1">
            <ul className="inline-flex w-max gap-0.5 rounded-lg bg-muted p-1">
              {categories.map((c) => {
                const count = blocksIn(c.slug as Category).length
                const active = c.slug === current.slug
                return (
                  <li key={c.slug}>
                    <Link
                      href={`/blocks/${c.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "focus-ring flex h-8 items-center gap-2 rounded-md px-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
                        active && "bg-card text-foreground shadow-xs"
                      )}
                    >
                      {c.title}
                      <span className={cn("rounded-full px-1.5 text-caption-1 font-normal", active ? "bg-primary text-primary-foreground" : "bg-background")}>{count}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          <p className="text-caption-1 text-muted-foreground">
            {blocks.length} {blocks.length === 1 ? "pattern" : "patterns"} · {current.slug === "captech" ? "Proto-Lab" : "Upstream shadcn/ui"}
          </p>
        </div>
        <p className="border-t bg-muted/40 px-4 py-3 text-sm text-muted-foreground md:px-6">{current.description}</p>
      </section>

      <BlockSwitcher blocks={blocks} />
    </main>
  )
}

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const c = find(category)
  return { title: c ? `${c.title} patterns` : "Patterns", description: c?.description }
}
