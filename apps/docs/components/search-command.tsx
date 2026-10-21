"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FileTextIcon, HashIcon, SearchIcon } from "lucide-react"
import { Button } from "@/registry/proto-lab/ui/button"
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/registry/proto-lab/ui/command"
import type { SearchEntry } from "@/lib/source"

const SearchContext = createContext<{ open: () => void }>({ open: () => {} })

export function SearchProvider({ index, children }: { index: SearchEntry[]; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !isTyping(e.target))) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const go = useCallback((url: string) => {
    setOpen(false)
    router.push(url)
  }, [router])

  const sections = [...new Set(index.map((e) => e.section))]

  return (
    <SearchContext.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen} title="Search documentation" description="Find a page, component or token">
        <Command>
        <CommandInput placeholder="Search pages, components, headings…" />
        <CommandList>
          <CommandEmpty>
            <p>No matches.</p>
            <p className="text-caption-1 text-muted-foreground">Try a component name like &ldquo;dialog&rdquo; or a topic like &ldquo;dark mode&rdquo;.</p>
          </CommandEmpty>
          {sections.map((section) => (
            <CommandGroup key={section} heading={section}>
              {index.filter((e) => e.section === section).flatMap((page) => [
                <CommandItem key={page.url} value={`${page.title} ${page.description ?? ""}`} onSelect={() => go(page.url)}>
                  <FileTextIcon /> {page.title}
                </CommandItem>,
                ...page.headings.map((h) => (
                  <CommandItem key={h.url} value={`${page.title} ${h.title}`} onSelect={() => go(h.url)} className="pl-8">
                    <HashIcon /> <span className="truncate">{h.title}</span>
                    <span className="ml-auto text-caption-1 text-muted-foreground">{page.title}</span>
                  </CommandItem>
                )),
              ])}
            </CommandGroup>
          ))}
        </CommandList>
        </Command>
      </CommandDialog>
    </SearchContext.Provider>
  )
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))
}

export function SearchTrigger({ variant = "bar" }: { variant?: "bar" | "button" | "icon" }) {
  const { open } = useContext(SearchContext)
  if (variant === "icon") {
    return <Button variant="ghost" size="icon" onClick={open} aria-label="Search documentation"><SearchIcon /></Button>
  }
  if (variant === "button") {
    return <Button onClick={open}><SearchIcon /> Search the docs</Button>
  }
  return (
    <button
      type="button"
      onClick={open}
      className="focus-ring flex h-8 w-full items-center gap-2 rounded-md bg-muted px-3 text-left text-muted-foreground transition-colors hover:bg-accent md:w-56 lg:w-64"
    >
      <SearchIcon className="size-4" />
      <span className="flex-1 truncate">Search documentation…</span>
      <kbd className="hidden rounded-sm border bg-background px-1.5 font-sans text-caption-1 sm:inline">⌘K</kbd>
    </button>
  )
}
