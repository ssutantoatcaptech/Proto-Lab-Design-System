// CapTech blocks: hand-built from real CapTech prototypes, unlike blocks/,
// which scripts/sync-blocks.js regenerates from upstream shadcn. Each entry in
// registry-items.json has a loader here for the docs /view route.
import type { ComponentType } from "react"

export const captechLoaders: Record<string, () => Promise<{ default: ComponentType }>> = {
  "signal-feed": () => import("./signal-feed/page"),
}
