"use client"

import * as React from "react"
import { BellIcon, BellOffIcon, MessageSquareIcon, MoreHorizontalIcon, UserRoundIcon } from "lucide-react"

import { Avatar, AvatarBadge, AvatarFallback } from "@/registry/proto-lab/ui/avatar"
import { Button } from "@/registry/proto-lab/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/proto-lab/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/proto-lab/ui/dropdown-menu"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/registry/proto-lab/ui/item"
import { toast } from "@/registry/proto-lab/ui/toast"
import { cn } from "cn"

import { initials, useWorkspace } from "./workspace-context"

type Presence = "online" | "away" | "offline"
type Member = { name: string; role: string; presence: Presence; muted?: boolean }

const MEMBERS: Member[] = [
  { name: "Dana Ortiz", role: "Engagement lead", presence: "online" },
  { name: "Marcus Lee", role: "Service designer", presence: "online" },
  { name: "Priya Raman", role: "UX researcher", presence: "away" },
  { name: "Jordan Kim", role: "Data analyst", presence: "offline" },
]

const PRESENCE: Record<Presence, { label: string; className: string }> = {
  online: { label: "Online", className: "bg-success" },
  away: { label: "Away", className: "bg-warning" },
  offline: { label: "Offline", className: "bg-muted-foreground" },
}

export function Team() {
  const { log } = useWorkspace()
  const [members, setMembers] = React.useState(MEMBERS)
  const online = members.filter((m) => m.presence === "online").length

  const toggleMute = (m: Member) => {
    setMembers((prev) => prev.map((x) => (x.name === m.name ? { ...x, muted: !x.muted } : x)))
    toast.add({
      title: m.muted ? `Updates from ${m.name} are back on` : `Muted updates from ${m.name}`,
      type: "info",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement team</CardTitle>
        <CardDescription>
          {online} of {members.length} online now
        </CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              log({ kind: "team", who: "You", text: "posted a standup reminder to the team channel" })
              toast.add({ title: "Standup reminder sent", description: "Posted to the team channel for 9:30 AM.", type: "success" })
            }}
          >
            Nudge team
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {members.map((m) => (
          <Item key={m.name} size="sm" className="px-2">
            <ItemMedia>
              <Avatar>
                <AvatarFallback>{initials(m.name)}</AvatarFallback>
                <AvatarBadge className={PRESENCE[m.presence].className} aria-label={PRESENCE[m.presence].label} />
              </Avatar>
            </ItemMedia>
            <ItemContent className="min-w-0 gap-0">
              <ItemTitle className={cn(m.muted && "text-muted-foreground")}>
                {m.name}
                {m.muted && <BellOffIcon className="size-3.5 text-muted-foreground" aria-label="Muted" />}
              </ItemTitle>
              <ItemDescription className="text-xs">
                {m.role} · {PRESENCE[m.presence].label}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${m.name}`} />}>
                  <MoreHorizontalIcon aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={() =>
                      toast.add({
                        title: `Message to ${m.name.split(" ")[0]} started`,
                        description: m.presence === "online" ? "They usually reply within minutes." : "They will see it when they are back.",
                      })
                    }
                  >
                    <MessageSquareIcon aria-hidden="true" />
                    Message
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast.add({ title: m.name, description: `${m.role}. On this engagement since August.` })}
                  >
                    <UserRoundIcon aria-hidden="true" />
                    View profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toggleMute(m)}>
                    {m.muted ? <BellIcon aria-hidden="true" /> : <BellOffIcon aria-hidden="true" />}
                    {m.muted ? "Unmute updates" : "Mute updates"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ItemActions>
          </Item>
        ))}
      </CardContent>
    </Card>
  )
}
