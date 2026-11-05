import fs from "node:fs"
import path from "node:path"
import { highlight } from "fumadocs-core/highlight"
import type { BlockSource } from "@/lib/block-source"

// Two kinds of block:
// - Upstream: synced from shadcn by scripts/sync-blocks.js into blocks/. The
//   manifest lists each block's category, files and preview height.
// - CapTech: hand-built in captech/, described by its registry-items.json (the
//   same entries that ship in registry.json), with a demo page.tsx per block.
const DIR = path.join(process.cwd(), "registry", "proto-lab", "blocks")
const CAPTECH = path.join(process.cwd(), "registry", "proto-lab", "captech")

type Manifest = {
  blocks: Record<string, { category: string; description: string | null; iframeHeight: string | null; dependencies: string[]; files: string[] }>
}

type CaptechItem = {
  name: string
  title: string
  description: string
  meta?: { iframeHeight?: string; group?: string }
  files: { path: string; target: string }[]
}

export const categories = [
  { slug: "captech", title: "CapTech", description: "Built from real CapTech prototypes and rebuilt on Proto-Lab. The @proto-lab install command works once the registry is hosted; until then, add the built file from apps/docs/public/r." },
  { slug: "dashboard", title: "Dashboard", description: "A full application page: sidebar, header, KPI cards, a chart and a data table." },
  { slug: "sidebar", title: "Sidebar", description: "Application shells with collapsible, inset, floating and nested sidebars." },
  { slug: "login", title: "Login", description: "Sign in pages, from a centered card to a two column layout with an image." },
  { slug: "signup", title: "Signup", description: "Create account pages that pair with the login blocks." },
] as const

export type Category = (typeof categories)[number]["slug"]

// Where each category's page lands in a consuming Next.js project.
const ROUTE: Record<Category, string> = { captech: "app", dashboard: "app/dashboard", sidebar: "app/dashboard", login: "app/login", signup: "app/signup" }
const HEIGHT: Record<Category, number> = { captech: 1000, dashboard: 1000, sidebar: 860, login: 760, signup: 760 }

function manifest(): Manifest {
  return JSON.parse(fs.readFileSync(path.join(DIR, "manifest.json"), "utf8"))
}

function captechItems(): CaptechItem[] {
  return JSON.parse(fs.readFileSync(path.join(CAPTECH, "registry-items.json"), "utf8"))
}

export function blocksIn(category: Category) {
  if (category === "captech") {
    return captechItems().map((b) => ({
      name: b.name,
      title: b.title as string | undefined,
      group: b.meta?.group,
      description: b.description,
      source: "captech" as BlockSource,
      height: Number.parseInt(b.meta?.iframeHeight ?? "", 10) || HEIGHT.captech,
    }))
  }
  return Object.entries(manifest().blocks)
    .filter(([, b]) => b.category === category)
    .map(([name, b]) => ({ name, ...b, source: "upstream" as BlockSource, height: Number.parseInt(b.iframeHeight ?? "", 10) || HEIGHT[category] }))
}

export const allBlocks = () => [
  ...captechItems().map((b) => ({ name: b.name, category: "captech" as Category })),
  ...Object.entries(manifest().blocks).map(([name, b]) => ({ name, category: b.category as Category })),
]

// Show files the way a project receives them: install paths and @/ imports.
function toConsumer(src: string) {
  return src
    .replaceAll("@/registry/proto-lab/ui/", "@/components/ui/")
    .replaceAll("@/registry/proto-lab/hooks/", "@/hooks/")
    .replaceAll("@/registry/proto-lab/lib/utils", "@/lib/utils")
    .replace(/@\/registry\/proto-lab\/captech\/([^/"']+)\//g, "@/components/$1/")
    .replace(/(["'])(?:\.\.?\/)+components\/([^"']+)\1/g, "$1@/components/$2$1")
}

const highlighted = async (raw: string, lang: "tsx" | "json") =>
  highlight(raw, { lang, themes: { light: "github-light", dark: "github-dark-high-contrast" } })

export async function blockFiles(name: string, category: Category) {
  if (category === "captech") return captechFiles(name)
  const { files } = manifest().blocks[name]
  // Page first, then components, then data.
  const order = (f: string) => (f === "page.tsx" ? 0 : f.startsWith("components/") ? 1 : 2)
  return Promise.all([...files].sort((a, b) => order(a) - order(b) || a.localeCompare(b)).map(async (file) => {
    const raw = toConsumer(fs.readFileSync(path.join(DIR, name, file), "utf8"))
    const display = file === "page.tsx" || file.endsWith(".json") ? `${ROUTE[category]}/${file}` : file
    const lang = file.endsWith(".json") ? "json" : "tsx"
    return { path: display, raw, code: await highlighted(raw, lang) }
  }))
}

// A CapTech block's installed files, plus its demo page shown as an example
// route (app/<name>/page.tsx) importing from where the files land.
async function captechFiles(name: string) {
  const item = captechItems().find((b) => b.name === name)
  if (!item) return []
  const dir = path.dirname(item.files[0].target)
  const page = toConsumer(fs.readFileSync(path.join(CAPTECH, name, "page.tsx"), "utf8"))
    .replace(/(["'])\.\/([^"']+)\1/g, `$1@/${dir}/$2$1`)
  const files = [
    { path: `app/${name}/page.tsx`, raw: page },
    ...item.files.map((f) => ({ path: f.target, raw: toConsumer(fs.readFileSync(path.join(process.cwd(), f.path), "utf8")) })),
  ]
  return Promise.all(files.map(async (f) => ({ ...f, code: await highlighted(f.raw, "tsx") })))
}
