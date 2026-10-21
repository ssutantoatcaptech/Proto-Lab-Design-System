import fs from "node:fs"
import path from "node:path"
import { highlight } from "fumadocs-core/highlight"

// Blocks synced from upstream by scripts/sync-blocks.js. The manifest lists
// each block's category, files and preview height.
const DIR = path.join(process.cwd(), "registry", "proto-lab", "blocks")

type Manifest = {
  blocks: Record<string, { category: string; description: string | null; iframeHeight: string | null; dependencies: string[]; files: string[] }>
}

export const categories = [
  { slug: "dashboard", title: "Dashboard", description: "A full application page: sidebar, header, KPI cards, a chart and a data table." },
  { slug: "sidebar", title: "Sidebar", description: "Application shells with collapsible, inset, floating and nested sidebars." },
  { slug: "login", title: "Login", description: "Sign in pages, from a centered card to a two column layout with an image." },
  { slug: "signup", title: "Signup", description: "Create account pages that pair with the login blocks." },
] as const

export type Category = (typeof categories)[number]["slug"]

// Where each category's page lands in a consuming Next.js project.
const ROUTE: Record<Category, string> = { dashboard: "app/dashboard", sidebar: "app/dashboard", login: "app/login", signup: "app/signup" }
const HEIGHT: Record<Category, number> = { dashboard: 1000, sidebar: 860, login: 760, signup: 760 }

function manifest(): Manifest {
  return JSON.parse(fs.readFileSync(path.join(DIR, "manifest.json"), "utf8"))
}

export function blocksIn(category: Category) {
  return Object.entries(manifest().blocks)
    .filter(([, b]) => b.category === category)
    .map(([name, b]) => ({ name, ...b, height: Number.parseInt(b.iframeHeight ?? "", 10) || HEIGHT[category] }))
}

export const allBlocks = () => Object.entries(manifest().blocks).map(([name, b]) => ({ name, category: b.category as Category }))

// Show files the way a project receives them: install paths and @/ imports.
function toConsumer(src: string) {
  return src
    .replaceAll("@/registry/proto-lab/ui/", "@/components/ui/")
    .replaceAll("@/registry/proto-lab/hooks/", "@/hooks/")
    .replaceAll("@/registry/proto-lab/lib/utils", "@/lib/utils")
    .replace(/(["'])(?:\.\.?\/)+components\/([^"']+)\1/g, "$1@/components/$2$1")
}

export async function blockFiles(name: string, category: Category) {
  const { files } = manifest().blocks[name]
  // Page first, then components, then data.
  const order = (f: string) => (f === "page.tsx" ? 0 : f.startsWith("components/") ? 1 : 2)
  return Promise.all([...files].sort((a, b) => order(a) - order(b) || a.localeCompare(b)).map(async (file) => {
    const raw = toConsumer(fs.readFileSync(path.join(DIR, name, file), "utf8"))
    const display = file === "page.tsx" || file.endsWith(".json") ? `${ROUTE[category]}/${file}` : file
    const lang = file.endsWith(".json") ? "json" : "tsx"
    return { path: display, raw, code: await highlight(raw, { lang, themes: { light: "github-light", dark: "github-dark" } }) }
  }))
}
