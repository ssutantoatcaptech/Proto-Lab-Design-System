import { cn } from "cn"
import { Badge } from "@/registry/proto-lab/ui/badge"
import { CopyButton } from "@/components/copy-button"
import { ColorTokenView, type ColorRow } from "@/components/color-token-view"
import { allTokens, byName, bySection, contrastResults, utilityClasses, type Token } from "@/lib/tokens"

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="not-prose my-6 overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-left">
        <thead className="bg-muted text-caption-1 text-muted-foreground">
          <tr>{head.map((h) => <th key={h} scope="col" className="px-3 py-2 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  )
}

function VarName({ name }: { name: string }) {
  return (
    <span className="group/var inline-flex items-center gap-1">
      <code className="font-mono text-caption-1">{name}</code>
      <CopyButton value={`var(${name})`} label={`Copy var(${name})`} className="size-6 opacity-0 focus-visible:opacity-100 group-hover/var:opacity-100" />
    </span>
  )
}

function Classes({ t }: { t: Token }) {
  const cls = utilityClasses(t)
  return cls.length ? <code className="font-mono text-caption-1">{cls.join(", ")}</code> : <span className="text-muted-foreground">none</span>
}


// Rows for the color grid and table views (components/color-token-view.tsx).
const canvas = (mode: "light" | "dark") => byName("--background")![mode].literal
const PREFIX_DROP = /^--(neutral|brand|status|color)-/
const humanize = (name: string) => {
  const s = name.replace(PREFIX_DROP, "").replace(/^--/, "").replace(/-/g, " ")
  return s.charAt(0).toUpperCase() + s.slice(1)
}
const toRow = (t: Token): ColorRow => ({
  name: t.name,
  label: humanize(t.name),
  light: t.light.literal,
  dark: t.dark.literal,
  canvasLight: canvas("light"),
  canvasDark: canvas("dark"),
  note: t.description,
  utility: utilityClasses(t)[0] ?? null,
})

export function ColorTokens({ section }: { section: string }) {
  return <ColorTokenView rows={bySection(section).map(toRow)} />
}

// Which Proto-Lab token each shadcn variable points at.
export function AliasTable() {
  const rows = bySection("shadcn Aliases").filter((t) => t.type === "color").map((t) => ({
    ...toRow(t),
    source: (t.light.chain[1] ?? "").replace("color.semantic.", ""),
  }))
  return <ColorTokenView rows={rows} alias />
}

const STYLE_ORDER = ["display", "large-title", "title-1", "title-2", "title-3", "subtitle-1", "subtitle-2", "body-2", "body-1", "body-1-stronger", "caption-1", "caption-1-strong", "caption-1-stronger", "caption-2", "caption-2-strong"]

export function TypeRamp() {
  return (
    <Table head={["Style", "Sample", "Size / line height / weight", "Utility"]}>
      {STYLE_ORDER.map((s) => {
        const size = byName(`--font-size-${s}`)!
        const lh = byName(`--line-height-${s}`)!
        const weight = byName(`--font-weight-${s}`)!
        return (
          <tr key={s} className="align-middle">
            <td className="px-3 py-2 font-mono text-caption-1">{s}</td>
            <td className="max-w-80 truncate px-3 py-2" style={{ fontSize: size.light.literal, lineHeight: lh.light.literal, fontWeight: Number(weight.light.literal) }}>
              Proto-Lab
            </td>
            <td className="px-3 py-2 font-mono text-caption-1 text-muted-foreground">{size.light.literal} / {lh.light.literal} / {weight.light.literal}</td>
            <td className="px-3 py-2"><Classes t={size} /></td>
          </tr>
        )
      })}
    </Table>
  )
}

const SPACING_CLASS: Record<string, string> = {
  none: "0", xxs: "0.5", xs: "1", "s-nudge": "1.5", s: "2", "m-nudge": "2.5", m: "3", l: "4", xl: "5", xxl: "6", xxxl: "8",
}

export function SpacingScale() {
  return (
    <Table head={["Token", "Value", "Tailwind step", "Scale"]}>
      {bySection("Spacing").map((t) => {
        const key = t.name.replace("--spacing-", "")
        return (
          <tr key={t.name} className="align-middle">
            <td className="px-3 py-2"><VarName name={t.name} /></td>
            <td className="px-3 py-2 font-mono text-caption-1 text-muted-foreground">{t.light.literal}</td>
            <td className="px-3 py-2 font-mono text-caption-1">p-{SPACING_CLASS[key]}, gap-{SPACING_CLASS[key]}, m-{SPACING_CLASS[key]}</td>
            <td className="px-3 py-2"><span className="block h-3 rounded-sm bg-primary" style={{ width: t.light.literal }} /></td>
          </tr>
        )
      })}
    </Table>
  )
}

export function RadiusScale() {
  return (
    <div className="not-prose my-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
      {bySection("Corner Radius").map((t) => (
        <div key={t.name} className="flex flex-col gap-2 rounded-lg border bg-card p-4">
          <div className="h-16 border-2 border-primary bg-brand-background-inverted" style={{ borderRadius: t.light.literal }} />
          <VarName name={t.name} />
          <span className="font-mono text-caption-1 text-muted-foreground">{t.light.literal} · {utilityClasses(t).join(", ")}</span>
        </div>
      ))}
    </div>
  )
}

export function ElevationScale() {
  const list = allTokens().filter((t) => /^shadow\.\d+$/.test(t.path))
  return (
    <div className="not-prose my-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
      {list.map((t) => (
        <div key={t.name} className="flex flex-col gap-3">
          <div className="grid h-24 place-items-center rounded-lg bg-card text-caption-1 text-muted-foreground" style={{ boxShadow: `var(${t.name})` }}>
            {t.name.replace("--shadow-", "Elevation ")}
          </div>
          <VarName name={t.name} />
          <span className="text-caption-1 text-muted-foreground">{t.description?.replace(/^Elevation \d+\s*\S\s*/, "")} · {utilityClasses(t).join(", ")}</span>
        </div>
      ))}
    </div>
  )
}

export function MotionTokens() {
  return (
    <Table head={["Token", "Value", "Utility"]}>
      {bySection("Motion").map((t) => (
        <tr key={t.name}>
          <td className="px-3 py-2"><VarName name={t.name} /></td>
          <td className="px-3 py-2 font-mono text-caption-1 text-muted-foreground">{t.light.literal}</td>
          <td className="px-3 py-2"><Classes t={t} /></td>
        </tr>
      ))}
    </Table>
  )
}

export function ContrastTable() {
  return (
    <Table head={["Mode", "Text or mark", "On", "Ratio", "Needs", "Result"]}>
      {contrastResults().map((c) => (
        <tr key={`${c.mode}${c.fg}${c.bg}`} className="align-middle">
          <td className="px-3 py-2 capitalize">{c.mode}</td>
          <td className="px-3 py-2 font-mono text-caption-1">{c.fg}</td>
          <td className="px-3 py-2 font-mono text-caption-1">{c.bg}</td>
          <td className="px-3 py-2 font-mono text-caption-1">{c.ratio.toFixed(2)}:1</td>
          <td className="px-3 py-2 font-mono text-caption-1 text-muted-foreground">{c.min}:1 {c.level === "warn" ? "(UI)" : "(text)"}</td>
          <td className="px-3 py-2">
            <Badge variant="outline" className={cn(c.pass ? "text-success" : c.level === "error" ? "text-destructive" : "text-foreground")}>
              {c.pass ? "Pass" : c.level === "error" ? "Fails AA" : "Below 3:1"}
            </Badge>
          </td>
        </tr>
      ))}
    </Table>
  )
}
