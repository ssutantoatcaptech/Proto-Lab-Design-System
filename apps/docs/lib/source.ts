import { docs } from "fumadocs-mdx:collections/server"
import { loader } from "fumadocs-core/source"

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

// Everything the Cmd+K palette can find: every page and its headings.
export function searchIndex(): SearchEntry[] {
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
