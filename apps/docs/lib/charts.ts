import fs from "node:fs"
import path from "node:path"
import { highlight } from "fumadocs-core/highlight"

// Charts ported from shadcn/ui by scripts/sync-charts.js.
const DIR = path.join(process.cwd(), "registry", "proto-lab", "charts")

type Manifest = { types: { slug: string; count: number }[]; charts: { name: string; type: string; title: string; wide: boolean }[] }

export const chartTypes = [
  { slug: "area", title: "Area" },
  { slug: "bar", title: "Bar" },
  { slug: "line", title: "Line" },
  { slug: "pie", title: "Pie" },
  { slug: "radar", title: "Radar" },
  { slug: "radial", title: "Radial" },
  { slug: "tooltip", title: "Tooltip" },
] as const

export const chartManifest = (): Manifest => JSON.parse(fs.readFileSync(path.join(DIR, "manifest.json"), "utf8"))

// Show code as a project receives it: @/components/ui imports.
export async function chartCode(name: string) {
  const raw = fs.readFileSync(path.join(DIR, `${name}.tsx`), "utf8")
    .replace(/^\/\/ Ported from shadcn\/ui[^\n]*\n/, "")
    .replaceAll("@/registry/proto-lab/ui/", "@/components/ui/")
  return { raw, code: await highlight(raw, { lang: "tsx", themes: { light: "github-light", dark: "github-dark-high-contrast" } }) }
}
