import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cn } from "cn"
import { BlockFrame } from "@/components/block-frame"
import { blockFiles, blocksIn, categories, type Category } from "@/lib/blocks"

type Props = { params: Promise<{ category: string }> }

const find = (slug: string) => categories.find((c) => c.slug === slug)

export default async function BlocksPage({ params }: Props) {
  const { category } = await params
  const current = find(category)
  if (!current) notFound()
  const blocks = await Promise.all(blocksIn(current.slug).map(async (b) => ({ ...b, files: await blockFiles(b.name, current.slug) })))

  return (
    <main id="content" className="mx-auto flex max-w-screen-2xl flex-col gap-8 px-4 py-10 md:px-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-title-1">Blocks</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Complete screens built from Proto-Lab components. Preview them at any width, read the code, and install one with a single command. They come from shadcn/ui and render with the Proto-Lab theme.
        </p>
      </header>

      <nav aria-label="Block categories" className="flex flex-wrap gap-1.5 border-b pb-4">
        {categories.map((c) => {
          const count = blocksIn(c.slug as Category).length
          const active = c.slug === current.slug
          return (
            <Link
              key={c.slug}
              href={`/blocks/${c.slug}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-ring flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
            >
              {c.title} <span className="font-normal">{count}</span>
            </Link>
          )
        })}
      </nav>

      <p className="-mt-4 text-sm text-muted-foreground">{current.description}</p>

      <div className="flex flex-col gap-14">
        {blocks.map((b) => (
          <BlockFrame key={b.name} name={b.name} description={b.description} height={b.height} files={b.files} />
        ))}
      </div>
    </main>
  )
}

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const c = find(category)
  return { title: c ? `${c.title} blocks` : "Blocks", description: c?.description }
}
