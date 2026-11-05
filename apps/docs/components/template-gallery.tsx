"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowRightIcon, ArrowUpRightIcon, CheckIcon, CircleDashedIcon, PanelRightOpenIcon } from "lucide-react"
import { cn } from "cn"

import { CodeBlock } from "@/components/code-block"
import { GitHubIcon } from "@/components/site-header"
import { KINDS, type Template, type TemplateKind } from "@/lib/templates"
import { Badge } from "@/registry/proto-lab/ui/badge"
import { Button } from "@/registry/proto-lab/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/registry/proto-lab/ui/sheet"

export const KindBadge = ({ kind }: { kind: TemplateKind }) => (
  <Badge variant={kind === "starter" ? "default" : "secondary"}>{KINDS[kind].label}</Badge>
)

// The interface first: each template is its screenshot. Everything else
// (links, facts, what's inside, how to run it) opens in a side panel, kept in
// the URL as ?template=<slug> so it can be shared and survives a refresh.
export function TemplateGallery({ templates }: { templates: Template[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const open = templates.find((t) => t.slug === params.get("template")) ?? null

  const setOpen = (slug: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (slug) next.set("template", slug)
    else next.delete("template")
    const q = next.toString()
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {templates.map((t) => (
          <li key={t.slug} id={t.slug} className={cn("scroll-mt-24", templates.length === 1 && "md:col-span-2")}>
            <article aria-label={t.title} className="flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
              <button
                type="button"
                onClick={() => setOpen(t.slug)}
                aria-haspopup="dialog"
                aria-label={`${t.title}: open details`}
                className="focus-ring block border-b bg-muted p-3 md:p-4"
              >
                <img
                  src={t.image}
                  alt=""
                  width={1600}
                  height={1000}
                  className="aspect-[16/10] w-full rounded-md border object-cover object-top"
                />
              </button>
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h2 className="text-subtitle-2">{t.title}</h2>
                  <KindBadge kind={t.kind} />
                </div>
                <div className="flex items-center gap-2">
                  {t.demo && (
                    <Button size="sm" nativeButton={false} render={<a href={t.demo} target="_blank" rel="noreferrer" />}>
                      Open live demo
                      <ArrowUpRightIcon data-icon="inline-end" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm" aria-haspopup="dialog" onClick={() => setOpen(t.slug)}>
                    <PanelRightOpenIcon data-icon="inline-start" />
                    Details
                  </Button>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 data-[side=right]:sm:max-w-xl">
          {open && <TemplateDetails t={open} />}
        </SheetContent>
      </Sheet>
    </>
  )
}

function TemplateDetails({ t }: { t: Template }) {
  return (
    <>
      <SheetHeader className="gap-3 p-6 pr-12">
        <div className="flex flex-wrap items-center gap-2 text-caption-1 text-muted-foreground">
          <KindBadge kind={t.kind} />
          <span>Snapshot of {t.source.ref}</span>
        </div>
        <SheetTitle className="text-title-3! font-normal!">{t.title}</SheetTitle>
        <SheetDescription className="text-base">{t.description}</SheetDescription>
        <div className="flex flex-wrap gap-2 pt-2">
          {t.demo && (
            <Button nativeButton={false} render={<a href={t.demo} target="_blank" rel="noreferrer" />}>
              Open live demo
              <ArrowUpRightIcon data-icon="inline-end" />
            </Button>
          )}
          <Button variant={t.demo ? "outline" : "default"} nativeButton={false} render={<a href={t.repo} target="_blank" rel="noreferrer" />}>
            <GitHubIcon data-icon="inline-start" className="size-4" />
            View on GitHub
          </Button>
          <Button variant="ghost" nativeButton={false} render={<a href={t.source.href} target="_blank" rel="noreferrer" />}>
            Source repo
            <ArrowUpRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-4 border-t bg-muted p-4 md:p-6">
      <Section title="About" note={KINDS[t.kind].meaning}>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Stack</dt>
          <dd>{t.stack.join(" · ")}</dd>
          <dt className="text-muted-foreground">Client brand</dt>
          <dd>{t.intake.clientBrand ?? "None, CapTech only"}</dd>
          <dt className="text-muted-foreground">Contributors</dt>
          <dd>{t.intake.contributors}</dd>
          {t.demo && (
            <>
              <dt className="text-muted-foreground">Live demo</dt>
              <dd>Showcase, behind CapTech sign in</dd>
            </>
          )}
        </dl>
      </Section>

      <Section title="What's inside">
        <ul className="flex flex-col gap-4">
          {t.inside.map((i) => (
            <li key={i.title} className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{i.title}</span>
              <span className="text-caption-1 text-muted-foreground">{i.description}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Worth harvesting" note="Parts worth rebuilding as Proto-Lab patterns.">
        <ul className="flex flex-col gap-3">
          {t.intake.harvest.map((h) => (
            <li key={h.label} className="flex items-start gap-2 text-sm">
              {h.block ? (
                <CheckIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
              ) : (
                <CircleDashedIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="flex flex-col gap-0.5">
                <span>{h.label}</span>
                {h.block ? (
                  <Link href={`/patterns/${h.block}`} className="focus-ring inline-flex w-fit items-center gap-1 rounded-sm text-caption-1 font-semibold text-link hover:underline">
                    {h.block} pattern
                    <ArrowRightIcon aria-hidden="true" className="size-3" />
                  </Link>
                ) : (
                  <span className="text-caption-1 text-muted-foreground">Not built yet</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Run it locally" note={t.note}>
        <div className="[&>figure]:my-0">
          <CodeBlock title="Terminal">{t.run}</CodeBlock>
        </div>
      </Section>
      </div>
    </>
  )
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border bg-card p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-subtitle-2">{title}</h3>
        {note && <p className="text-caption-1 text-muted-foreground">{note}</p>}
      </div>
      {children}
    </section>
  )
}
