import { DocsNav } from "@/components/docs-nav"
import { source } from "@/lib/source"

// App layout: white sidebar on the grey canvas. Each content section is its
// own card (see the page and mdx-components "section").
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r bg-card px-4 py-6 md:block">
        <DocsNav tree={source.getPageTree()} />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
