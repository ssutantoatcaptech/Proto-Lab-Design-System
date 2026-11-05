"use client"

import * as React from "react"

import { AgentDock, type AgentContext, type AgentMessage, type AgentPrompt, type AgentReply, type AgentRequest } from "@/registry/proto-lab/captech/ai-agent/ai-agent"
import { Toaster, toast } from "@/registry/proto-lab/ui/toast"

import { MatchFinder, type Match, type MatchAction, type MatchSubject } from "./match-finder"
import { dimensions, modes, runDemoMatch } from "./match-finder-data"

// Match finder with the AI agent docked beside it: Ask AI and Draft
// introduction hand the match to the agent, and the agent can run a match
// itself ("Find sponsors for Carver Precision Machining").

const prompts: AgentPrompt[] = [
  { title: "Find sponsors for a client", description: "Runs the match and ranks who fits", prompt: "Find sponsors for Carver Precision Machining" },
  { title: "Find clients for a sponsor", description: "Who fits a sponsor's bolt-on themes", prompt: "Which clients fit Redwater Growth?" },
  { title: "Explain a score", description: "Open a match, then use its Ask AI", prompt: "How are matches scored?" },
]

const label = (id: string) => dimensions.find((d) => d.id === id)?.label ?? id

function explain(m: Match, s: MatchSubject): string {
  const ranked = Object.entries(m.dimensions).sort((a, b) => b[1].score - a[1].score)
  const strong = ranked.slice(0, 2).map(([id, v]) => `- ${label(id)} ${v.score}/10: ${v.reason}`)
  const weak = ranked[ranked.length - 1]
  return [
    `${m.name} scores ${m.score.toFixed(1)} out of 10 for ${s.name}.`,
    "What carries it:",
    strong.join("\n"),
    weak[1].score >= 8
      ? "Every part scores 8 or higher, so there's no weak spot to manage."
      : `Watch: ${label(weak[0])} at ${weak[1].score}/10. ${weak[1].reason}`,
    m.why ? `Why now: ${m.why}` : "",
  ].filter(Boolean).join("\n\n")
}

function introduction(m: Match, s: MatchSubject): string {
  const fee = m.economics?.find((e) => e.label === "Est. fee")?.value
  const role = m.economics?.find((e) => e.label === "Our role")?.value
  return [
    "Here's a first draft:",
    `Subject: Introduction, ${s.name} and ${m.name}`,
    `Hi team, I'd like to introduce ${s.name} and ${m.name}. ${m.pitch ?? ""} ${m.why ?? ""}`.trim(),
    "Would a 30 minute call next week work? Happy to set it up.",
    fee ? `For us: est. fee ${fee}${role ? `, role ${role}` : ""}.` : "",
  ].filter(Boolean).join("\n\n")
}

const findSubject = (modeId: string, text: string) =>
  modes.find((m) => m.id === modeId)?.subjects.find((s) => text.toLowerCase().includes(s.name.toLowerCase().split(" ")[0]))

export default function MatchFinderPage() {
  const [open, setOpen] = React.useState(false)
  const [context, setContext] = React.useState<AgentContext | null>(null)
  const [request, setRequest] = React.useState<AgentRequest | null>(null)
  const focus = React.useRef<{ match: Match; subject: MatchSubject } | null>(null)

  const ask = (prompt: string, ctx: AgentContext | null) => {
    setContext(ctx)
    setOpen(true)
    setRequest({ id: Date.now(), prompt })
  }

  const onAction = (action: MatchAction, m: Match, s: MatchSubject) => {
    focus.current = { match: m, subject: s }
    const ctx = { label: "Match", detail: `${s.name} and ${m.name} · ${m.score.toFixed(1)}/10` }
    if (action === "ask") ask(`Why is ${m.name} a fit for ${s.name}?`, ctx)
    else if (action === "introduce") ask(`Draft an introduction between ${s.name} and ${m.name}.`, ctx)
    else toast.add({ title: `Added ${m.name} to the briefing`, type: "info" })
  }

  const onSend = async (messages: AgentMessage[], ctx: AgentContext | null): Promise<AgentReply> => {
    const text = messages[messages.length - 1].content
    const f = focus.current
    await new Promise((r) => setTimeout(r, 900))

    if (f && ctx && /introduc/i.test(text)) return { content: introduction(f.match, f.subject), sources: ["CRM", "PitchBook"] }
    if (f && ctx && text.includes(f.match.name)) return { content: explain(f.match, f.subject), sources: f.match.sources }

    const company = /sponsor|buyer/i.test(text) ? findSubject("company", text) : undefined
    const sponsor = !company && /client|target|fit/i.test(text) ? findSubject("sponsor", text) : undefined
    const subject = company ?? sponsor
    if (subject) {
      const result = await runDemoMatch(company ? "company" : "sponsor", subject)
      const list = result.matches.slice(0, 3).map((m, i) => `- ${i + 1}. ${m.name}: ${m.score.toFixed(1)}/10. ${m.why ?? ""}`.trim())
      return {
        content: result.matches.length
          ? `I ran the match for ${subject.name}. Top ${list.length}:\n\n${list.join("\n")}\n\nOpen the match finder for the full breakdown, or ask me to draft an introduction.`
          : `I ran the match for ${subject.name}, but nothing scored high enough to recommend.`,
        sources: ["CRM", "PitchBook", "SEC filing"],
      }
    }

    if (/scor/i.test(text)) {
      return { content: `Each match is scored 0 to 10 on five things, then averaged:\n\n${dimensions.map((d) => `- ${d.label}`).join("\n")}\n\nOpen a match and use its Ask AI to see why it scored the way it did.` }
    }
    return { content: "Try asking me to find sponsors for a client, find clients for a sponsor, or open a match and use Ask AI." }
  }

  return (
    <Toaster>
      <AgentDock
        open={open}
        onOpenChange={setOpen}
        title="AI agent"
        subtitle="Runs matches and explains them"
        prompts={prompts}
        context={context}
        request={request}
        placeholder="Ask the agent to find or explain a match"
        onSend={onSend}
        launcherLabel="Ask the agent"
      >
        <main className="mx-auto w-full max-w-6xl p-4 md:p-8">
          <MatchFinder
            title="Sponsor match"
            description="Start from a client who's ready to transact, or from a sponsor call, and see who fits best and why."
            modes={modes}
            dimensions={dimensions}
            onRun={runDemoMatch}
            onAction={onAction}
          />
        </main>
      </AgentDock>
    </Toaster>
  )
}
