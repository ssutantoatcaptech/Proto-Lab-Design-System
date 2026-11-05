// Pattern types and labels, safe to use in client components (no file
// access). The pattern list itself is built in lib/patterns.ts.

export type PatternKind = "screen" | "section"
export type PatternSource = "proto-lab" | "upstream"

export const TOPICS = [
  { id: "agentic-ai", label: "Agentic AI" },
  { id: "insights", label: "Insights" },
  { id: "engagement", label: "Engagement" },
  { id: "settings", label: "Settings" },
  { id: "dashboards", label: "Dashboards" },
  { id: "app-shells", label: "App shells" },
  { id: "auth", label: "Auth" },
] as const
export type TopicId = (typeof TOPICS)[number]["id"]
export const topicLabel = (id: TopicId) => TOPICS.find((t) => t.id === id)?.label ?? id

export const KINDS: Record<PatternKind, { label: string; plural: string }> = {
  screen: { label: "Screen", plural: "Screens" },
  section: { label: "Section", plural: "Sections" },
}
export const SOURCES: Record<PatternSource, string> = { "proto-lab": "Proto-Lab", upstream: "Upstream" }

export type Pattern = {
  slug: string
  title: string
  description: string
  kind: PatternKind
  topic: TopicId
  source: PatternSource
  /** ISO date the pattern joined the library, for Newest. */
  added: string
  /** Featured order: lower comes first. */
  rank: number
  height: number
  /** The shadcn install command, or null when the pattern isn't in the registry yet. */
  install: string | null
  origin?: { label: string; href: string }
  thumb: boolean
}
