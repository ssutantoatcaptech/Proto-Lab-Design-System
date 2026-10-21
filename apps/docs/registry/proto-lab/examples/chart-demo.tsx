"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/registry/proto-lab/ui/chart"

const data = [
  { month: "Jan", billable: 1240, internal: 310 },
  { month: "Feb", billable: 1310, internal: 280 },
  { month: "Mar", billable: 1475, internal: 260 },
  { month: "Apr", billable: 1390, internal: 340 },
  { month: "May", billable: 1520, internal: 220 },
  { month: "Jun", billable: 1610, internal: 240 },
]

const chartConfig = {
  billable: { label: "Billable hours", color: "var(--chart-1)" },
  internal: { label: "Internal hours", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function ChartDemo() {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full max-w-lg">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="billable" fill="var(--color-billable)" radius={4} />
        <Bar dataKey="internal" fill="var(--color-internal)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
