import { SiteShell } from "@/components/site-header"
import { searchIndex, source } from "@/lib/source"

// Everything with the site header: docs and the full width galleries. The
// bare /view route sits outside this group so blocks render at page size.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:shadow-md">
        Skip to content
      </a>
      <SiteShell tree={source.getPageTree()} search={searchIndex()}>{children}</SiteShell>
    </>
  )
}
