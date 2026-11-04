"use client"

import { Toaster, toast } from "@/registry/proto-lab/ui/toast"

import { MatchFinder, type MatchAction } from "./match-finder"
import { dimensions, modes, runDemoMatch } from "./match-finder-data"

const MESSAGES: Record<MatchAction, (match: string, subject: string) => string> = {
  introduce: (m, s) => `Drafting an introduction: ${s} and ${m}`,
  briefing: (m) => `Added ${m} to the briefing`,
  ask: (m, s) => `Asking AI about ${m} and ${s}`,
}

export default function MatchFinderPage() {
  return (
    <Toaster>
      <main className="mx-auto w-full max-w-6xl p-4 md:p-8">
        <MatchFinder
          title="Sponsor match"
          description="Start from a client who's ready to transact, or from a sponsor call, and see who fits best and why."
          modes={modes}
          dimensions={dimensions}
          onRun={runDemoMatch}
          onAction={(action, m, s) => toast.add({ title: MESSAGES[action](m.name, s.name), type: "info" })}
        />
      </main>
    </Toaster>
  )
}
