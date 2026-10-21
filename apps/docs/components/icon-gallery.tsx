"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckIcon, SearchIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/registry/proto-lab/ui/button"
import { Input } from "@/registry/proto-lab/ui/input"
import { categories, icons } from "@/registry/proto-lab/icons"
import type { IllustrationSize, IllustrationTone } from "@/registry/proto-lab/icons/illustration"

const SIZES: IllustrationSize[] = [32, 48, 64]
// Each tone previews on the background it is meant for.
const TONES: { value: IllustrationTone; label: string; tile: string }[] = [
  { value: "duotone", label: "Duotone", tile: "bg-card" },
  { value: "monotone", label: "Monotone", tile: "bg-white text-black" },
  { value: "greyscale", label: "Greyscale", tile: "bg-white text-black" },
  { value: "inverse", label: "Inverse", tile: "dark bg-background text-foreground" },
]
const words = (s: string) => s.replace(/-/g, " ")

export function IconGallery() {
  return (
    <Suspense fallback={<div className="not-prose my-6 h-96 rounded-lg border" />}>
      <Gallery />
    </Suspense>
  )
}

function Gallery() {
  const params = useSearchParams()
  // Local state drives the UI; the URL mirrors it so a filtered view can be
  // shared and survives refresh. Reading from the URL on every keystroke drops
  // characters, because the URL updates after the next key arrives.
  const [query, setQuery] = useState(() => params.get("q") ?? "")
  const [category, setCategory] = useState(() => params.get("category") ?? "all")
  const [size, setSize] = useState<IllustrationSize>(() => (Number(params.get("size")) || 48) as IllustrationSize)
  const [tone, setTone] = useState<IllustrationTone>(() => (TONES.find((t) => t.value === params.get("tone"))?.value ?? "duotone"))
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const set = (k: string, v: string | null) => (v ? p.set(k, v) : p.delete(k))
    set("q", query || null)
    set("category", category === "all" ? null : category)
    set("size", size === 48 ? null : String(size))
    set("tone", tone === "duotone" ? null : tone)
    const qs = p.toString()
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`)
  }, [query, category, size, tone])

  const update = (next: { q?: string | null; category?: string | null; size?: string | null }) => {
    if ("q" in next) setQuery(next.q ?? "")
    if ("category" in next) setCategory(next.category ?? "all")
    if ("size" in next) setSize((Number(next.size) || 48) as IllustrationSize)
  }

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    return icons.filter((i) => !q || words(i.slug).includes(q) || words(i.category).includes(q))
  }, [query])
  const shown = matches.filter((i) => category === "all" || i.category === category)
  const count = (slug: string) => matches.filter((i) => slug === "all" || i.category === slug).length

  const copy = async (name: string, cat: string) => {
    const use = tone === "duotone" ? "" : `\n\n<${name} tone="${tone}" />`
    await navigator.clipboard.writeText(`import { ${name} } from "@/components/captech-icons/${cat}"${use}`)
    setCopied(name)
    setTimeout(() => setCopied((c) => (c === name ? null : c)), 2000)
  }

  return (
    <div className="not-prose my-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => update({ q: e.target.value || null })}
            placeholder="Search 162 icons, e.g. rocket, health, data"
            aria-label="Search CapTech icons"
            className="pl-8 pr-8"
          />
          {query && (
            <Button variant="ghost" size="icon-xs" className="absolute right-1.5 top-1" onClick={() => update({ q: null })} aria-label="Clear search">
              <XIcon />
            </Button>
          )}
        </div>
        <div role="radiogroup" aria-label="Preview size" className="flex items-center gap-1">
          {SIZES.map((s) => (
            <Button key={s} size="sm" variant={size === s ? "secondary" : "ghost"} role="radio" aria-checked={size === s} onClick={() => update({ size: s === 48 ? null : String(s) })}>
              {s}px
            </Button>
          ))}
        </div>
      </div>

      <div role="radiogroup" aria-label="Color mode" className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-caption-1 text-muted-foreground">Tone</span>
        {TONES.map((t) => (
          <Button key={t.value} size="sm" variant={tone === t.value ? "secondary" : "ghost"} role="radio" aria-checked={tone === t.value} onClick={() => setTone(t.value)}>
            {t.label}
          </Button>
        ))}
      </div>

      <div role="radiogroup" aria-label="Category" className="flex flex-wrap gap-1.5">
        {[{ slug: "all", title: "All" }, ...categories].map((c) => (
          <Button
            key={c.slug}
            size="sm"
            variant={category === c.slug ? "default" : "outline"}
            role="radio"
            aria-checked={category === c.slug}
            onClick={() => update({ category: c.slug === "all" ? null : c.slug })}
          >
            {c.title} <span className="opacity-70">{count(c.slug)}</span>
          </Button>
        ))}
      </div>

      <p className="text-caption-1 text-muted-foreground" aria-live="polite">
        {shown.length === icons.length ? `${icons.length} icons. Click one to copy its import.` : `Showing ${shown.length} of ${icons.length}. Click one to copy its import.`}
      </p>

      {shown.length ? (
        <ul id="gallery" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map(({ slug, name, category: cat, Component }) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => copy(name, cat)}
                className={cn("focus-ring group flex h-full w-full flex-col items-center gap-3 rounded-lg border p-4 text-center transition-opacity hover:opacity-80", TONES.find((t) => t.value === tone)?.tile)}
                aria-label={`Copy import for ${words(slug)}`}
              >
                <span className="grid h-16 place-items-center"><Component size={size} tone={tone} /></span>
                <span className="flex items-center gap-1 text-caption-1">
                  {copied === name ? <><CheckIcon className="size-3" /> Copied</> : words(slug)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-10 text-center">
          <p className="font-semibold">No icons match &ldquo;{query}&rdquo;{category !== "all" && " in this category"}.</p>
          <p className="text-muted-foreground">Try a broader word like &ldquo;people&rdquo; or &ldquo;data&rdquo;, or search all categories.</p>
          <Button variant="outline" onClick={() => update({ q: null, category: null })}>Clear filters</Button>
        </div>
      )}
    </div>
  )
}
