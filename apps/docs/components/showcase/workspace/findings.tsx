"use client"

import * as React from "react"
import { CheckIcon, RotateCcwIcon } from "lucide-react"

import { Badge } from "@/registry/proto-lab/ui/badge"
import { Button } from "@/registry/proto-lab/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/proto-lab/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/registry/proto-lab/ui/tabs"
import { cn } from "cn"

import { useWorkspace } from "./workspace-context"

type Severity = "high" | "medium" | "low"
type Finding = { id: string; title: string; area: string; severity: Severity }

const INITIAL: Finding[] = [
  { id: "f1", title: "Claims status uses internal codes members cannot read", area: "Claims", severity: "high" },
  { id: "f2", title: "Password reset fails for members without email on file", area: "Access", severity: "high" },
  { id: "f3", title: "Find a doctor results ignore the member's plan network", area: "Search", severity: "medium" },
  { id: "f4", title: "ID card download needs four steps on mobile", area: "Mobile", severity: "medium" },
  { id: "f5", title: "Benefit summaries are PDF only and not screen reader friendly", area: "Accessibility", severity: "medium" },
  { id: "f6", title: "Footer links point to the retired provider site", area: "Content", severity: "low" },
  { id: "f7", title: "Chat widget covers the submit button on small screens", area: "Mobile", severity: "low" },
]

const SEVERITY: Record<Severity, { label: string; className: string }> = {
  high: { label: "High", className: "bg-destructive-subtle text-destructive" },
  medium: { label: "Medium", className: "bg-warning-subtle text-status-severe-foreground" },
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
}

type Filter = "all" | Severity

export function Findings() {
  const { log, setOpenFindings } = useWorkspace()
  const [findings, setFindings] = React.useState(INITIAL)
  const [filter, setFilter] = React.useState<Filter>("all")
  const [lastResolved, setLastResolved] = React.useState<{ finding: Finding; index: number } | null>(null)

  const count = (s: Filter) => (s === "all" ? findings.length : findings.filter((f) => f.severity === s).length)
  const visible = filter === "all" ? findings : findings.filter((f) => f.severity === filter)

  const update = (next: Finding[]) => {
    setFindings(next)
    setOpenFindings(next.length)
  }

  const resolve = (f: Finding) => {
    setLastResolved({ finding: f, index: findings.indexOf(f) })
    update(findings.filter((x) => x.id !== f.id))
    log({ kind: "finding", who: "You", text: `resolved "${f.title}"` })
  }

  const undo = () => {
    if (!lastResolved) return
    const next = [...findings]
    next.splice(lastResolved.index, 0, lastResolved.finding)
    update(next)
    log({ kind: "finding", who: "You", text: `reopened "${lastResolved.finding.title}"` })
    setLastResolved(null)
  }

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discovery findings</CardTitle>
        <CardDescription>Filter by severity. Resolve what the team has addressed.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="w-full">
            {filters.map((f) => (
              <TabsTrigger key={f.value} value={f.value}>
                {f.label}
                <span className="text-xs text-muted-foreground tabular-nums">{count(f.value)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {lastResolved && (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground" role="status">
            <span className="truncate">Finding resolved.</span>
            <Button variant="ghost" size="xs" onClick={undo}>
              <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
              Undo
            </Button>
          </div>
        )}

        {visible.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            {filter === "all"
              ? "Every finding is resolved. New ones will appear here."
              : `No ${SEVERITY[filter].label.toLowerCase()} severity findings left. Switch filters to review the rest.`}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visible.map((f) => (
              <li key={f.id} className="group/finding flex items-start gap-3 rounded-lg border px-3 py-3">
                <Badge className={cn("mt-0.5", SEVERITY[f.severity].className)}>{SEVERITY[f.severity].label}</Badge>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm leading-snug">{f.title}</span>
                  <span className="text-xs text-muted-foreground">{f.area}</span>
                </div>
                <Button variant="ghost" size="icon-sm" aria-label={`Resolve: ${f.title}`} onClick={() => resolve(f)}>
                  <CheckIcon aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
