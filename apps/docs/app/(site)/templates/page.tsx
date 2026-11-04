import type { Metadata } from "next"
import { ArrowUpRightIcon, FolderOpenIcon } from "lucide-react"

import { CodeBlock } from "@/components/code-block"
import { site } from "@/lib/site"
import { templates } from "@/lib/templates"
import { Badge } from "@/registry/proto-lab/ui/badge"
import { Button } from "@/registry/proto-lab/ui/button"

export const metadata: Metadata = {
  title: "Templates",
  description: "Working CapTech prototypes to start a new build from.",
}

export default function TemplatesPage() {
  return (
    <main id="content" className="mx-auto flex max-w-screen-2xl flex-col gap-10 px-4 py-10 md:px-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-title-1">Templates</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Working prototypes from CapTech engagements, kept in this repo as starting points. Copy a folder from{" "}
          <code className="font-mono text-sm">templates/</code>, run it, then restyle it with Proto-Lab.
        </p>
      </header>

      <ul className="flex flex-col gap-12">
        {templates.map((t) => (
          <li key={t.slug} id={t.slug} className="grid scroll-mt-24 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <a
              href={t.source.href}
              target="_blank"
              rel="noreferrer"
              className="group block self-start overflow-hidden rounded-lg border bg-muted focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <img
                src={t.image}
                alt={`${t.title} home screen`}
                width={1600}
                height={1000}
                className="aspect-[16/10] w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </a>

            <div className="flex min-w-0 flex-col gap-6">
              <div className="flex flex-col gap-3">
                <h2 className="text-title-2">{t.title}</h2>
                <p className="text-base text-muted-foreground">{t.description}</p>
                <div className="flex flex-wrap gap-2">
                  {t.stack.map((s) => (
                    <Badge key={s} variant="outline">{s}</Badge>
                  ))}
                </div>
              </div>

              <section className="flex flex-col gap-3">
                <h3 className="text-subtitle-2">What's inside</h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {t.inside.map((i) => (
                    <li key={i.title} className="flex flex-col gap-1 rounded-lg border p-4">
                      <span className="text-sm font-semibold">{i.title}</span>
                      <span className="text-caption-1 text-muted-foreground">{i.description}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="flex flex-col gap-3 [&>figure]:my-0">
                <h3 className="text-subtitle-2">Run it</h3>
                <CodeBlock title="Terminal">{t.run}</CodeBlock>
                <p className="text-caption-1 text-muted-foreground">{t.note}</p>
              </section>

              <div className="flex flex-wrap items-center gap-2">
                <Button nativeButton={false} render={<a href={`${site.github}/tree/shadcn-foundation/templates/${t.slug}`} target="_blank" rel="noreferrer" />}>
                  <FolderOpenIcon data-icon="inline-start" />
                  Open template folder
                </Button>
                <Button variant="outline" nativeButton={false} render={<a href={t.source.href} target="_blank" rel="noreferrer" />}>
                  Source repo
                  <ArrowUpRightIcon data-icon="inline-end" />
                </Button>
                <span className="text-caption-1 text-muted-foreground">Snapshot of {t.source.ref}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
