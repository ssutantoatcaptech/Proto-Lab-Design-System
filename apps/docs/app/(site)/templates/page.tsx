import { Suspense } from "react"
import type { Metadata } from "next"

import { KindBadge, TemplateGallery } from "@/components/template-gallery"
import { KINDS, templates, type TemplateKind } from "@/lib/templates"

export const metadata: Metadata = {
  title: "Templates",
  description: "Whole prototypes from CapTech work, ready to run.",
}

export default function TemplatesPage() {
  return (
    <main id="content" className="mx-auto flex max-w-screen-2xl flex-col gap-10 px-4 py-10 md:px-8">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-title-1">Templates</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Whole prototypes from CapTech work, ready to run. Open one for its links, what's inside and how to run it.
          </p>
        </div>
        <dl className="flex flex-col gap-2 text-sm sm:flex-row sm:gap-8">
          {(Object.keys(KINDS) as TemplateKind[]).map((k) => (
            <div key={k} className="flex items-center gap-2">
              <dt><KindBadge kind={k} /></dt>
              <dd className="text-muted-foreground">{KINDS[k].meaning}</dd>
            </div>
          ))}
        </dl>
      </header>

      <Suspense>
        <TemplateGallery templates={templates} />
      </Suspense>
    </main>
  )
}
