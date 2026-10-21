import { DocsNav } from "@/components/docs-nav"
import { source } from "@/lib/source"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-screen-2xl px-4 md:px-6">
      <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r py-8 pr-4 md:block lg:w-60">
        <DocsNav tree={source.getPageTree()} />
      </aside>
      {children}
    </div>
  )
}
