"use client"

import { Toaster, toast } from "@/registry/proto-lab/ui/toast"

import { SignalFeed, type SignalAction } from "./signal-feed"
import { signals } from "./signal-feed-data"

const MESSAGES: Record<SignalAction, (entity: string) => string> = {
  details: (e) => `Opening ${e}`,
  briefing: (e) => `Drafting a briefing on ${e}`,
  ask: (e) => `Asking AI about ${e}`,
}

export default function SignalFeedPage() {
  return (
    <Toaster>
      <main className="mx-auto w-full max-w-4xl p-4 md:p-8">
        <SignalFeed
          signals={signals}
          viewAll={{ label: "View all in scanner", href: "#" }}
          onAction={(action, s) => toast.add({ title: MESSAGES[action](s.entity), description: s.title, type: "info" })}
        />
      </main>
    </Toaster>
  )
}
