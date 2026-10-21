"use client"

import * as React from "react"

export type ActivityKind = "time" | "milestone" | "finding" | "workshop" | "team" | "idea"

export type ActivityEvent = {
  id: string
  kind: ActivityKind
  who: string
  text: string
  when: string
}

type WorkspaceState = {
  activity: ActivityEvent[]
  log: (event: Omit<ActivityEvent, "id" | "when">) => void
  hoursThisWeek: number
  addHours: (hours: number) => void
  openFindings: number
  setOpenFindings: (count: number) => void
}

const WorkspaceContext = React.createContext<WorkspaceState | null>(null)

const SEED: ActivityEvent[] = [
  { id: "a1", kind: "finding", who: "Priya Raman", text: "logged a high finding on claims status messaging", when: "9:42 AM" },
  { id: "a2", kind: "workshop", who: "Marcus Lee", text: "shared the journey map draft with the client team", when: "Yesterday" },
  { id: "a3", kind: "milestone", who: "Dana Ortiz", text: "closed stakeholder interviews, 14 of 14 complete", when: "Mon" },
  { id: "a4", kind: "team", who: "Jordan Kim", text: "joined the engagement as data analyst", when: "Oct 16" },
]

let counter = 0

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [activity, setActivity] = React.useState<ActivityEvent[]>(SEED)
  const [hoursThisWeek, setHours] = React.useState(31.5)
  const [openFindings, setOpenFindings] = React.useState(7)

  const log = React.useCallback((event: Omit<ActivityEvent, "id" | "when">) => {
    counter += 1
    setActivity((prev) => [{ ...event, id: `new-${counter}`, when: "Just now" }, ...prev].slice(0, 8))
  }, [])

  const addHours = React.useCallback((hours: number) => setHours((h) => h + hours), [])

  const value = React.useMemo(
    () => ({ activity, log, hoursThisWeek, addHours, openFindings, setOpenFindings }),
    [activity, log, hoursThisWeek, addHours, openFindings]
  )
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const ctx = React.useContext(WorkspaceContext)
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider")
  return ctx
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
}
