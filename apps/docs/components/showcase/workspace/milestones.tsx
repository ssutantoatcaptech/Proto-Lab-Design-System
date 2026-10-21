"use client"

import * as React from "react"

import { Badge } from "@/registry/proto-lab/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/proto-lab/ui/card"
import { Checkbox } from "@/registry/proto-lab/ui/checkbox"
import { cn } from "cn"

import { useWorkspace } from "./workspace-context"

type Status = "done" | "at-risk" | "on-track"

type Milestone = { id: string; title: string; date: string; owner: string; status: Status }

const INITIAL: Milestone[] = [
  { id: "m1", title: "Stakeholder interviews", date: "Oct 14", owner: "Dana Ortiz", status: "done" },
  { id: "m2", title: "Current state journey map", date: "Oct 24", owner: "Marcus Lee", status: "on-track" },
  { id: "m3", title: "Claims data profiling", date: "Oct 27", owner: "Jordan Kim", status: "at-risk" },
  { id: "m4", title: "Discovery readout", date: "Oct 30", owner: "Dana Ortiz", status: "on-track" },
  { id: "m5", title: "Design sprint kickoff", date: "Nov 4", owner: "Priya Raman", status: "on-track" },
]

const STATUS_STYLE: Record<Status, { label: string; className: string }> = {
  done: { label: "Done", className: "bg-success-subtle text-success" },
  "at-risk": { label: "At risk", className: "bg-warning-subtle text-status-severe-foreground" },
  "on-track": { label: "On track", className: "bg-muted text-muted-foreground" },
}

export function Milestones() {
  const { log } = useWorkspace()
  const [items, setItems] = React.useState(INITIAL)
  // Remember each item's status before it was checked so unchecking restores it.
  const previous = React.useRef<Record<string, Status>>({})
  const done = items.filter((m) => m.status === "done").length

  const toggle = (m: Milestone, checked: boolean) => {
    if (checked) previous.current[m.id] = m.status
    const nextStatus: Status = checked ? "done" : previous.current[m.id] && previous.current[m.id] !== "done" ? previous.current[m.id] : "on-track"
    setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: nextStatus } : x)))
    log({ kind: "milestone", who: "You", text: checked ? `completed ${m.title}` : `reopened ${m.title}` })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming milestones</CardTitle>
        <CardDescription>Check one off when the client signs off.</CardDescription>
        <CardAction>
          <Badge variant="secondary" className="tabular-nums">
            {done} of {items.length} done
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col">
          {items.map((m) => {
            const isDone = m.status === "done"
            const style = STATUS_STYLE[m.status]
            return (
              <li key={m.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/50">
                  <Checkbox checked={isDone} onCheckedChange={(c) => toggle(m, c)} />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className={cn("truncate text-sm font-medium", isDone && "text-muted-foreground line-through")}>{m.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {m.date} · {m.owner}
                    </span>
                  </span>
                  <Badge className={style.className}>{style.label}</Badge>
                </label>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
