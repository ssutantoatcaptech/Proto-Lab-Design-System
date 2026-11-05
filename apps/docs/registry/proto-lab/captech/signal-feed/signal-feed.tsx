"use client"

import * as React from "react"
import { ArrowRightIcon, FileTextIcon, InfoIcon, SearchXIcon, SparklesIcon } from "lucide-react"

import { Badge } from "@/registry/proto-lab/ui/badge"
import { Button } from "@/registry/proto-lab/ui/button"
import { Card } from "@/registry/proto-lab/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/registry/proto-lab/ui/empty"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/proto-lab/ui/select"
import { cn } from "cn"

// A ranked feed of signals: things that need someone's attention, each from a
// named source, with an optional value and confidence. Harvested from the
// Huntington Capital Markets POC; the names are neutral so any domain can use it
// (deal signals, renewal risks, claims alerts).

export type SignalPriority = "urgent" | "high" | "watch"

export type Signal = {
  id: string
  priority: SignalPriority
  /** Who the signal is about: a firm, account or customer. */
  entity: string
  /** Where it came from: CRM, a filing, a news feed. */
  source: string
  /** What kind of signal it is, used for filtering and grouping. */
  type: string
  title: string
  detail: string
  /** ISO date, used for sorting and shown on the card. */
  date: string
  value?: { amount: string; label: string }
  /** 0 to 1. */
  confidence?: number
}

export type SignalAction = "details" | "briefing" | "ask"

const PRIORITY: Record<SignalPriority, { label: string; rank: number; variant: "destructive" | "default" | "secondary" }> = {
  urgent: { label: "Urgent", rank: 0, variant: "destructive" },
  high: { label: "High", rank: 1, variant: "default" },
  watch: { label: "Watch", rank: 2, variant: "secondary" },
}

const SORTS = [
  { value: "priority", label: "Most urgent" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
] as const

const GROUPS = [
  { value: "none", label: "No grouping" },
  { value: "entity", label: "By firm" },
  { value: "type", label: "By signal type" },
  { value: "source", label: "By source" },
  { value: "priority", label: "By priority" },
] as const

type Sort = (typeof SORTS)[number]["value"]
type Group = (typeof GROUPS)[number]["value"]

// Three densities scale the whole feed together: spacing between parts
// (vertical and horizontal), padding, control size and every text size.
// Comfortable for reading, Dense (the default) for daily use, Compact to
// scan many signals at once.
export type SignalDensity = "comfortable" | "dense" | "compact"

type DensitySpec = {
  label: string
  section: string     // gap between header, note, toolbar and list
  heading: string     // feed title
  banner: string      // the note: padding, gap, text
  toolbar: string     // toolbar padding and gaps
  control: "default" | "sm"
  groups: string      // gap between groups
  groupTitle: string
  list: string        // gap between cards
  card: string        // card padding
  cardSize: "default" | "sm"
  eyebrow: string     // priority, firm, source row: gaps and text
  body: string        // gap between the text and the amount
  stack: string       // gap between title and detail
  title: string
  detail: string
  amount: string
  meta: string        // "est. fee · 84% confidence"
  actions: string     // gap between buttons
  button: "default" | "sm" | "xs"
}

const DENSITY: Record<SignalDensity, DensitySpec> = {
  comfortable: {
    label: "Comfortable", section: "gap-6", heading: "text-title-2", banner: "gap-3 px-4 py-3 text-base",
    toolbar: "gap-4 p-4", control: "default", groups: "gap-8", groupTitle: "text-subtitle-1", list: "gap-4",
    card: "px-6 [--card-spacing:--spacing(5)]", cardSize: "default", eyebrow: "gap-x-3 gap-y-1.5 text-sm",
    body: "gap-4 sm:gap-8", stack: "gap-1.5", title: "text-subtitle-1", detail: "text-base", amount: "text-title-2",
    meta: "text-sm", actions: "gap-2", button: "default",
  },
  dense: {
    label: "Dense", section: "gap-4", heading: "text-title-3", banner: "gap-2 px-3 py-2 text-sm",
    toolbar: "gap-3 p-3", control: "default", groups: "gap-6", groupTitle: "text-subtitle-2", list: "gap-3",
    card: "px-4", cardSize: "default", eyebrow: "gap-x-2 gap-y-1 text-caption-1",
    body: "gap-3 sm:gap-6", stack: "gap-1", title: "text-subtitle-2", detail: "text-sm", amount: "text-title-3",
    meta: "text-caption-1", actions: "gap-2", button: "sm",
  },
  compact: {
    label: "Compact", section: "gap-3", heading: "text-subtitle-1", banner: "gap-2 px-2.5 py-1.5 text-caption-1",
    toolbar: "gap-2 p-2", control: "sm", groups: "gap-4", groupTitle: "text-sm font-semibold", list: "gap-2",
    card: "px-3", cardSize: "sm", eyebrow: "gap-x-1.5 gap-y-0.5 text-caption-1",
    body: "gap-2 sm:gap-4", stack: "gap-0.5", title: "text-sm font-semibold", detail: "truncate text-caption-1", amount: "text-subtitle-2",
    meta: "text-caption-1", actions: "gap-1.5", button: "xs",
  },
}

const DENSITIES = (Object.keys(DENSITY) as SignalDensity[]).map((k) => ({ value: k, label: DENSITY[k].label }))

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

export function SignalFeed({
  signals,
  title = "Signals",
  description = "What needs your attention now: deadlines, new opportunities and high priority items.",
  pageSize = 5,
  viewAll,
  onAction,
  density: densityProp,
  defaultDensity = "dense",
  onDensityChange,
  showDensity = true,
  className,
}: {
  signals: Signal[]
  title?: string
  description?: string
  pageSize?: number
  viewAll?: { label: string; href: string }
  onAction?: (action: SignalAction, signal: Signal) => void
  /** Controlled density. Leave unset to let the toolbar manage it. */
  density?: SignalDensity
  defaultDensity?: SignalDensity
  onDensityChange?: (density: SignalDensity) => void
  /** Show the density switch in the toolbar. */
  showDensity?: boolean
  className?: string
}) {
  const [ownDensity, setOwnDensity] = React.useState<SignalDensity>(defaultDensity)
  const density = densityProp ?? ownDensity
  const setDensity = (d: SignalDensity) => { setOwnDensity(d); onDensityChange?.(d) }
  const d = DENSITY[density]
  const [filter, setFilter] = React.useState("all")
  const [sort, setSort] = React.useState<Sort>("priority")
  const [group, setGroup] = React.useState<Group>("none")
  const [shown, setShown] = React.useState(pageSize)

  const types = React.useMemo(() => [...new Set(signals.map((s) => s.type))].sort(), [signals])
  const filters = React.useMemo(
    () => [
      { value: "all", label: "All signals" },
      { value: "urgent", label: "Urgent only" },
      { value: "high", label: "High and urgent" },
      ...types.map((t) => ({ value: `type:${t}`, label: t })),
    ],
    [types]
  )

  const ordered = React.useMemo(() => {
    const kept = signals.filter((s) => {
      if (filter === "urgent") return s.priority === "urgent"
      if (filter === "high") return s.priority !== "watch"
      if (filter.startsWith("type:")) return s.type === filter.slice(5)
      return true
    })
    const time = (s: Signal) => Date.parse(s.date)
    return kept.sort((a, b) =>
      sort === "newest" ? time(b) - time(a)
        : sort === "oldest" ? time(a) - time(b)
          : PRIORITY[a.priority].rank - PRIORITY[b.priority].rank || time(b) - time(a)
    )
  }, [signals, filter, sort])

  // Any change to the view starts the list from the top again.
  React.useEffect(() => setShown(pageSize), [filter, sort, group, pageSize])

  const visible = ordered.slice(0, shown)
  const remaining = ordered.length - visible.length
  const groups = group === "none" ? [{ key: "", items: visible }] : groupBy(visible, group)
  const counts = group === "none" ? null : countBy(ordered, group)

  return (
    <section aria-labelledby="signal-feed-title" data-density={density} className={cn("flex flex-col", d.section, className)}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 id="signal-feed-title" className={d.heading}>{title}</h2>
          <Badge variant="secondary">{signals.length}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {showDensity && (
            <Picker label="Density" value={density} onChange={(v) => setDensity(v as SignalDensity)} options={DENSITIES} size={d.control} className="w-36" />
          )}
          {viewAll && (
            <Button variant="link" className="px-0" nativeButton={false} render={<a href={viewAll.href} />}>
              {viewAll.label}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          )}
        </div>
      </header>

      <p className={cn("flex items-start rounded-lg border border-brand-stroke-2 bg-brand-background-inverted", d.banner)}>
        <InfoIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-foreground-1" />
        {description}
      </p>

      <div className={cn("flex flex-col rounded-lg border bg-card sm:flex-row sm:flex-wrap sm:items-center sm:justify-between", d.toolbar)}>
        <Picker label="Filter" value={filter} onChange={setFilter} options={filters} size={d.control} className="sm:w-56" />
        <div className={cn("flex flex-col sm:flex-row sm:flex-wrap sm:items-center", d.toolbar.split(" ")[0])}>
          <Picker label="Sort" value={sort} onChange={(v) => setSort(v as Sort)} options={SORTS} size={d.control} className="sm:w-40" />
          <Picker label="Group" value={group} onChange={(v) => setGroup(v as Group)} options={GROUPS} size={d.control} className="sm:w-40" />
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        Showing {visible.length} of {ordered.length} signals
      </p>

      {ordered.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon"><SearchXIcon /></EmptyMedia>
            <EmptyTitle>No signals match this filter</EmptyTitle>
            <EmptyDescription>Try a broader filter. New signals arrive as sources update.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={() => setFilter("all")}>Show all signals</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className={cn("flex flex-col", d.groups)}>
          {groups.map((g) => (
            <div key={g.key || "all"} className={cn("flex flex-col", d.list)}>
              {g.key && (
                <h3 className={cn("flex items-center gap-2", d.groupTitle)}>
                  {g.key}
                  <Badge variant="outline">{counts?.get(g.key) ?? g.items.length}</Badge>
                </h3>
              )}
              <ul className={cn("flex flex-col", d.list)}>
                {g.items.map((s) => (
                  <li key={s.id}>
                    <SignalCard signal={s} density={density} onAction={onAction} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {remaining > 0 && (
            <Button variant="outline" size={d.control} className="self-center" onClick={() => setShown((n) => n + pageSize)}>
              Show {Math.min(remaining, pageSize)} more
              <span className="text-muted-foreground">({remaining} left)</span>
            </Button>
          )}
        </div>
      )}
    </section>
  )
}

export function SignalCard({ signal: s, density = "dense", onAction }: {
  signal: Signal
  density?: SignalDensity
  onAction?: (action: SignalAction, signal: Signal) => void
}) {
  const p = PRIORITY[s.priority]
  const d = DENSITY[density]
  return (
    <Card size={d.cardSize} className={cn(d.card, s.priority === "urgent" && "ring-destructive/40")}>
      <div className={cn("flex flex-wrap items-center", d.eyebrow)}>
        <Badge variant={p.variant}>{p.label}</Badge>
        <span className="font-semibold text-foreground">{s.entity}</span>
        <Badge variant="outline">{s.source}</Badge>
        <span className="text-muted-foreground">{s.type}</span>
        <time dateTime={s.date} className="ml-auto text-muted-foreground">{dateFormat.format(new Date(s.date))}</time>
      </div>

      <div className={cn("flex flex-col sm:flex-row sm:items-start sm:justify-between", d.body)}>
        <div className={cn("flex min-w-0 flex-col", d.stack)}>
          <h4 className={d.title}>{s.title}</h4>
          <p className={cn("text-muted-foreground", d.detail)}>{s.detail}</p>
        </div>
        {s.value && (
          <div className="flex shrink-0 flex-col sm:items-end">
            <span className={d.amount}>{s.value.amount}</span>
            <span className={cn("text-muted-foreground", d.meta)}>
              {s.value.label}
              {s.confidence != null && ` · ${Math.round(s.confidence * 100)}% confidence`}
            </span>
          </div>
        )}
      </div>

      {onAction && (
        <div className={cn("flex flex-wrap", d.actions)}>
          <Button variant="outline" size={d.button} onClick={() => onAction("details", s)}>
            View details
          </Button>
          <Button variant="outline" size={d.button} onClick={() => onAction("briefing", s)}>
            <FileTextIcon data-icon="inline-start" />
            Generate briefing
          </Button>
          <Button variant="outline" size={d.button} onClick={() => onAction("ask", s)}>
            <SparklesIcon data-icon="inline-start" />
            Ask AI
          </Button>
        </div>
      )}
    </Card>
  )
}

function Picker({ label, value, onChange, options, size = "default", className }: {
  label: string
  size?: "default" | "sm"
  value: string
  onChange: (value: string) => void
  options: readonly { value: string; label: string }[]
  className?: string
}) {
  const id = React.useId()
  return (
    <div className="flex items-center gap-2">
      <span id={id} className="text-caption-1 text-muted-foreground">{label}</span>
      <Select items={options} value={value} onValueChange={(v) => v != null && onChange(String(v))}>
        <SelectTrigger size={size} aria-labelledby={id} className={cn("w-full", className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function keyOf(s: Signal, group: Exclude<Group, "none">) {
  return group === "priority" ? PRIORITY[s.priority].label : s[group]
}

function groupBy(items: Signal[], group: Group) {
  const map = new Map<string, Signal[]>()
  for (const s of items) {
    const k = keyOf(s, group as Exclude<Group, "none">)
    map.set(k, [...(map.get(k) ?? []), s])
  }
  return [...map].map(([key, items]) => ({ key, items }))
}

function countBy(items: Signal[], group: Group) {
  const map = new Map<string, number>()
  for (const s of items) {
    const k = keyOf(s, group as Exclude<Group, "none">)
    map.set(k, (map.get(k) ?? 0) + 1)
  }
  return map
}
