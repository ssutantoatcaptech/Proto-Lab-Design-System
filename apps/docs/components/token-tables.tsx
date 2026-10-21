import { cn } from "cn"
import { Badge } from "@/registry/proto-lab/ui/badge"
import { CopyButton } from "@/components/copy-button"
import { byName, bySection, contrast, tokens, utilityClasses, type Token } from "@/lib/tokens"

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

function Swatch({ value, label }: { value: string; label: string }) {
  return (
    <span
      aria-label={`${label}: ${value}`}
      role="img"
      className="inline-block size-6 rounded-sm border"
      style={{ background: value }}
    />
  )
}

// Swatches render the literal value, so a row looks right whichever theme the site is in.
export function ColorTokens({ section }: { section: string }) {
  const list = bySection(section)
  return (
    <Table head={["Light", "Dark", "Variable", "Utility", "Value (light / dark)", "Use"]}>
      {list.map((t) => (
        <tr key={t.name} className="align-middle">
          <td className="px-3 py-2"><Swatch value={t.light.literal} label="Light" /></td>
          <td className="px-3 py-2"><Swatch value={t.dark.literal} label="Dark" /></td>
          <td className="px-3 py-2"><VarName name={t.name} /></td>
          <td className="px-3 py-2"><Classes t={t} /></td>
          <td className="px-3 py-2 font-mono text-caption-1 text-muted-foreground">
            {t.light.literal}{t.dark.literal !== t.light.literal && <> / {t.dark.literal}</>}
          </td>
          <td className="px-3 py-2 text-caption-1 text-muted-foreground">{t.description}</td>
        </tr>
      ))}
    </Table>
  )
}

// Which Proto-Lab token each shadcn variable points at.
export function AliasTable() {
  const list = bySection("shadcn Aliases").filter((t) => t.type === "color")
  const pretty = (p: string) => p.replace("color.semantic.", "")
  return (
    <Table head={["Preview", "shadcn variable", "Proto-Lab token", "Utility"]}>
      {list.map((t) => (
        <tr key={t.name}>
          <td className="px-3 py-2"><span className="flex gap-1"><Swatch value={t.light.literal} label="Light" /><Swatch value={t.dark.literal} label="Dark" /></span></td>
          <td className="px-3 py-2"><VarName name={t.name} /></td>
          <td className="px-3 py-2 font-mono text-caption-1">{pretty(t.light.chain[1] ?? "")}</td>
          <td className="px-3 py-2"><Classes t={t} /></td>
        </tr>
      ))}
    </Table>
  )
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
  const list = tokens.filter((t) => /^shadow\.\d+$/.test(t.path))
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
      {contrast.map((c) => (
        <tr key={`${c.mode}${c.fg}${c.bg}`} className="align-middle">
          <td className="px-3 py-2 capitalize">{c.mode}</td>
          <td className="px-3 py-2 font-mono text-caption-1">{c.fg}</td>
          <td className="px-3 py-2 font-mono text-caption-1">{c.bg}</td>
          <td className="px-3 py-2 font-mono text-caption-1">{c.ratio.toFixed(2)}:1</td>
          <td className="px-3 py-2 font-mono text-caption-1 text-muted-foreground">{c.min}:1 {c.level === "warn" ? "(UI)" : "(text)"}</td>
          <td className="px-3 py-2">
            <Badge variant={c.pass ? "secondary" : c.level === "error" ? "destructive" : "outline"} className={cn(c.pass && "text-success")}>
              {c.pass ? "Pass" : c.level === "error" ? "Fails AA" : "Below 3:1"}
            </Badge>
          </td>
        </tr>
      ))}
    </Table>
  )
}
