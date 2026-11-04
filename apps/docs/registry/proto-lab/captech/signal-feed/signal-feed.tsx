"use client"

import * as React from "react"
import { ArrowRightIcon, FileTextIcon, InfoIcon, Rows2Icon, Rows3Icon, Rows4Icon, SearchXIcon, SparklesIcon } from "lucide-react"

import { Badge } from "@/registry/proto-lab/ui/badge"
import { Button } from "@/registry/proto-lab/ui/button"
import { Card } from "@/registry/proto-lab/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/registry/proto-lab/ui/empty"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/proto-lab/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/registry/proto-lab/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/proto-lab/ui/tooltip"
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

// Three densities scale the cards together: padding, gaps, type and buttons.
// Comfortable for reading, Dense (the default) for daily use, Compact to scan
// many signals at once.
export type SignalDensity = "comfortable" | "dense" | "compact"

const DENSITY: Record<SignalDensity, {
  label: string
  icon: React.ComponentType
  list: string
  card: string
  cardSize: "default" | "sm"
  title: string
  detail: string
  amount: string
  button: "default" | "sm" | "xs"
}> = {
  comfortable: { label: "Comfortable", icon: Rows2Icon, list: "gap-4", card: "px-6 [--card-spacing:--spacing(5)]", cardSize: "default", title: "text-subtitle-1", detail: "text-base", amount: "text-title-2", button: "default" },
  dense: { label: "Dense", icon: Rows3Icon, list: "gap-3", card: "px-4", cardSize: "default", title: "text-subtitle-2", detail: "text-sm", amount: "text-title-3", button: "sm" },
  compact: { label: "Compact", icon: Rows4Icon, list: "gap-2", card: "px-3", cardSize: "sm", title: "text-sm font-semibold", detail: "truncate text-caption-1", amount: "text-subtitle-2", button: "xs" },
}

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
    <section aria-labelledby="signal-feed-title" className={cn("flex flex-col gap-4", className)}>
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 id="signal-feed-title" className="text-title-3">{title}</h2>
          <Badge variant="secondary">{signals.length}</Badge>
        </div>
        {viewAll && (
          <Button variant="link" className="px-0" nativeButton={false} render={<a href={viewAll.href} />}>
            {viewAll.label}
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        )}
      </header>

      <p className="flex items-start gap-2 rounded-lg border border-brand-stroke-2 bg-brand-background-inverted px-3 py-2 text-sm">
        <InfoIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-foreground-1" />
        {description}
      </p>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <Picker label="Filter" value={filter} onChange={setFilter} options={filters} className="sm:w-56" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Picker label="Sort" value={sort} onChange={(v) => setSort(v as Sort)} options={SORTS} className="sm:w-40" />
          <Picker label="Group" value={group} onChange={(v) => setGroup(v as Group)} options={GROUPS} className="sm:w-40" />
          {showDensity && (
            <ToggleGroup
              variant="outline"
              spacing={0}
              value={[density]}
              onValueChange={(v) => v[0] && setDensity(v[0] as SignalDensity)}
              aria-label="Density"
              className="self-start sm:self-auto"
            >
              {(Object.keys(DENSITY) as SignalDensity[]).map((k) => {
                const Icon = DENSITY[k].icon
                return (
                  <Tooltip key={k}>
                    <TooltipTrigger render={<ToggleGroupItem value={k} aria-label={DENSITY[k].label} />}>
                      <Icon />
                    </TooltipTrigger>
                    <TooltipContent>{DENSITY[k].label}</TooltipContent>
                  </Tooltip>
                )
              })}
            </ToggleGroup>
          )}
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
        <div className={cn("flex flex-col", density === "compact" ? "gap-4" : "gap-6")}>
          {groups.map((g) => (
            <div key={g.key || "all"} className={cn("flex flex-col", d.list)}>
              {g.key && (
                <h3 className="flex items-center gap-2 text-subtitle-2">
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
            <Button variant="outline" className="self-center" onClick={() => setShown((n) => n + pageSize)}>
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
  const compact = density === "compact"
  return (
    <Card size={d.cardSize} className={cn(d.card, s.priority === "urgent" && "ring-destructive/40")}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption-1">
        <Badge variant={p.variant}>{p.label}</Badge>
        <span className="font-semibold text-foreground">{s.entity}</span>
        <Badge variant="outline">{s.source}</Badge>
        <span className="text-muted-foreground">{s.type}</span>
        <time dateTime={s.date} className="ml-auto text-muted-foreground">{dateFormat.format(new Date(s.date))}</time>
      </div>

      <div className={cn("flex flex-col sm:flex-row sm:items-start sm:justify-between", compact ? "gap-2 sm:gap-4" : "gap-3 sm:gap-6")}>
        <div className={cn("flex min-w-0 flex-col", compact ? "gap-0.5" : "gap-1")}>
          <h4 className={d.title}>{s.title}</h4>
          <p className={cn("text-muted-foreground", d.detail)}>{s.detail}</p>
        </div>
        {s.value && (
          <div className="flex shrink-0 flex-col sm:items-end">
            <span className={d.amount}>{s.value.amount}</span>
            <span className="text-caption-1 text-muted-foreground">
              {s.value.label}
              {s.confidence != null && ` · ${Math.round(s.confidence * 100)}% confidence`}
            </span>
          </div>
        )}
      </div>

      {onAction && (
        <div className={cn("flex flex-wrap", compact ? "gap-1.5" : "gap-2")}>
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

function Picker({ label, value, onChange, options, className }: {
  label: string
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
        <SelectTrigger aria-labelledby={id} className={cn("w-full", className)}>
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
