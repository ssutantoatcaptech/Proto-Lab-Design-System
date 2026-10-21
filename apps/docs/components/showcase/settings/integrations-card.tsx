"use client"

import * as React from "react"
import {
  HashIcon,
  PenToolIcon,
  SquareKanbanIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/registry/proto-lab/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/proto-lab/ui/card"
import { Switch } from "@/registry/proto-lab/ui/switch"

type Tool = { id: string; name: string; help: string; icon: LucideIcon }

const tools: Tool[] = [
  { id: "teams", name: "Microsoft Teams", help: "Post status updates to your project channel.", icon: UsersIcon },
  { id: "jira", name: "Jira", help: "Link stories to deliverables and timesheets.", icon: SquareKanbanIcon },
  { id: "figma", name: "Figma", help: "Preview design files in client reviews.", icon: PenToolIcon },
  { id: "slack", name: "Slack", help: "Mirror client comments into shared channels.", icon: HashIcon },
]

export function IntegrationsCard() {
  const [connected, setConnected] = React.useState<Record<string, boolean>>({
    teams: true,
    jira: true,
    figma: false,
    slack: false,
  })
  const count = Object.values(connected).filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>
          {count === 0 ? "Nothing connected yet. Turn on a tool to get started." : `${count} of ${tools.length} tools connected.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col divide-y">
          {tools.map((tool) => {
            const Icon = tool.icon
            const on = connected[tool.id]
            const switchId = `integration-${tool.id}`
            return (
              <li key={tool.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <label htmlFor={switchId} className="text-sm font-medium">
                      {tool.name}
                    </label>
                    {on && (
                      <Badge className="bg-success-subtle text-success">Connected</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{tool.help}</p>
                </div>
                <Switch
                  id={switchId}
                  checked={on}
                  onCheckedChange={(checked) =>
                    setConnected((s) => ({ ...s, [tool.id]: checked }))
                  }
                />
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
