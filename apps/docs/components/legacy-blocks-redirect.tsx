"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// /blocks/<category>#<name> moved to Patterns. The hash only exists in the
// browser, so this picks the new address client side: the pattern itself
// when a name is given, otherwise the gallery filtered to that category.
const FILTERS: Record<string, string> = {
  captech: "/patterns?source=proto-lab&kind=section",
  dashboard: "/patterns?topic=dashboards",
  sidebar: "/patterns?topic=app-shells",
  login: "/patterns?topic=auth",
  signup: "/patterns?topic=auth",
}

export function LegacyBlocksRedirect({ category }: { category: string }) {
  const router = useRouter()
  useEffect(() => {
    const name = decodeURIComponent(window.location.hash.slice(1))
    router.replace(name ? `/patterns/${name}` : FILTERS[category] ?? "/patterns")
  }, [category, router])
  return <p className="p-10 text-muted-foreground">Patterns moved. Taking you there…</p>
}
