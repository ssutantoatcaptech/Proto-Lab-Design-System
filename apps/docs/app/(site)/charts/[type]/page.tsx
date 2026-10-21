import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cn } from "cn"
import { ChartCard } from "@/components/chart-card"
import { chartCode, chartManifest, chartTypes } from "@/lib/charts"
import { charts } from "@/registry/proto-lab/charts"

type Props = { params: Promise<{ type: string }> }

export default async function ChartsPage({ params }: Props) {
  const { type } = await params
  const current = chartTypes.find((t) => t.slug === type)
  if (!current) notFound()
  const manifest = chartManifest()
  const list = await Promise.all(manifest.charts.filter((c) => c.type === type).map(async (c) => ({ ...c, ...(await chartCode(c.name)) })))

  return (
    <main id="content" className="mx-auto flex max-w-screen-2xl flex-col gap-8 px-4 py-10 md:px-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-title-1">Charts</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          {manifest.charts.length} ready made charts in Proto-Lab colors, ported from shadcn/ui. Copy the code, or install one by name. Built on the{" "}
          <Link href="/docs/components/chart" className="font-semibold text-link underline underline-offset-4">Chart</Link> component and Recharts.
        </p>
      </header>

      <nav aria-label="Chart types" className="flex flex-wrap gap-1.5 border-b pb-4">
        {chartTypes.map((t) => {
          const count = manifest.types.find((m) => m.slug === t.slug)?.count ?? 0
          const active = t.slug === type
          return (
            <Link
              key={t.slug}
              href={`/charts/${t.slug}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-ring flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
            >
              {t.title} <span className="font-normal">{count}</span>
            </Link>
          )
        })}
      </nav>

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => {
          const Chart = charts[c.name]
          return (
            <ChartCard key={c.name} name={c.name} title={c.title} wide={c.wide} code={c.code} raw={c.raw}>
              <Chart />
            </ChartCard>
          )
        })}
      </div>
    </main>
  )
}

export function generateStaticParams() {
  return chartTypes.map((t) => ({ type: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params
  const t = chartTypes.find((x) => x.slug === type)
  return { title: t ? `${t.title} charts` : "Charts" }
}
