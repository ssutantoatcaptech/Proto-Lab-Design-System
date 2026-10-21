"use client"

import * as React from "react"
import { CalendarCheckIcon } from "lucide-react"

import { Button } from "@/registry/proto-lab/ui/button"
import { Calendar } from "@/registry/proto-lab/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/proto-lab/ui/card"
import { toast } from "@/registry/proto-lab/ui/toast"

import { useWorkspace } from "./workspace-context"

// Fixed dates keep server and client renders identical.
const TODAY = new Date(2026, 9, 21)
const LAST_DAY = new Date(2026, 10, 30)

const fmt = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })

export function WorkshopCalendar() {
  const { log } = useWorkspace()
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 9, 28))
  const [invited, setInvited] = React.useState<string | null>(null)
  const isInvited = date ? invited === date.toDateString() : false

  const send = () => {
    if (!date) return
    setInvited(date.toDateString())
    log({ kind: "workshop", who: "You", text: `invited the client to the design workshop on ${fmt(date)}` })
    toast.add({ title: "Invite sent", description: `Design workshop on ${fmt(date)}, 1:00 to 4:00 PM.`, type: "success" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Design workshop</CardTitle>
        <CardDescription>Pick a weekday before the end of November.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          defaultMonth={TODAY}
          startMonth={TODAY}
          endMonth={LAST_DAY}
          disabled={[{ before: TODAY }, { after: LAST_DAY }, { dayOfWeek: [0, 6] }]}
          className="p-0"
        />
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <span className="text-sm" aria-live="polite">
          {date ? (
            <>
              Workshop on <span className="font-medium">{date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </>
          ) : (
            <span className="text-muted-foreground">No date selected</span>
          )}
        </span>
        <Button size="sm" variant={isInvited ? "outline" : "default"} disabled={!date || isInvited} onClick={send}>
          {isInvited && <CalendarCheckIcon data-icon="inline-start" aria-hidden="true" />}
          {isInvited ? "Invite sent" : "Send invite"}
        </Button>
      </CardFooter>
    </Card>
  )
}
