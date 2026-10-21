"use client"

import * as React from "react"
import { cn } from "cn"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/proto-lab/ui/card"
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/registry/proto-lab/ui/field"
import { RadioGroup, RadioGroupItem } from "@/registry/proto-lab/ui/radio-group"

const densities = [
  { value: "comfortable", label: "Comfortable", help: "More room between rows." },
  { value: "compact", label: "Compact", help: "Fit more on screen." },
] as const

type Density = (typeof densities)[number]["value"]

const previewRows = ["Acme Health discovery", "Northwind data platform", "Riverbank CX audit"]

export function AppearanceCard() {
  const [density, setDensity] = React.useState<Density>("comfortable")
  const compact = density === "compact"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Set how dense lists and tables feel.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <RadioGroup
          value={density}
          onValueChange={(v) => setDensity(v as Density)}
          aria-label="Density"
          className="grid-cols-2 gap-3"
        >
          {densities.map((d) => (
            <FieldLabel key={d.value} htmlFor={`density-${d.value}`}>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>{d.label}</FieldTitle>
                  <FieldDescription className="text-xs">{d.help}</FieldDescription>
                </FieldContent>
                <RadioGroupItem value={d.value} id={`density-${d.value}`} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
        <div className="rounded-lg border bg-muted/50 p-3" aria-label="Density preview" role="img">
          <p className="mb-2 text-xs text-muted-foreground">Preview</p>
          <ul
            className={cn(
              "flex flex-col rounded-md bg-card ring-1 ring-foreground/10 transition-all",
              compact ? "gap-0" : "gap-1 py-1"
            )}
          >
            {previewRows.map((row, i) => (
              <li
                key={row}
                className={cn(
                  "flex items-center justify-between px-3 transition-all",
                  compact ? "py-1 text-xs" : "py-2 text-sm",
                  i > 0 && "border-t"
                )}
              >
                <span>{row}</span>
                <span className="text-xs text-muted-foreground">{32 + i * 6} h</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
