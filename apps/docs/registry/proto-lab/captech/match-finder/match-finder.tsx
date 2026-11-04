"use client"

import * as React from "react"
import { ChevronDownIcon, RotateCcwIcon, SearchIcon, SearchXIcon, SparklesIcon, TargetIcon } from "lucide-react"

import { Badge } from "@/registry/proto-lab/ui/badge"
import { Button } from "@/registry/proto-lab/ui/button"
import { Card } from "@/registry/proto-lab/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/registry/proto-lab/ui/collapsible"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/registry/proto-lab/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/registry/proto-lab/ui/input-group"
import { Progress, ProgressLabel } from "@/registry/proto-lab/ui/progress"
import { Spinner } from "@/registry/proto-lab/ui/spinner"
import { Tabs, TabsList, TabsTrigger } from "@/registry/proto-lab/ui/tabs"
import { cn } from "cn"

// Pick a subject, run a match, read ranked matches with the reasons behind
// each score. Works in more than one direction (modes): for example "I have a
// company" finds buyers, "I have a sponsor" finds targets. Harvested from the
// Huntington Capital Markets POC (Sponsor Match). The block never calls AI
// itself: `onRun` returns the result, so a demo can resolve sample data and
// an app can call a model.

export type MatchSubject = { id: string; name: string; meta: string; tag?: string }

export type MatchDimension = { id: string; label: string }

export type Match = {
  id: string
  name: string
  subtitle?: string
  /** 0 to 10. */
  score: number
  /** One line: why this match, now. */
  why?: string
  pitch?: string
  economics?: { label: string; value: string }[]
  /** Keyed by dimension id. Scores are 0 to 10. */
  dimensions: Record<string, { score: number; reason?: string }>
  sources?: string[]
}

export type MatchResult = {
  title: string
  meta: string
  signals?: string[]
  matches: Match[]
}

export type MatchMode = {
  id: string
  label: string
  listLabel: string
  searchPlaceholder: string
  runLabel: string
  emptyText: string
  subjects: MatchSubject[]
  /** Shown one after another while a match runs. */
  steps?: string[]
}

export type MatchAction = "introduce" | "briefing" | "ask"

type Run = { status: "idle" } | { status: "loading"; subject: MatchSubject } | { status: "done"; subject: MatchSubject; result: MatchResult } | { status: "error"; subject: MatchSubject; message: string }

export function MatchFinder({
  modes,
  dimensions,
  onRun,
  onAction,
  title = "Match finder",
  description,
  className,
}: {
  modes: MatchMode[]
  dimensions: MatchDimension[]
  onRun: (modeId: string, subject: MatchSubject) => Promise<MatchResult>
  onAction?: (action: MatchAction, match: Match, subject: MatchSubject) => void
  title?: string
  description?: string
  className?: string
}) {
  const [modeId, setModeId] = React.useState(modes[0]?.id ?? "")
  const mode = modes.find((m) => m.id === modeId) ?? modes[0]
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<Record<string, string>>({})
  const [runs, setRuns] = React.useState<Record<string, Run>>({})
  const run = runs[mode.id] ?? { status: "idle" }
  const subjectId = selected[mode.id]
  const subject = mode.subjects.find((s) => s.id === subjectId)

  const shown = mode.subjects.filter((s) => `${s.name} ${s.meta} ${s.tag ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()))

  const start = async () => {
    if (!subject) return
    const id = mode.id
    setRuns((r) => ({ ...r, [id]: { status: "loading", subject } }))
    try {
      const result = await onRun(id, subject)
      setRuns((r) => ({ ...r, [id]: { status: "done", subject, result } }))
    } catch (e) {
      setRuns((r) => ({ ...r, [id]: { status: "error", subject, message: e instanceof Error ? e.message : "Something went wrong." } }))
    }
  }

  return (
    <Card className={cn("gap-0 py-0", className)}>
      <header className="flex flex-col gap-4 border-b p-4 md:flex-row md:items-end md:justify-between md:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-title-3">{title}</h2>
          {description && <p className="max-w-xl text-muted-foreground">{description}</p>}
        </div>
        {modes.length > 1 && (
          <Tabs value={mode.id} onValueChange={(v) => { setModeId(String(v)); setQuery("") }}>
            <TabsList>
              {modes.map((m) => <TabsTrigger key={m.id} value={m.id}>{m.label}</TabsTrigger>)}
            </TabsList>
          </Tabs>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
        {/* Picker rail: search, list, run. */}
        <div className="flex flex-col border-b lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-2 p-4">
            <span id={`${mode.id}-list`} className="text-caption-1-strong text-muted-foreground">{mode.listLabel}</span>
            <InputGroup>
              <InputGroupAddon><SearchIcon /></InputGroupAddon>
              <InputGroupInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={mode.searchPlaceholder} aria-label={mode.searchPlaceholder} />
            </InputGroup>
          </div>
          <ul aria-labelledby={`${mode.id}-list`} className="flex max-h-80 flex-col gap-1 overflow-y-auto px-2 lg:max-h-[28rem]">
            {shown.map((s) => {
              const active = s.id === subjectId
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelected((p) => ({ ...p, [mode.id]: s.id }))}
                    className={cn(
                      "focus-ring flex w-full flex-col gap-0.5 rounded-md border border-transparent px-3 py-2 text-left transition-colors hover:bg-muted",
                      active && "border-primary bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <span className="text-sm font-semibold">{s.name}</span>
                    <span className="text-caption-1 text-muted-foreground">{s.meta}</span>
                    {s.tag && <span className="text-caption-1 text-muted-foreground">{s.tag}</span>}
                  </button>
                </li>
              )
            })}
            {shown.length === 0 && (
              <li className="px-3 py-6 text-center text-caption-1 text-muted-foreground">
                Nothing matches “{query}”.{" "}
                <button type="button" className="focus-ring rounded-sm font-semibold text-link hover:underline" onClick={() => setQuery("")}>Clear search</button>
              </li>
            )}
          </ul>
          <div className="border-t p-4">
            <Button className="w-full" disabled={!subject || run.status === "loading"} onClick={start}>
              {run.status === "loading" ? <Spinner data-icon="inline-start" /> : <TargetIcon data-icon="inline-start" />}
              {mode.runLabel}
            </Button>
            {!subject && <p className="mt-2 text-center text-caption-1 text-muted-foreground">Pick one from the list first.</p>}
          </div>
        </div>

        {/* Result pane. */}
        <div className="min-w-0 bg-muted/40 p-4 md:p-6" aria-live="polite">
          {run.status === "idle" && (
            <Empty className="h-full border bg-card">
              <EmptyHeader>
                <EmptyMedia variant="icon"><TargetIcon /></EmptyMedia>
                <EmptyTitle>No match yet</EmptyTitle>
                <EmptyDescription>{mode.emptyText}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          {run.status === "loading" && <Loading steps={mode.steps} subject={run.subject} />}
          {run.status === "error" && (
            <Empty className="h-full border bg-card">
              <EmptyHeader>
                <EmptyMedia variant="icon"><SearchXIcon /></EmptyMedia>
                <EmptyTitle>The match didn't finish</EmptyTitle>
                <EmptyDescription>{run.message}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={start}><RotateCcwIcon data-icon="inline-start" />Try again</Button>
              </EmptyContent>
            </Empty>
          )}
          {run.status === "done" && (
            <Results result={run.result} subject={run.subject} dimensions={dimensions} onAction={onAction} />
          )}
        </div>
      </div>
    </Card>
  )
}

function Loading({ steps = [], subject }: { steps?: string[]; subject: MatchSubject }) {
  const [step, setStep] = React.useState(0)
  const [seconds, setSeconds] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => s + 1)
      setStep((i) => Math.min(i + 1, Math.max(steps.length - 1, 0)))
    }, 1000)
    return () => clearInterval(t)
  }, [steps.length])
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
        <Spinner />
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-semibold">{steps[step] ?? "Matching"} for {subject.name}</span>
          <span className="text-caption-1 text-muted-foreground">{seconds}s</span>
        </div>
      </div>
      {[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg border bg-card" />)}
    </div>
  )
}

function Results({ result, subject, dimensions, onAction }: {
  result: MatchResult
  subject: MatchSubject
  dimensions: MatchDimension[]
  onAction?: (action: MatchAction, match: Match, subject: MatchSubject) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
        <span className="text-caption-1-strong text-muted-foreground">Matches for</span>
        <h3 className="text-subtitle-1">{result.title}</h3>
        <p className="text-caption-1 text-muted-foreground">{result.meta}</p>
        {result.signals && result.signals.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {result.signals.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
          </div>
        )}
      </div>

      {result.matches.length === 0 ? (
        <Empty className="border bg-card">
          <EmptyHeader>
            <EmptyTitle>No strong matches</EmptyTitle>
            <EmptyDescription>Nothing scored high enough to recommend. Try another one from the list.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ol className="flex flex-col gap-3">
          {result.matches.map((m, i) => (
            <li key={m.id}>
              <MatchCard match={m} rank={i + 1} defaultOpen={i === 0} subject={subject} dimensions={dimensions} onAction={onAction} />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function MatchCard({ match: m, rank, defaultOpen, subject, dimensions, onAction }: {
  match: Match
  rank: number
  defaultOpen: boolean
  subject: MatchSubject
  dimensions: MatchDimension[]
  onAction?: (action: MatchAction, match: Match, subject: MatchSubject) => void
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border bg-card">
      <CollapsibleTrigger className="focus-ring group/match flex w-full items-center gap-4 rounded-lg p-4 text-left">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-caption-1-strong">{rank}</span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold">{m.name}</span>
          {m.subtitle && <span className="truncate text-caption-1 text-muted-foreground">{m.subtitle}</span>}
        </span>
        <span className="flex shrink-0 items-baseline gap-0.5">
          <span className="text-title-3">{m.score.toFixed(1)}</span>
          <span className="text-caption-1 text-muted-foreground">/10</span>
        </span>
        <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]/match:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-150 data-[ending-style]:h-0 data-[starting-style]:h-0">
        <div className="flex flex-col gap-5 border-t p-4">
          {(m.why || m.pitch) && (
            <section className="flex flex-col gap-2">
              <h4 className="text-caption-1-strong text-muted-foreground">Why now</h4>
              {m.why && <p>{m.why}</p>}
              {m.pitch && (
                <p className="rounded-md border-l-2 border-primary bg-muted px-3 py-2 text-sm">
                  <span className="font-semibold">Pitch: </span>{m.pitch}
                </p>
              )}
            </section>
          )}

          {m.economics && m.economics.length > 0 && (
            <section className="flex flex-col gap-2">
              <h4 className="text-caption-1-strong text-muted-foreground">Deal economics</h4>
              <dl className="grid grid-cols-3 gap-2">
                {m.economics.map((e) => (
                  <div key={e.label} className="flex flex-col rounded-md bg-muted px-3 py-2">
                    <dt className="text-caption-1 text-muted-foreground">{e.label}</dt>
                    <dd className="text-sm font-semibold">{e.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <h4 className="text-caption-1-strong text-muted-foreground">Score breakdown</h4>
            <ul className="flex flex-col gap-3">
              {dimensions.map((d) => {
                const v = m.dimensions[d.id]
                if (!v) return null
                return (
                  <li key={d.id} className="flex flex-col gap-1">
                    <Progress value={v.score} max={10} className="gap-1.5">
                      <ProgressLabel className="text-sm">{d.label}</ProgressLabel>
                      <span className="ml-auto text-caption-1-strong">{v.score}/10</span>
                    </Progress>
                    {v.reason && <span className="text-caption-1 text-muted-foreground">{v.reason}</span>}
                  </li>
                )
              })}
            </ul>
            {m.sources && m.sources.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-caption-1 text-muted-foreground">Sources</span>
                {m.sources.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
              </div>
            )}
          </section>

          {onAction && (
            <div className="flex flex-wrap gap-2 border-t pt-4">
              <Button size="sm" onClick={() => onAction("introduce", m, subject)}>Draft introduction</Button>
              <Button size="sm" variant="outline" onClick={() => onAction("briefing", m, subject)}>Add to briefing</Button>
              <Button size="sm" variant="outline" onClick={() => onAction("ask", m, subject)}>
                <SparklesIcon data-icon="inline-start" />
                Ask AI
              </Button>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
