"use client"

import * as React from "react"
import { ArrowRightIcon, CalendarClockIcon, Undo2Icon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/registry/proto-lab/ui/avatar"
import { Badge } from "@/registry/proto-lab/ui/badge"
import { Button } from "@/registry/proto-lab/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/proto-lab/ui/card"
import { Progress, ProgressLabel, ProgressValue } from "@/registry/proto-lab/ui/progress"
import { toast } from "@/registry/proto-lab/ui/toast"
import { cn } from "cn"

import { initials, useWorkspace } from "./workspace-context"

const PHASES = [
  { name: "Discovery", progress: 100, due: "Oct 31", daysLeft: 10 },
  { name: "Design", progress: 15, due: "Dec 12", daysLeft: 52 },
  { name: "Deliver", progress: 0, due: "Feb 27", daysLeft: 129 },
]

const TEAM = ["Dana Ortiz", "Marcus Lee", "Priya Raman", "Jordan Kim", "Alex Chen", "Sam Patel"]

export function EngagementOverview() {
  const { log } = useWorkspace()
  // Index of the active phase. Discovery is 72% done until the team advances it.
  const [phase, setPhase] = React.useState(0)
  const discoveryProgress = 72
  const current = PHASES[phase]
  const progress = phase === 0 ? discoveryProgress : current.progress
  const next = PHASES[phase + 1]

  const advance = () => {
    if (!next) return
    setPhase(phase + 1)
    log({ kind: "milestone", who: "You", text: `moved the engagement into ${next.name}` })
    toast.add({ title: `Moved to ${next.name}`, description: "The client team will see the new phase.", type: "success" })
  }

  const undo = () => {
    const prev = PHASES[phase - 1]
    setPhase(phase - 1)
    log({ kind: "milestone", who: "You", text: `returned the engagement to ${prev.name}` })
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription>Regional Health Plan</CardDescription>
        <CardTitle className="text-subtitle-1">Member portal redesign</CardTitle>
        <CardAction>
          <Badge variant="outline" className="gap-1">
            <CalendarClockIcon aria-hidden="true" />
            Due {current.due}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <ol className="flex items-center gap-2" aria-label="Engagement phases">
          {PHASES.map((p, i) => (
            <li key={p.name} className="flex flex-1 items-center gap-2">
              <span
                aria-current={i === phase ? "step" : undefined}
                className={cn(
                  "flex h-7 w-full items-center justify-center rounded-md text-xs font-medium",
                  i < phase && "bg-success-subtle text-success",
                  i === phase && "bg-primary text-primary-foreground",
                  i > phase && "bg-muted text-muted-foreground"
                )}
              >
                {p.name}
              </span>
            </li>
          ))}
        </ol>
        <Progress value={progress}>
          <ProgressLabel>{current.name} progress</ProgressLabel>
          <ProgressValue />
        </Progress>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Engagement team</span>
            <AvatarGroup className="-space-x-1">
              {TEAM.slice(0, 4).map((name) => (
                <Avatar key={name}>
                  <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount className="text-xs">+{TEAM.length - 4}</AvatarGroupCount>
            </AvatarGroup>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="text-xs text-muted-foreground">Phase ends in</span>
            <span className="text-sm font-medium tabular-nums">{current.daysLeft} days</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        {phase > 0 ? (
          <Button variant="ghost" size="sm" onClick={undo}>
            <Undo2Icon data-icon="inline-start" aria-hidden="true" />
            Undo
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">Readout scheduled for Oct 30</span>
        )}
        <Button size="sm" onClick={advance} disabled={!next}>
          {next ? `Advance to ${next.name}` : "Final phase"}
          {next && <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />}
        </Button>
      </CardFooter>
    </Card>
  )
}
