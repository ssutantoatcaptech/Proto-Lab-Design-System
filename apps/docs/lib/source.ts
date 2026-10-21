import { docs } from "fumadocs-mdx:collections/server"
import { loader } from "fumadocs-core/source"
import { allBlocks, categories } from "@/lib/blocks"
import { chartManifest, chartTypes } from "@/lib/charts"

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
})

export type SearchEntry = {
  title: string
  url: string
  section: string
  description?: string
  headings: { title: string; url: string }[]
}

const SECTIONS: Record<string, string> = {
  foundations: "Foundations",
  components: "Components",
}

// Everything the Cmd+K palette can find: every page and its headings, plus
// block categories and the blocks in them.
export function searchIndex(): SearchEntry[] {
  const blocks: SearchEntry[] = categories.map((c) => ({
    title: `${c.title} blocks`,
    url: `/blocks/${c.slug}`,
    section: "Blocks",
    description: c.description,
    headings: allBlocks().filter((b) => b.category === c.slug).map((b) => ({ title: b.name, url: `/blocks/${c.slug}#${b.name}` })),
  }))
  const { charts } = chartManifest()
  const chartPages: SearchEntry[] = chartTypes.map((t) => ({
    title: `${t.title} charts`,
    url: `/charts/${t.slug}`,
    section: "Charts",
    headings: charts.filter((c) => c.type === t.slug).map((c) => ({ title: c.title, url: `/charts/${t.slug}#${c.name}` })),
  }))
  return [...docPages(), ...chartPages, ...blocks]
}

function docPages(): SearchEntry[] {
  return source.getPages().map((page) => ({
    title: page.data.title,
    url: page.url,
    section: SECTIONS[page.slugs[0]] ?? "Get Started",
    description: page.data.description,
    headings: page.data.structuredData.headings.map((h) => ({
      title: h.content,
      url: `${page.url}#${h.id}`,
    })),
  }))
}
