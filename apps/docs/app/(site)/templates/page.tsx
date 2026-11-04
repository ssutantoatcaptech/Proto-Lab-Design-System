import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon, ArrowUpRightIcon, CheckIcon, CircleDashedIcon } from "lucide-react"

import { CodeBlock } from "@/components/code-block"
import { GitHubIcon } from "@/components/site-header"
import { KINDS, templates, type Template, type TemplateKind } from "@/lib/templates"
import { Badge } from "@/registry/proto-lab/ui/badge"
import { Button } from "@/registry/proto-lab/ui/button"

export const metadata: Metadata = {
  title: "Templates",
  description: "Whole prototypes from CapTech work, ready to run.",
}

const kindBadge = (kind: TemplateKind) => (
  <Badge variant={kind === "starter" ? "default" : "secondary"}>{KINDS[kind].label}</Badge>
)

export default function TemplatesPage() {
  return (
    <main id="content" className="mx-auto flex max-w-screen-2xl flex-col gap-12 px-4 py-10 md:px-8">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-title-1">Templates</h1>
          <p className="max-w-2xl text-base text-muted-foreground">Whole prototypes from CapTech work, ready to run.</p>
        </div>
        <dl className="flex flex-col gap-2 text-sm sm:flex-row sm:gap-8">
          {(Object.keys(KINDS) as TemplateKind[]).map((k) => (
            <div key={k} className="flex items-center gap-2">
              <dt>{kindBadge(k)}</dt>
              <dd className="text-muted-foreground">{KINDS[k].meaning}</dd>
            </div>
          ))}
        </dl>
      </header>

      <ul className="flex flex-col gap-12">
        {templates.map((t) => (
          <li key={t.slug} id={t.slug} className="scroll-mt-24">
            <TemplateCard t={t} />
          </li>
        ))}
      </ul>
    </main>
  )
}

function TemplateCard({ t }: { t: Template }) {
  return (
    <article aria-labelledby={`${t.slug}-title`} className="overflow-hidden rounded-xl border bg-card">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="border-b bg-muted p-4 md:p-6 lg:border-b-0 lg:border-r">
          <img
            src={t.image}
            alt={`${t.title} home screen`}
            width={1600}
            height={1000}
            className="aspect-[16/10] w-full rounded-md border object-cover object-top"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-6 p-6 md:p-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-caption-1 text-muted-foreground">
              {kindBadge(t.kind)}
              <span>Snapshot of {t.source.ref}</span>
            </div>
            <h2 id={`${t.slug}-title`} className="text-title-2">{t.title}</h2>
            <p className="text-base text-muted-foreground">{t.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
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

          <dl className="mt-auto grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 border-t pt-6 text-sm">
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
        </div>
      </div>

      <div className="grid grid-cols-1 border-t md:grid-cols-3 md:divide-x">
        <Detail title="What's inside">
          <ul className="flex flex-col gap-4">
            {t.inside.map((i) => (
              <li key={i.title} className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{i.title}</span>
                <span className="text-caption-1 text-muted-foreground">{i.description}</span>
              </li>
            ))}
          </ul>
        </Detail>

        <Detail title="Worth harvesting" note="Patterns to rebuild as Proto-Lab blocks.">
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
                    <Link href={`/blocks/captech#${h.block}`} className="focus-ring inline-flex w-fit items-center gap-1 rounded-sm text-caption-1 font-semibold text-link hover:underline">
                      {h.block} block
                      <ArrowRightIcon aria-hidden="true" className="size-3" />
                    </Link>
                  ) : (
                    <span className="text-caption-1 text-muted-foreground">Not built yet</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Detail>

        <Detail title="Run it locally" note={t.note}>
          <div className="[&>figure]:my-0">
            <CodeBlock title="Terminal">{t.run}</CodeBlock>
          </div>
        </Detail>
      </div>
    </article>
  )
}

function Detail({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-4 border-b p-6 last:border-b-0 md:border-b-0 md:p-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-subtitle-2">{title}</h3>
        {note && <p className="text-caption-1 text-muted-foreground">{note}</p>}
      </div>
      {children}
    </section>
  )
}
