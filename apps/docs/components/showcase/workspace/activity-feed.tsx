"use client"

import * as React from "react"
import { CalendarIcon, ClockIcon, FlagIcon, LightbulbIcon, SearchCheckIcon, UsersIcon, type LucideIcon } from "lucide-react"

import { Button } from "@/registry/proto-lab/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/proto-lab/ui/card"

import { useWorkspace, type ActivityKind } from "./workspace-context"

const ICONS: Record<ActivityKind, LucideIcon> = {
  time: ClockIcon,
  milestone: FlagIcon,
  finding: SearchCheckIcon,
  workshop: CalendarIcon,
  team: UsersIcon,
  idea: LightbulbIcon,
}

const COLLAPSED = 4

export function ActivityFeed() {
  const { activity } = useWorkspace()
  const [expanded, setExpanded] = React.useState(false)
  const shown = expanded ? activity : activity.slice(0, COLLAPSED)
  const hidden = activity.length - COLLAPSED

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Your changes on this page show up here.</CardDescription>
        {hidden > 0 && (
          <CardAction>
            <Button variant="ghost" size="sm" onClick={() => setExpanded((e) => !e)} aria-expanded={expanded}>
              {expanded ? "Show less" : `Show ${hidden} more`}
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col">
          {shown.map((event, i) => {
            const Icon = ICONS[event.kind]
            const last = i === shown.length - 1
            return (
              <li key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon className="size-3.5" aria-hidden="true" />
                  </span>
                  {!last && <span className="w-px flex-1 bg-border" aria-hidden="true" />}
                </div>
                <div className={last ? "flex min-w-0 flex-col gap-0.5 pt-1" : "flex min-w-0 flex-col gap-0.5 pt-1 pb-4"}>
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{event.who}</span> <span className="text-muted-foreground">{event.text}</span>
                  </p>
                  <time className="text-xs text-muted-foreground">{event.when}</time>
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
