"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/proto-lab/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/registry/proto-lab/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/registry/proto-lab/ui/toggle-group"

const config = {
  billable: { label: "Billable", color: "var(--chart-1)" },
  internal: { label: "Internal", color: "var(--chart-2)" },
} satisfies ChartConfig

const DATA = {
  week: [
    { period: "Sep 22", billable: 34, internal: 6 },
    { period: "Sep 29", billable: 36, internal: 4 },
    { period: "Oct 6", billable: 32, internal: 8 },
    { period: "Oct 13", billable: 38, internal: 3 },
    { period: "Oct 20", billable: 35, internal: 5 },
  ],
  month: [
    { period: "Jun", billable: 128, internal: 30 },
    { period: "Jul", billable: 142, internal: 22 },
    { period: "Aug", billable: 150, internal: 18 },
    { period: "Sep", billable: 146, internal: 20 },
    { period: "Oct", billable: 104, internal: 18 },
  ],
}

type Range = keyof typeof DATA

export function HoursChart() {
  const [range, setRange] = React.useState<Range>("week")
  const data = DATA[range]
  const billable = data.reduce((sum, d) => sum + d.billable, 0)
  const total = data.reduce((sum, d) => sum + d.billable + d.internal, 0)
  const rate = Math.round((billable / total) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hours logged</CardTitle>
        <CardDescription>Billable against internal time.</CardDescription>
        <CardAction>
          <ToggleGroup
            variant="outline"
            size="sm"
            spacing={0}
            value={[range]}
            onValueChange={(v) => {
              // Keep one range selected. Ignore clicks that would clear it.
              const nextRange = v[0] as Range | undefined
              if (nextRange) setRange(nextRange)
            }}
            aria-label="Chart range"
          >
            <ToggleGroupItem value="week">Weekly</ToggleGroupItem>
            <ToggleGroupItem value="month">Monthly</ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-56 w-full">
          <BarChart data={data} margin={{ left: 0, right: 0, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="billable" stackId="h" maxBarSize={40} fill="var(--color-billable)" radius={[0, 0, 4, 4]} />
            <Bar dataKey="internal" stackId="h" maxBarSize={40} fill="var(--color-internal)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1">
        <span className="text-sm font-medium">
          {billable} billable hours, {rate}% of time logged
        </span>
        <span className="text-xs text-muted-foreground">
          {range === "week" ? "Last five weeks." : "Last five months. October is in progress."}
        </span>
      </CardFooter>
    </Card>
  )
}
