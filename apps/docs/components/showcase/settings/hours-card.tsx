"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/proto-lab/ui/card"
import { Field, FieldDescription, FieldLabel, FieldTitle } from "@/registry/proto-lab/ui/field"
import { Slider } from "@/registry/proto-lab/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/registry/proto-lab/ui/toggle-group"

const days = [
  { value: "mon", short: "M", label: "Monday" },
  { value: "tue", short: "T", label: "Tuesday" },
  { value: "wed", short: "W", label: "Wednesday" },
  { value: "thu", short: "T", label: "Thursday" },
  { value: "fri", short: "F", label: "Friday" },
  { value: "sat", short: "S", label: "Saturday" },
  { value: "sun", short: "S", label: "Sunday" },
]

export function HoursCard() {
  const [hours, setHours] = React.useState(8)
  const [workdays, setWorkdays] = React.useState<string[]>(["mon", "tue", "wed", "thu", "fri"])
  const weekly = hours * workdays.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Working hours</CardTitle>
        <CardDescription>Staffing uses this to plan your capacity.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Field>
          <div className="flex items-baseline justify-between">
            <FieldLabel id="capacity-label">Daily capacity</FieldLabel>
            <span className="text-sm font-medium tabular-nums" aria-live="polite">
              {hours} hours
            </span>
          </div>
          <Slider
            aria-labelledby="capacity-label"
            min={4}
            max={10}
            step={1}
            value={[hours]}
            onValueChange={(v) => setHours(Array.isArray(v) ? v[0] : v)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>4 h</span>
            <span>10 h</span>
          </div>
        </Field>
        <Field>
          <FieldTitle id="workdays-label">Workdays</FieldTitle>
          <ToggleGroup
            multiple
            variant="outline"
            spacing={1}
            value={workdays}
            onValueChange={(v) => setWorkdays(v as string[])}
            aria-labelledby="workdays-label"
            className="w-full"
          >
            {days.map((d) => (
              <ToggleGroupItem
                key={d.value}
                value={d.value}
                aria-label={d.label}
                className="flex-1 aria-pressed:bg-primary aria-pressed:text-primary-foreground"
              >
                {d.short}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {workdays.length === 0 && (
            <FieldDescription className="text-xs">
              Pick at least one workday so staffing can plan around you.
            </FieldDescription>
          )}
        </Field>
        <div className="flex flex-col gap-1 rounded-lg bg-muted p-3" aria-live="polite">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Weekly capacity</span>
            <span className="text-sm font-medium tabular-nums">{weekly} hours</span>
          </div>
          {weekly > 45 && (
            <span className="text-xs text-destructive">
              Above the 45 hour guideline. Talk to your staffing lead first.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
