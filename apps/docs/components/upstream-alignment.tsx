import fs from "node:fs"
import path from "node:path"
import Link from "next/link"
import { Badge } from "@/registry/proto-lab/ui/badge"
import { source } from "@/lib/source"

type Row = { name: string; status: "matches" | "differs" | "not-adopted" | "proto-lab-only"; docs: string | null; added?: number; removed?: number }
type Alignment = { upstream: string; style: string; cli: string; summary: Record<string, number>; components: Row[] }

// tooling/shadcn-sync/alignment.json is written by scripts/sync-upstream.js.
const read = (): Alignment =>
  JSON.parse(fs.readFileSync(path.join(process.cwd(), "..", "..", "tooling", "shadcn-sync", "alignment.json"), "utf8"))

const title = (name: string) => name.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")

export function UpstreamAlignment() {
  const a = read()
  const ourPage = (name: string) => source.getPage(["components", name])?.url
  const adopted = a.components.filter((c) => c.status !== "not-adopted")
  const notAdopted = a.components.filter((c) => c.status === "not-adopted")
  const stats = [
    { label: "Match upstream", value: a.summary.matches ?? 0 },
    { label: "Differ from upstream", value: a.summary.differs ?? 0 },
    { label: "Not adopted yet", value: a.summary["not-adopted"] ?? 0 },
  ]

  return (
    <div className="not-prose my-6 flex flex-col gap-6">
      <dl className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-4">
            <dt className="text-caption-1 text-muted-foreground">{s.label}</dt>
            <dd className="text-title-2">{s.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-caption-1 text-muted-foreground">
        Compared against <a className="underline underline-offset-4" href={a.upstream} target="_blank" rel="noreferrer">shadcn/ui</a>, {a.style} style, installed with {a.cli}.
      </p>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-caption-1 text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">Component</th>
              <th scope="col" className="px-3 py-2 font-semibold">Status</th>
              <th scope="col" className="px-3 py-2 font-semibold">Upstream docs</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {adopted.map((c) => {
              const url = ourPage(c.name)
              return (
                <tr key={c.name}>
                  <td className="px-3 py-2">
                    {url ? <Link href={url} className="font-semibold text-link underline underline-offset-4">{title(c.name)}</Link> : title(c.name)}
                  </td>
                  <td className="px-3 py-2">
                    {c.status === "matches" && <Badge variant="secondary" className="text-success">Matches upstream</Badge>}
                    {c.status === "differs" && <Badge variant="outline">Differs: +{c.added} / −{c.removed} lines</Badge>}
                    {c.status === "proto-lab-only" && <Badge variant="outline">Proto-Lab only</Badge>}
                  </td>
                  <td className="px-3 py-2">
                    {c.docs ? <a href={c.docs} target="_blank" rel="noreferrer" className="text-muted-foreground underline underline-offset-4 hover:text-foreground">ui.shadcn.com</a> : "none"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {notAdopted.length > 0 && <div className="flex flex-col gap-2">
        <h3 className="text-subtitle-2">Available upstream, not adopted yet ({notAdopted.length})</h3>
        <p className="text-muted-foreground">These work with the Proto-Lab theme today through <code className="font-mono text-sm">npx shadcn add &lt;name&gt;</code>. They get Proto-Lab docs as they are adopted.</p>
        <ul className="flex flex-wrap gap-1.5">
          {notAdopted.map((c) => (
            <li key={c.name}>
              <Badge variant="outline" render={<a href={c.docs ?? "#"} target="_blank" rel="noreferrer" />}>{title(c.name)}</Badge>
            </li>
          ))}
        </ul>
      </div>}
    </div>
  )
}
