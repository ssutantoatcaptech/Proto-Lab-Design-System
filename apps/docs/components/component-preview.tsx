import fs from "node:fs/promises"
import path from "node:path"
import { highlight } from "fumadocs-core/highlight"
import { examples } from "@/registry/proto-lab/examples"
import { ComponentPreviewTabs } from "@/components/component-preview-tabs"

// Preview and code come from the same example file, so they can't disagree.
export async function ComponentPreview({ name, align = "center" }: { name: string; align?: "center" | "start" }) {
  const Example = examples[name]
  if (!Example) throw new Error(`No example named "${name}" in registry/proto-lab/examples`)
  const source = await fs.readFile(path.join(process.cwd(), "registry/proto-lab/examples", `${name}.tsx`), "utf8")
  // Show the import path a consuming project uses.
  const code = source.replaceAll("@/registry/proto-lab/ui/", "@/components/ui/").trim()
  const highlighted = await highlight(code, { lang: "tsx", themes: { light: "github-light", dark: "github-dark" } })
  return <ComponentPreviewTabs preview={<Example />} code={highlighted} raw={code} align={align} />
}
