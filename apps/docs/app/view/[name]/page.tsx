import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { blockLoaders } from "@/registry/proto-lab/blocks"
import { captechLoaders } from "@/registry/proto-lab/captech"

const screenLoaders: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  "engagement-workspace": () => import("@/components/showcase/views").then((m) => ({ default: m.WorkspaceView })),
  "account-settings": () => import("@/components/showcase/views").then((m) => ({ default: m.SettingsView })),
}

const loaders = { ...captechLoaders, ...screenLoaders, ...blockLoaders }

// A block on its own page, with no docs chrome. The block gallery frames
// this route so full page layouts render at real size.
export default async function BlockView({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const load = loaders[name]
  if (!load) notFound()
  const { default: Block } = await load()
  return <Block />
}

export function generateStaticParams() {
  return Object.keys(loaders).map((name) => ({ name }))
}

export const metadata: Metadata = { robots: { index: false } }
