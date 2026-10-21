import type { Metadata } from "next"
import Link from "next/link"
import { ShowcaseLayouts } from "@/components/showcase/layout-switch"
import { Workspace } from "@/components/showcase/workspace"
import { Settings } from "@/components/showcase/settings"

export const metadata: Metadata = {
  title: "Showcase",
  description: "Proto-Lab on realistic CapTech screens.",
}

export default function ShowcasePage() {
  return (
    <main id="content" className="mx-auto flex max-w-screen-2xl flex-col gap-8 px-4 py-10 md:px-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-title-1">Showcase</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Proto-Lab on realistic CapTech screens, built only from the{" "}
          <Link href="/docs/components" className="font-semibold text-link underline underline-offset-4">components</Link> in this system.
          Switch layouts, then switch the theme in the header to see both modes.
        </p>
      </header>
      <ShowcaseLayouts workspace={<Workspace />} settings={<Settings />} />
    </main>
  )
}
