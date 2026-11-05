import { LegacyBlocksRedirect } from "@/components/legacy-blocks-redirect"
import { categories } from "@/lib/blocks"

// Blocks became Patterns (/patterns). Old links still land in the right place.
export default async function BlocksRedirect({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  return <LegacyBlocksRedirect category={category} />
}

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }))
}
