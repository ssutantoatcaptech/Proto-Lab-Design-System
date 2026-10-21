import { defineConfig, defineDocs, frontmatterSchema } from "fumadocs-mdx/config"
import { z } from "zod"

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      // Nielsen/Norman heuristics (1 to 10) a component page helps satisfy.
      heuristics: z.array(z.number().int().min(1).max(10)).optional(),
      // The Base UI primitive a component is built on.
      base: z.string().url().optional(),
    }),
    // Exposes page.data.getText("processed") for Copy Page.
    postprocess: { includeProcessedMarkdown: true },
  },
})

export default defineConfig({
  mdxOptions: {
    // Install commands are rendered by <InstallCommand>, not by these plugins.
    remarkNpmOptions: false,
    remarkCodeTabOptions: false,
    rehypeCodeOptions: {
      themes: { light: "github-light", dark: "github-dark" },
    },
  },
})
