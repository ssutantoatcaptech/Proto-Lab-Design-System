import Link from "next/link"
import { LayoutTemplateIcon } from "lucide-react"
import { cn } from "cn"
import { KINDS, topicLabel, type Pattern } from "@/lib/pattern-meta"
import { Badge } from "@/registry/proto-lab/ui/badge"

// One pattern in the gallery: the screen itself first, then its name, what
// it's for, and what kind of thing it is. The whole card is one link.
export function PatternCard({ pattern: p, className }: { pattern: Pattern; className?: string }) {
  return (
    <Link
      href={`/patterns/${p.slug}`}
      className={cn(
        "focus-ring group flex flex-col gap-3 rounded-xl border bg-card p-3 transition-[box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg border bg-muted">
        {p.thumb ? (
          <>
            <img src={`/patterns/${p.slug}-light.jpg`} alt="" loading="lazy" className="size-full object-cover object-top dark:hidden" />
            <img src={`/patterns/${p.slug}-dark.jpg`} alt="" loading="lazy" className="hidden size-full object-cover object-top dark:block" />
          </>
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <LayoutTemplateIcon aria-hidden="true" className="size-8" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 px-1 pb-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-subtitle-2 leading-snug">{p.title}</h3>
          {p.source === "proto-lab" && <Badge className="shrink-0">Proto-Lab</Badge>}
        </div>
        <p className="line-clamp-2 text-caption-1 leading-normal text-muted-foreground">{p.description}</p>
        <p className="text-caption-1 text-muted-foreground">
          {KINDS[p.kind].label} · {topicLabel(p.topic)}
        </p>
      </div>
    </Link>
  )
}
