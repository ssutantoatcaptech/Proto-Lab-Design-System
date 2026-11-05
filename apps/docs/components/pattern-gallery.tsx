"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SearchIcon, SearchXIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { PatternCard } from "@/components/pattern-card"
import { KINDS, SOURCES, TOPICS, type Pattern, type PatternKind, type PatternSource, type TopicId } from "@/lib/pattern-meta"
import { Button } from "@/registry/proto-lab/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/registry/proto-lab/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/registry/proto-lab/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/proto-lab/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/registry/proto-lab/ui/tabs"

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "a-z", label: "A to Z" },
  { value: "newest", label: "Newest" },
] as const
type Sort = (typeof SORTS)[number]["value"]
type Filters = { kind: PatternKind | "all"; topics: TopicId[]; source: PatternSource | "all"; q: string; sort: Sort }

const matches = (p: Pattern, f: Filters) => {
  if (f.kind !== "all" && p.kind !== f.kind) return false
  if (f.topics.length && !f.topics.includes(p.topic)) return false
  if (f.source !== "all" && p.source !== f.source) return false
  if (f.q) {
    const topic = TOPICS.find((t) => t.id === p.topic)?.label ?? ""
    const hay = `${p.title} ${p.slug} ${p.description} ${topic} ${KINDS[p.kind].label}`.toLowerCase()
    if (!f.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false
  }
  return true
}

// The library: tabs pick the kind, chips narrow by topic and source, search
// and sort do the rest. Everything is kept in the URL so a view can be
// shared and survives a refresh.
export function PatternGallery({ patterns }: { patterns: Pattern[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  // Search text is local so typing never waits on the URL; it syncs after a pause.
  const [q, setQ] = useState(params.get("q") ?? "")
  const urlQ = params.get("q") ?? ""
  useEffect(() => { setQ((cur) => (cur.trim() === urlQ ? cur : urlQ)) }, [urlQ])
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const f: Filters = {
    kind: (["screen", "section"].includes(params.get("kind") ?? "") ? params.get("kind") : "all") as Filters["kind"],
    topics: (params.get("topic") ?? "").split(",").filter((t): t is TopicId => TOPICS.some((x) => x.id === t)),
    source: (["proto-lab", "upstream"].includes(params.get("source") ?? "") ? params.get("source") : "all") as Filters["source"],
    q: q.trim(),
    sort: (SORTS.some((s) => s.value === params.get("sort")) ? params.get("sort") : "featured") as Sort,
  }

  const update = (patch: Partial<Filters>) => {
    const n = { ...f, ...patch }
    const next = new URLSearchParams()
    if (n.kind !== "all") next.set("kind", n.kind)
    if (n.topics.length) next.set("topic", n.topics.join(","))
    if (n.source !== "all") next.set("source", n.source)
    if (n.q.trim()) next.set("q", n.q.trim())
    if (n.sort !== "featured") next.set("sort", n.sort)
    const q = next.toString()
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
  }

  const results = useMemo(() => {
    const kept = patterns.filter((p) => matches(p, f))
    return kept.sort((a, b) =>
      f.sort === "a-z" ? a.title.localeCompare(b.title, undefined, { numeric: true })
        : f.sort === "newest" ? b.added.localeCompare(a.added) || a.rank - b.rank
          : a.rank - b.rank
    )
  }, [patterns, f.kind, f.topics.join(), f.source, f.q, f.sort]) // eslint-disable-line react-hooks/exhaustive-deps

  // Counts show what each choice would give, with the other filters applied.
  const count = (patch: Partial<Filters>) => patterns.filter((p) => matches(p, { ...f, ...patch })).length
  const active = f.kind !== "all" || f.topics.length > 0 || f.source !== "all" || f.q !== ""
  const clear = () => { setQ(""); update({ kind: "all", topics: [], source: "all", q: "" }) }
  const search = (v: string) => {
    setQ(v)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => update({ q: v }), 300)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="z-30 -mx-4 flex flex-col gap-3 border-b lg:sticky lg:top-14 bg-background/95 px-4 pb-4 pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:-mx-8 md:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <Tabs value={f.kind} onValueChange={(v) => update({ kind: v as Filters["kind"] })}>
            <TabsList variant="line" aria-label="Kind" className="h-10 gap-1">
              {(["all", "screen", "section"] as const).map((k) => (
                <TabsTrigger key={k} value={k} className="flex-none gap-2 px-2.5">
                  {k === "all" ? "All" : KINDS[k].plural}
                  <span className="rounded-full bg-muted px-1.5 text-caption-1 font-normal text-muted-foreground">
                    {count({ kind: k })}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <InputGroup className="sm:w-72">
              <InputGroupAddon><SearchIcon /></InputGroupAddon>
              <InputGroupInput
                value={q}
                onChange={(e) => search(e.target.value)}
                placeholder="Try: login, AI, settings"
                aria-label="Search patterns"
              />
              {q && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => { setQ(""); update({ q: "" }) }}><XIcon /></InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
            <div className="flex items-center gap-2">
              <span id="pattern-sort" className="text-caption-1 text-muted-foreground">Sort</span>
              <Select items={SORTS} value={f.sort} onValueChange={(v) => v && update({ sort: v as Sort })}>
                <SelectTrigger aria-labelledby="pattern-sort" className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label="Topic" className="flex flex-wrap items-center gap-1.5">
            {TOPICS.map((t) => {
              const on = f.topics.includes(t.id)
              const n = count({ topics: [t.id] })
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={on}
                  disabled={!n && !on}
                  onClick={() => update({ topics: on ? f.topics.filter((x) => x !== t.id) : [...f.topics, t.id] })}
                  className={cn(
                    "focus-ring flex h-7 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40",
                    on && "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {t.label}
                  <span className={cn("text-caption-1", on ? "text-primary-foreground/80" : "text-muted-foreground")}>{n}</span>
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-3">
            <div role="radiogroup" aria-label="Source" className="inline-flex rounded-lg bg-muted p-0.5">
              {(["all", "proto-lab", "upstream"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={f.source === s}
                  onClick={() => update({ source: s })}
                  className={cn(
                    "focus-ring flex h-7 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    f.source === s && "bg-card font-semibold text-foreground shadow-xs"
                  )}
                >
                  {s === "all" ? "All sources" : SOURCES[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p aria-live="polite" className="flex items-center gap-2 text-caption-1 text-muted-foreground">
          {results.length} {results.length === 1 ? "pattern" : "patterns"}
          {active && (
            <>
              <span aria-hidden="true">·</span>
              <button type="button" onClick={clear} className="focus-ring rounded-sm font-semibold text-link hover:underline">Clear filters</button>
            </>
          )}
        </p>
      </div>

      {results.length === 0 ? (
        <Empty className="border bg-card py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon"><SearchXIcon /></EmptyMedia>
            <EmptyTitle>No patterns match these filters</EmptyTitle>
            <EmptyDescription>
              {f.q ? `Nothing matches “${f.q}” with the filters you picked.` : "Try fewer topics or another kind."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent><Button variant="outline" onClick={clear}>Clear filters</Button></EmptyContent>
        </Empty>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {results.map((p) => (
            <li key={p.slug}><PatternCard pattern={p} className="h-full" /></li>
          ))}
        </ul>
      )}
    </div>
  )
}
