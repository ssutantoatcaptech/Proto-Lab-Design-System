"use client"

import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/proto-lab/ui/card"
import { cn } from "cn"

import { useWorkspace } from "./workspace-context"

type Stat = {
  label: string
  value: string
  delta: string
  // Whether the change is good news, independent of its direction.
  good: boolean
  up: boolean
}

export function KpiStats() {
  const { hoursThisWeek, openFindings } = useWorkspace()

  const stats: Stat[] = [
    { label: "Billable utilization", value: "87%", delta: "4 pts vs target", good: true, up: true },
    {
      label: "Hours this week",
      value: hoursThisWeek.toLocaleString("en-US", { maximumFractionDigits: 2 }),
      delta: `${Math.max(0, 40 - hoursThisWeek).toLocaleString("en-US", { maximumFractionDigits: 2 })} left to 40`,
      good: hoursThisWeek >= 32,
      up: true,
    },
    { label: "Open findings", value: String(openFindings), delta: openFindings > 5 ? "Above plan of 5" : "Within plan of 5", good: openFindings <= 5, up: openFindings > 5 },
    { label: "Client NPS", value: "62", delta: "8 since last pulse", good: true, up: true },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>This week at a glance</CardTitle>
        <CardDescription>Updates as you log time and resolve findings.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border ring-1 ring-border">
          {stats.map((s) => {
            const Icon = s.up ? TrendingUpIcon : TrendingDownIcon
            return (
              <div key={s.label} className="flex flex-col gap-1 bg-card p-4">
                <dt className="text-xs text-muted-foreground">{s.label}</dt>
                <dd className="text-title-3 tabular-nums">{s.value}</dd>
                <dd className={cn("flex items-center gap-1 text-xs", s.good ? "text-success" : "text-status-severe-foreground")}>
                  <Icon className="size-3.5" aria-hidden="true" />
                  {s.delta}
                </dd>
              </div>
            )
          })}
        </dl>
      </CardContent>
    </Card>
  )
}
