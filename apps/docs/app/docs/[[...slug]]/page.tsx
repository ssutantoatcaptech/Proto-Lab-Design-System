import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { findNeighbour } from "fumadocs-core/page-tree"
import { source } from "@/lib/source"
import { mdxComponents } from "@/components/mdx-components"
import { DocsToc } from "@/components/docs-toc"
import { PageActions } from "@/components/page-actions"
import { HeuristicBadges } from "@/components/heuristics"

type Props = { params: Promise<{ slug?: string[] }> }

export default async function DocPage({ params }: Props) {
  const { slug } = await params
  const page = source.getPage(slug)
  if (!page) notFound()

  const MDX = page.data.body
  const markdown = await page.data.getText("processed")
  const { previous, next } = findNeighbour(source.getPageTree(), page.url)
  const toc = page.data.structuredData.headings.map((h) => ({
    title: h.content,
    url: `#${h.id}`,
    depth: page.data.toc.find((t) => t.url === `#${h.id}`)?.depth ?? 2,
  }))

  return (
    <div className="flex min-w-0 flex-1 gap-10 py-8 md:pl-10 xl:gap-16">
      <main id="content" className="mx-auto w-full min-w-0 max-w-3xl flex-1">
        <div className="flex flex-col gap-2 pb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <h1 className="text-title-1">{page.data.title}</h1>
            <PageActions
              markdown={`# ${page.data.title}\n\n${page.data.description ? `${page.data.description}\n\n` : ""}${markdown}`}
              previous={previous ? { title: String(previous.name), url: previous.url } : undefined}
              next={next ? { title: String(next.name), url: next.url } : undefined}
            />
          </div>
          {page.data.description && <p className="text-subtitle-2 font-normal text-muted-foreground">{page.data.description}</p>}
          {(page.data.heuristics || page.data.base) && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {page.data.heuristics && <HeuristicBadges ids={page.data.heuristics} />}
              {page.data.base && (
                <a href={page.data.base} target="_blank" rel="noreferrer" className="focus-ring rounded-sm text-caption-1 text-muted-foreground underline underline-offset-4 hover:text-foreground">
                  Built on Base UI
                </a>
              )}
            </div>
          )}
        </div>
        <article className="docs-prose">
          <MDX components={mdxComponents} />
        </article>
        <PageFooterNav previous={previous} next={next} />
      </main>
      <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-52 shrink-0 overflow-y-auto pt-2 xl:block">
        <DocsToc items={toc} />
      </aside>
    </div>
  )
}

function PageFooterNav({ previous, next }: { previous?: { name: React.ReactNode; url: string }; next?: { name: React.ReactNode; url: string } }) {
  if (!previous && !next) return null
  return (
    <nav aria-label="Pagination" className="mt-16 flex justify-between gap-4 border-t pt-6">
      {previous ? (
        <a href={previous.url} className="focus-ring flex flex-col gap-1 rounded-md p-2 hover:bg-accent">
          <span className="text-caption-1 text-muted-foreground">Previous</span>
          <span className="font-semibold">{previous.name}</span>
        </a>
      ) : <span />}
      {next && (
        <a href={next.url} className="focus-ring flex flex-col items-end gap-1 rounded-md p-2 text-right hover:bg-accent">
          <span className="text-caption-1 text-muted-foreground">Next</span>
          <span className="font-semibold">{next.name}</span>
        </a>
      )}
    </nav>
  )
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({ slug: page.slugs }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = source.getPage(slug)
  if (!page) notFound()
  return { title: page.data.title, description: page.data.description }
}
