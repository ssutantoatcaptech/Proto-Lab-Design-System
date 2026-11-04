// "upstream": a stock shadcn/ui block from the manifest, installed from shadcn.
// "captech": a Proto-Lab block in registry.json, installed from @proto-lab.
export type BlockSource = "upstream" | "captech"

export const installCommand = (name: string, source: BlockSource) =>
  source === "captech" ? `npx shadcn@latest add @proto-lab/${name}` : `npx shadcn@latest add ${name}`
