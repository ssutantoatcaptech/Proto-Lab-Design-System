import { Suspense } from "react"
import type { Metadata } from "next"

import { PatternGallery } from "@/components/pattern-gallery"
import { allPatterns } from "@/lib/patterns"

export const metadata: Metadata = {
  title: "Patterns",
  description: "Screens and sections built from Proto-Lab components, ready to preview, copy and install.",
}

export default function PatternsPage() {
  return (
    <main id="content" className="mx-auto flex max-w-screen-2xl flex-col gap-6 px-4 py-10 md:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-title-1">Patterns</h1>
        <p className="max-w-[65ch] text-base leading-relaxed text-muted-foreground">
          Screens and sections built from Proto-Lab components. Filter by what you're building, open one to preview it at any width, read the code, and install it.
        </p>
      </header>
      <Suspense>
        <PatternGallery patterns={allPatterns()} />
      </Suspense>
    </main>
  )
}
