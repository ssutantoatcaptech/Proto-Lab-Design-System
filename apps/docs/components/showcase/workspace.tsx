"use client"

import { Toaster } from "@/registry/proto-lab/ui/toast"

import { ActivityFeed } from "./workspace/activity-feed"
import { EngagementOverview } from "./workspace/engagement-overview"
import { Findings } from "./workspace/findings"
import { HoursChart } from "./workspace/hours-chart"
import { KpiStats } from "./workspace/kpi-stats"
import { Milestones } from "./workspace/milestones"
import { ParkingLot } from "./workspace/parking-lot"
import { Team } from "./workspace/team"
import { Timesheet } from "./workspace/timesheet"
import { WorkshopCalendar } from "./workspace/workshop-calendar"
import { WorkspaceProvider } from "./workspace/workspace-context"

const CARDS = [
  { id: "overview", Component: EngagementOverview },
  { id: "kpis", Component: KpiStats },
  { id: "hours", Component: HoursChart },
  { id: "milestones", Component: Milestones },
  { id: "team", Component: Team },
  { id: "findings", Component: Findings },
  { id: "parking-lot", Component: ParkingLot },
  { id: "activity", Component: ActivityFeed },
  { id: "timesheet", Component: Timesheet },
  { id: "workshop", Component: WorkshopCalendar },
]

// A CapTech consultant's engagement workspace, laid out as a masonry gallery.
export function Workspace() {
  return (
    <WorkspaceProvider>
      <Toaster>
        <div className="columns-1 gap-6 md:columns-2 xl:columns-3">
          {CARDS.map(({ id, Component }) => (
            <div key={id} className="mb-6 break-inside-avoid">
              <Component />
            </div>
          ))}
        </div>
      </Toaster>
    </WorkspaceProvider>
  )
}
