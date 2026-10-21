"use client"

import * as React from "react"
import { CircleCheckIcon, XIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/registry/proto-lab/ui/alert"
import { Button } from "@/registry/proto-lab/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/proto-lab/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/registry/proto-lab/ui/field"
import { Input } from "@/registry/proto-lab/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/proto-lab/ui/select"
import { Textarea } from "@/registry/proto-lab/ui/textarea"

import { useWorkspace } from "./workspace-context"

const PROJECTS = [
  { value: "rhp-portal", label: "Regional Health Plan, member portal" },
  { value: "mcu-onboarding", label: "Midwest Credit Union, onboarding" },
  { value: "internal-practice", label: "CX practice development" },
]

const DAYS = [
  { value: "mon", label: "Monday, Oct 19" },
  { value: "tue", label: "Tuesday, Oct 20" },
  { value: "wed", label: "Wednesday, Oct 21" },
]

function validateHours(raw: string): string | null {
  if (raw.trim() === "") return "Enter the hours you worked."
  const n = Number(raw)
  if (Number.isNaN(n)) return "Use a number, like 7.5."
  if (n < 0.25 || n > 12) return "Log between 0.25 and 12 hours per entry."
  if (Math.round(n * 4) !== n * 4) return "Round to the nearest quarter hour."
  return null
}

export function Timesheet() {
  const { log, addHours } = useWorkspace()
  const [project, setProject] = React.useState<string | null>(null)
  const [day, setDay] = React.useState<string>("wed")
  const [hours, setHours] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [touched, setTouched] = React.useState(false)
  const [submitted, setSubmitted] = React.useState<{ hours: number; project: string; day: string } | null>(null)

  const hoursError = touched ? validateHours(hours) : null
  const projectError = touched && !project ? "Choose a project." : null

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (validateHours(hours) || !project) return
    const n = Number(hours)
    const projectLabel = PROJECTS.find((p) => p.value === project)!.label
    const dayLabel = DAYS.find((d) => d.value === day)!.label
    addHours(n)
    log({ kind: "time", who: "You", text: `logged ${n} hours to ${projectLabel}` })
    setSubmitted({ hours: n, project: projectLabel, day: dayLabel })
    setProject(null)
    setHours("")
    setNotes("")
    setTouched(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log time</CardTitle>
        <CardDescription>Entries sync to your weekly timesheet.</CardDescription>
      </CardHeader>
      <form onSubmit={submit} noValidate className="contents">
        <CardContent className="flex flex-col gap-4">
          {submitted && (
            <Alert className="border-success-stroke bg-success-subtle text-success">
              <CircleCheckIcon aria-hidden="true" />
              <AlertTitle>
                {submitted.hours} hours logged for {submitted.day}
              </AlertTitle>
              <AlertDescription className="text-success">{submitted.project}</AlertDescription>
              <button
                type="button"
                aria-label="Dismiss confirmation"
                onClick={() => setSubmitted(null)}
                className="focus-ring absolute top-2 right-2 rounded-sm p-1 text-success hover:bg-success/10"
              >
                <XIcon className="size-3.5" aria-hidden="true" />
              </button>
            </Alert>
          )}
          <FieldGroup className="gap-4">
            <Field data-invalid={projectError ? true : undefined}>
              <FieldLabel id="ts-project-label">Project</FieldLabel>
              <Select items={PROJECTS} value={project} onValueChange={(v) => setProject(v as string | null)}>
                <SelectTrigger className="w-full" aria-labelledby="ts-project-label" aria-invalid={projectError ? true : undefined}>
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECTS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {projectError && <FieldError>{projectError}</FieldError>}
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel id="ts-day-label">Day</FieldLabel>
                <Select items={DAYS} value={day} onValueChange={(v) => v && setDay(v as string)}>
                  <SelectTrigger className="w-full" aria-labelledby="ts-day-label">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field data-invalid={hoursError ? true : undefined}>
                <FieldLabel htmlFor="ts-hours">Hours</FieldLabel>
                <Input
                  id="ts-hours"
                  inputMode="decimal"
                  placeholder="7.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  onBlur={() => hours !== "" && setTouched(true)}
                  aria-invalid={hoursError ? true : undefined}
                  aria-describedby={hoursError ? "ts-hours-error" : "ts-hours-hint"}
                />
                {!hoursError && <FieldDescription id="ts-hours-hint">0.25 to 12</FieldDescription>}
              </Field>
            </div>
            {hoursError && <FieldError id="ts-hours-error" className="-mt-2">{hoursError}</FieldError>}
            <Field>
              <FieldLabel htmlFor="ts-notes">Notes</FieldLabel>
              <Textarea
                id="ts-notes"
                placeholder="Synthesized interview notes for the claims journey."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setProject(null)
              setHours("")
              setNotes("")
              setTouched(false)
            }}
          >
            Clear
          </Button>
          <Button type="submit">Log hours</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
