import type { AgentContext, AgentMessage, AgentPrompt, AgentReply } from "./ai-agent"

// Sample prompts and canned replies for a capital markets coverage desk,
// using the same fictional firms as the signal-feed and match-finder blocks.
// Replace `demoReply` with a call to your model; it gets the whole
// conversation and the current page context.

export const prompts: AgentPrompt[] = [
  { title: "Maturities in the next year", description: "Loans coming due and the refinancing angle", prompt: "Which maturities hit in the next 12 months, and what's the fee opportunity?" },
  { title: "Fee pipeline by sponsor", description: "Where the estimated fees sit today", prompt: "Break down our fee pipeline by sponsor." },
  { title: "Healthcare buyers", description: "Sponsors looking for healthcare bolt-ons", prompt: "Which sponsors are looking for healthcare bolt-ons?" },
  { title: "Prep for this call", description: "Talking points for the account on screen", prompt: "Give me three talking points for my call on this account." },
]

export const context: AgentContext = { label: "On screen", detail: "Halvorsen Equity · Lead left acquisition financing" }

const replies: { match: RegExp; reply: AgentReply }[] = [
  {
    match: /maturit|refinanc|due/i,
    reply: {
      content: "Two maturities matter in the next 12 months:\n\n- Keel Industrial (Northbridge): $410M term loan B due next June. Refinancing usually starts two quarters out, so the window opens now. Est. fee $4.1M.\n- Brightline Logistics (Ashgrove): revolver amendment and covenant reset next month after a soft Q3. Est. fee $1.4M.\n\nKeel is the bigger and earlier call. I'd lead with an amend and extend option.",
      sources: ["Bloomberg", "CRM"],
    },
  },
  {
    match: /pipeline|fee/i,
    reply: {
      content: "Estimated fees across covered sponsors come to $23.6M:\n\n- Halvorsen Equity: $7.2M (acquisition financing)\n- Redwater Growth: $8.6M (Lumen Health exit and Corvid Software sale)\n- Northbridge Capital Partners: $4.1M (Keel Industrial refinancing)\n- Calder & Pike: $2.3M (Trellis Foods recap)\n- Ashgrove Capital: $1.4M (Brightline revolver)\n\nRedwater leads on total fees but its confidence is lowest, at 58% to 62%.",
      sources: ["CRM", "PitchBook"],
    },
  },
  {
    match: /health/i,
    reply: {
      content: "Two sponsors are actively buying in healthcare:\n\n- Redwater Growth wants scale in specialty pharmacy before Lumen Health's IPO. Bluegrass Specialty Pharmacy in our book scores 8.8 out of 10 as a bolt-on.\n- Summit Ridge Partners just held a first close of $2.4B and needs a healthcare services platform. Piedmont Dental Partners is a possible secondary.\n\nWant me to draft an introduction for Bluegrass and Redwater?",
      sources: ["PitchBook", "News"],
    },
  },
  {
    match: /talking points|prep|call/i,
    reply: {
      content: "For Halvorsen Equity:\n\n- Fund XII is 35% deployed with two LOIs out. Ask which carve out is closest and offer to lead left on the TLB, revolver and ABL.\n- Keel Industrial's refinancing at Northbridge could free up a competing bidder. Position speed and certainty of funding.\n- Carver Precision Machining in our book fits their industrials theme at 8.8 out of 10. Offer an introduction.",
      sources: ["CRM", "Bloomberg"],
    },
  },
]

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function demoReply(messages: AgentMessage[], ctx: AgentContext | null): Promise<AgentReply> {
  await wait(1400)
  const last = messages[messages.length - 1]
  const hit = replies.find((r) => r.match.test(last.content))
  if (hit) return hit.reply
  return {
    content: `This is a demo agent, so it only knows a few topics. In your app, this question would go to your model${ctx ? ` along with what's on screen (${ctx.detail})` : ""}.\n\nTry asking about maturities, the fee pipeline, healthcare buyers, or prep for this call.`,
  }
}
