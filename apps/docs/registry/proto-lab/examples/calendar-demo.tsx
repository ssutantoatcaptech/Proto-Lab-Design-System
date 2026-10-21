"use client"

import * as React from "react"
import { Calendar } from "@/registry/proto-lab/ui/calendar"

export default function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <div className="flex flex-col items-center gap-2">
      <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
      <p className="text-sm text-muted-foreground">
        {date ? `Workshop on ${date.toLocaleDateString(undefined, { dateStyle: "medium" })}` : "Pick a workshop date."}
      </p>
    </div>
  )
}
