import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from "lucide-react"

import { BlockFrame } from "@/components/block-frame"
import { PatternCard } from "@/components/pattern-card"
import { allPatterns, findPattern, KINDS, patternFiles, SOURCES, topicLabel } from "@/lib/patterns"
import { Badge } from "@/registry/proto-lab/ui/badge"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/registry/proto-lab/ui/breadcrumb"

type Props = { params: Promise<{ slug: string }> }

export default async function PatternPage({ params }: Props) {
  const { slug } = await params
  const p = findPattern(slug)
  if (!p) notFound()
  const files = await patternFiles(p)

  const sameTopic = allPatterns().filter((x) => x.topic === p.topic).sort((a, b) => a.rank - b.rank)
  const at = sameTopic.findIndex((x) => x.slug === p.slug)
  const prev = sameTopic[at - 1]
  const next = sameTopic[at + 1]
  const related = sameTopic.filter((x) => x.slug !== p.slug).slice(0, 3)
  const topicHref = `/patterns?topic=${p.topic}`

  return (
    <main id="content" className="mx-auto flex max-w-screen-2xl flex-col gap-6 px-4 py-10 md:px-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink render={<Link href="/patterns" />}>Patterns</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink render={<Link href={topicHref} />}>{topicLabel(p.topic)}</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{p.title}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-col gap-3">
        <h1 className="text-title-1">{p.title}</h1>
        <p className="max-w-[65ch] text-base leading-relaxed text-muted-foreground">{p.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{KINDS[p.kind].label}</Badge>
          <Badge variant="outline">{topicLabel(p.topic)}</Badge>
          <Badge variant={p.source === "proto-lab" ? "default" : "outline"}>{SOURCES[p.source]}</Badge>
          {p.origin && (
            <Link href={p.origin.href} className="focus-ring ml-1 inline-flex items-center gap-1 rounded-sm text-caption-1 text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Harvested from {p.origin.label}
              <ArrowUpRightIcon aria-hidden="true" className="size-3" />
            </Link>
          )}
          {!p.install && <span className="text-caption-1 text-muted-foreground">Not in the registry yet: copy the files from Code.</span>}
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border bg-card">
        <BlockFrame
          name={p.slug}
          title={p.title}
          description={p.description}
          source={p.source === "proto-lab" ? "captech" : "upstream"}
          install={p.install}
          heading={false}
          height={p.height}
          files={files}
        />
      </div>

      {(prev || next) && (
        <nav aria-label={`More in ${topicLabel(p.topic)}`} className="flex flex-wrap justify-between gap-3">
          {prev ? (
            <Link href={`/patterns/${prev.slug}`} className="focus-ring flex flex-col gap-0.5 rounded-lg border bg-card px-4 py-3 hover:bg-muted">
              <span className="flex items-center gap-1 text-caption-1 text-muted-foreground"><ArrowLeftIcon aria-hidden="true" className="size-3" />Previous</span>
              <span className="text-sm font-semibold">{prev.title}</span>
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/patterns/${next.slug}`} className="focus-ring flex flex-col items-end gap-0.5 rounded-lg border bg-card px-4 py-3 hover:bg-muted">
              <span className="flex items-center gap-1 text-caption-1 text-muted-foreground">Next<ArrowRightIcon aria-hidden="true" className="size-3" /></span>
              <span className="text-sm font-semibold">{next.title}</span>
            </Link>
          )}
        </nav>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related" className="flex flex-col gap-4 border-t pt-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="related" className="text-title-3">More in {topicLabel(p.topic)}</h2>
            <Link href={topicHref} className="focus-ring rounded-sm text-sm font-semibold text-link hover:underline">See all</Link>
          </div>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {related.map((r) => <li key={r.slug}><PatternCard pattern={r} className="h-full" /></li>)}
          </ul>
        </section>
      )}
    </main>
  )
}

export function generateStaticParams() {
  return allPatterns().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = findPattern(slug)
  return { title: p ? `${p.title} pattern` : "Pattern", description: p?.description }
}
