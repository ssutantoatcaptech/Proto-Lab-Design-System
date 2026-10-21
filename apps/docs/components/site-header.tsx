"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon } from "lucide-react"
import type * as PageTree from "fumadocs-core/page-tree"
import { cn } from "cn"
import { Button } from "@/registry/proto-lab/ui/button"
import { Separator } from "@/registry/proto-lab/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/registry/proto-lab/ui/sheet"
import { DocsNav } from "@/components/docs-nav"
import { SearchProvider, SearchTrigger } from "@/components/search-command"
import { ThemeToggle } from "@/components/theme-toggle"
import { site } from "@/lib/site"
import type { SearchEntry } from "@/lib/source"

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}

function Logo() {
  return (
    <Link href="/docs" className="focus-ring flex items-center gap-2 rounded-md">
      <span aria-hidden="true" className="grid size-6 place-items-center rounded-md bg-primary text-caption-1 font-bold text-primary-foreground">P</span>
      <span className="font-semibold">{site.name}</span>
    </Link>
  )
}

// Header plus the search provider around the whole page, so any search
// trigger on the page (like the 404's) opens the palette.
export function SiteShell({ tree, search, children }: { tree: PageTree.Root; search: SearchEntry[]; children: React.ReactNode }) {
  return (
    <SearchProvider index={search}>
      <SiteHeader tree={tree} />
      {children}
    </SearchProvider>
  )
}

function SiteHeader({ tree }: { tree: PageTree.Root }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-14 items-center gap-2 px-4 md:gap-4 md:px-6">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />}>
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto p-4">
              <SheetHeader className="p-0 pb-4"><SheetTitle><Logo /></SheetTitle></SheetHeader>
              <DocsNav tree={tree} onNavigate={() => setMenuOpen(false)} />
            </SheetContent>
          </Sheet>

          <Logo />

          <nav aria-label="Main" className="ml-2 hidden items-center gap-1 md:flex">
            {site.nav.map((item) => {
              const active = item.match(pathname)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-ring rounded-md px-2 py-1 text-muted-foreground transition-colors hover:text-foreground",
                    active && "font-semibold text-foreground"
                  )}
                >
                  {item.title}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1 md:gap-2">
            <div className="hidden sm:block"><SearchTrigger /></div>
            <div className="sm:hidden"><SearchTrigger variant="icon" /></div>
            <Separator orientation="vertical" className="mx-1 hidden h-4 sm:block" />
            <Button variant="ghost" size="icon" nativeButton={false} render={<a href={site.github} target="_blank" rel="noreferrer" aria-label="GitHub repository" />}>
              <GitHubIcon className="size-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  )
}
