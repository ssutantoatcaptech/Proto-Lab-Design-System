import fs from "node:fs"
import path from "node:path"
import { highlight } from "fumadocs-core/highlight"
import { blockFiles, blocksIn, categories, type Category } from "@/lib/blocks"

// Every pattern in one list: upstream shadcn blocks, CapTech sections from
// real prototypes, and the screens assembled from Proto-Lab components. The
// gallery filters this list by kind, topic and source; each pattern renders
// at /view/<slug> and has a detail page at /patterns/<slug>.

import { type Pattern, type TopicId } from "@/lib/pattern-meta"
export * from "@/lib/pattern-meta"

const UPSTREAM_TOPIC: Record<Exclude<Category, "captech">, TopicId> = {
  dashboard: "dashboards",
  sidebar: "app-shells",
  login: "auth",
  signup: "auth",
}
const UPSTREAM_ADDED = "2026-10-21"

const CAPTECH = path.join(process.cwd(), "registry", "proto-lab", "captech")
type CaptechItem = { name: string; title: string; description: string; meta?: { iframeHeight?: string; group?: string; added?: string; harvestedFrom?: string } }
const captechItems = (): CaptechItem[] => JSON.parse(fs.readFileSync(path.join(CAPTECH, "registry-items.json"), "utf8"))

const GROUP_TOPIC: Record<string, TopicId> = { "Agentic AI": "agentic-ai", Insights: "insights" }

// Screens assembled from Proto-Lab components (formerly the Examples page).
// Their code lives in components/showcase; they aren't registry items yet.
export const SCREENS = [
  {
    slug: "engagement-workspace",
    title: "Engagement workspace",
    description: "A consultant's engagement hub: phase and progress, team, activity, findings, hours and a timesheet.",
    topic: "engagement" as TopicId,
    dir: "workspace",
    height: 1400,
  },
  {
    slug: "account-settings",
    title: "Account settings",
    description: "Profile, team, invitations, notifications, appearance, security, integrations and a danger zone.",
    topic: "settings" as TopicId,
    dir: "settings",
    height: 1400,
  },
]

const titleCase = (name: string) => name.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase())
const hasThumb = (slug: string) => fs.existsSync(path.join(process.cwd(), "public", "patterns", `${slug}-light.jpg`))
const TEMPLATE_TITLES: Record<string, string> = { "huntington-capital-markets": "Huntington Capital Markets AI" }

export function allPatterns(): Pattern[] {
  const out: Pattern[] = []
  captechItems().forEach((b, i) => {
    const from = b.meta?.harvestedFrom
    out.push({
      slug: b.name,
      title: b.title,
      description: b.description.replace(/\s*Harvested from[^.]*\.?$/, ""),
      kind: "section",
      topic: GROUP_TOPIC[b.meta?.group ?? ""] ?? "insights",
      source: "proto-lab",
      added: b.meta?.added ?? "2026-11-04",
      rank: i,
      height: Number.parseInt(b.meta?.iframeHeight ?? "", 10) || 1000,
      install: `npx shadcn@latest add @proto-lab/${b.name}`,
      origin: from ? { label: TEMPLATE_TITLES[from] ?? titleCase(from), href: `/templates?template=${from}` } : undefined,
      thumb: hasThumb(b.name),
    })
  })
  SCREENS.forEach((s, i) => {
    out.push({
      slug: s.slug, title: s.title, description: s.description, kind: "screen", topic: s.topic, source: "proto-lab",
      added: "2026-10-26", rank: 100 + i, height: s.height, install: null, thumb: hasThumb(s.slug),
    })
  })
  categories.filter((c) => c.slug !== "captech").forEach((c, ci) => {
    blocksIn(c.slug).forEach((b, i) => {
      out.push({
        slug: b.name,
        title: titleCase(b.name),
        description: b.description ?? c.description,
        kind: "screen",
        topic: UPSTREAM_TOPIC[c.slug as Exclude<Category, "captech">],
        source: "upstream",
        added: UPSTREAM_ADDED,
        rank: 1000 + ci * 100 + i,
        height: b.height,
        install: `npx shadcn@latest add ${b.name}`,
        thumb: hasThumb(b.name),
      })
    })
  })
  return out
}

export const findPattern = (slug: string) => allPatterns().find((p) => p.slug === slug)

// Files the way a project receives them, for the Code view.
export async function patternFiles(p: Pattern) {
  if (p.source === "proto-lab" && p.kind === "section") return blockFiles(p.slug, "captech")
  const screen = SCREENS.find((s) => s.slug === p.slug)
  if (screen) {
    const root = path.join(process.cwd(), "components", "showcase")
    const files = [`${screen.dir}.tsx`, ...fs.readdirSync(path.join(root, screen.dir)).filter((f) => f.endsWith(".tsx")).map((f) => `${screen.dir}/${f}`)]
    return Promise.all(files.map(async (f) => {
      const raw = fs.readFileSync(path.join(root, f), "utf8")
        .replaceAll("@/registry/proto-lab/ui/", "@/components/ui/")
        .replaceAll("@/components/showcase/", "@/components/")
      return { path: `components/${f}`, raw, code: await highlight(raw, { lang: "tsx", themes: { light: "github-light", dark: "github-dark-high-contrast" } }) }
    }))
  }
  const category = categories.find((c) => c.slug !== "captech" && blocksIn(c.slug).some((b) => b.name === p.slug))
  return category ? blockFiles(p.slug, category.slug) : []
}
