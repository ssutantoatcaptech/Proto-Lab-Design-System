"use client"

import * as React from "react"

import { Badge } from "@/registry/proto-lab/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/proto-lab/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/registry/proto-lab/ui/field"
import { Switch } from "@/registry/proto-lab/ui/switch"

const rows = [
  {
    id: "timesheet",
    label: "Timesheet reminders",
    help: "A nudge every Friday at 3 PM if hours are missing.",
  },
  {
    id: "comments",
    label: "Client comments",
    help: "When a client replies on a shared deliverable.",
  },
  {
    id: "staffing",
    label: "Staffing updates",
    help: "When you are proposed for a new engagement.",
  },
  {
    id: "digest",
    label: "Weekly digest",
    help: "A Monday summary of your projects and utilization.",
  },
] as const

type RowId = (typeof rows)[number]["id"]

export function NotificationsCard() {
  const [enabled, setEnabled] = React.useState<Record<RowId, boolean>>({
    timesheet: true,
    comments: true,
    staffing: false,
    digest: false,
  })
  const count = Object.values(enabled).filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what reaches your inbox.</CardDescription>
        <CardAction>
          <Badge variant={count > 0 ? "secondary" : "outline"} aria-live="polite">
            {count} of {rows.length} on
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <FieldGroup className="gap-4">
          {rows.map((row) => (
            <Field key={row.id} orientation="horizontal" className="items-start justify-between gap-4">
              <FieldContent>
                <FieldLabel htmlFor={`notify-${row.id}`}>{row.label}</FieldLabel>
                <FieldDescription className="text-xs">{row.help}</FieldDescription>
              </FieldContent>
              <Switch
                id={`notify-${row.id}`}
                checked={enabled[row.id]}
                onCheckedChange={(checked) =>
                  setEnabled((s) => ({ ...s, [row.id]: checked }))
                }
              />
            </Field>
          ))}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
