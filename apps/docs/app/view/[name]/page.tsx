import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { blockLoaders } from "@/registry/proto-lab/blocks"

// A block on its own page, with no docs chrome. The block gallery frames
// this route so full page layouts render at real size.
export default async function BlockView({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const load = blockLoaders[name]
  if (!load) notFound()
  const { default: Block } = await load()
  return <Block />
}

export function generateStaticParams() {
  return Object.keys(blockLoaders).map((name) => ({ name }))
}

export const metadata: Metadata = { robots: { index: false } }
