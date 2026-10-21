import Link from "next/link"
import { Button } from "@/registry/proto-lab/ui/button"
import { SearchTrigger } from "@/components/search-command"
import { SiteShell } from "@/components/site-header"
import { searchIndex, source } from "@/lib/source"

export default function NotFound() {
  return (
    <SiteShell tree={source.getPageTree()} search={searchIndex()}>
    <main id="content" className="mx-auto flex max-w-lg flex-col items-start gap-4 px-6 py-24">
      <p className="text-caption-1 text-muted-foreground">404</p>
      <h1 className="text-title-1">This page doesn&apos;t exist</h1>
      <p className="text-base text-muted-foreground">
        It may have moved when the docs were reorganized. Search for what you need, or start from the introduction.
      </p>
      <div className="flex gap-2">
        <SearchTrigger variant="button" />
        <Button variant="outline" nativeButton={false} render={<Link href="/docs" />}>Go to introduction</Button>
      </div>
    </main>
    </SiteShell>
  )
}
