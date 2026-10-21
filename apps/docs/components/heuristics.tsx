import Link from "next/link"
import { Badge } from "@/registry/proto-lab/ui/badge"
import { heuristics, heuristicUrl } from "@/lib/heuristics"
import { source } from "@/lib/source"

export function HeuristicBadges({ ids }: { ids: number[] }) {
  return (
    <ul aria-label="Usability heuristics this component supports" className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <li key={id}>
          <Badge variant="outline" render={<Link href={heuristicUrl(id)} />} title={heuristics[id - 1].name}>
            H{id} {heuristics[id - 1].short}
          </Badge>
        </li>
      ))}
    </ul>
  )
}

// Components whose page is tagged with this heuristic, from their frontmatter.
export function HeuristicIndex({ id }: { id: number }) {
  const pages = source.getPages().filter((p) => p.data.heuristics?.includes(id))
  if (!pages.length) return <p className="my-4 text-muted-foreground">No component pages are tagged with this heuristic yet.</p>
  return (
    <p className="my-4 text-base leading-7">
      <span className="text-muted-foreground">Components: </span>
      {pages.map((p, i) => (
        <span key={p.url}>
          {i > 0 && ", "}
          <Link href={p.url} className="focus-ring rounded-sm font-semibold text-link underline underline-offset-4">{p.data.title}</Link>
        </span>
      ))}
    </p>
  )
}
