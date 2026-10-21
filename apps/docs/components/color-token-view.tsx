"use client"

import { useEffect, useState } from "react"
import { LayoutGridIcon, Rows3Icon } from "lucide-react"
import { cn } from "cn"
import { CopyButton } from "@/components/copy-button"

export type ColorRow = {
  name: string // CSS variable, e.g. --neutral-background-1
  label: string // human name, e.g. Background 1
  light: string // literal value
  dark: string
  canvasLight: string // page color each value sits on (for translucent colors)
  canvasDark: string
  note?: string | null
  utility?: string | null
  source?: string | null // for aliases: the Proto-Lab token it points at
}

type View = "grid" | "table"
const KEY = "proto-lab:color-view"
const EVENT = "proto-lab:color-view"

// Grid or table, shared by every token view on the page, kept in the URL so a
// link opens in the same view, and remembered for the next visit.
function readView(): View {
  const fromUrl = new URLSearchParams(window.location.search).get("view")
  if (fromUrl === "grid" || fromUrl === "table") return fromUrl
  try { return localStorage.getItem(KEY) === "table" ? "table" : "grid" } catch { return "grid" }
}

function useView(): [View, (v: View) => void] {
  const [view, setView] = useState<View>("grid")
  useEffect(() => {
    setView(readView())
    const sync = () => setView(readView())
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
  }, [])
  const choose = (v: View) => {
    try { localStorage.setItem(KEY, v) } catch {}
    const p = new URLSearchParams(window.location.search)
    if (v === "grid") p.delete("view")
    else p.set("view", v)
    const qs = p.toString()
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`)
    window.dispatchEvent(new Event(EVENT))
  }
  return [view, choose]
}

export function ViewToggle() {
  const [view, choose] = useView()
  const options = [
    { value: "grid" as const, label: "Grid", icon: LayoutGridIcon },
    { value: "table" as const, label: "Table", icon: Rows3Icon },
  ]
  return (
    <div className="not-prose my-4 flex items-center gap-3">
      <span className="text-caption-1 text-muted-foreground">View</span>
      <div role="radiogroup" aria-label="Color view" className="inline-flex rounded-md bg-muted p-0.5">
        {options.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={view === value}
            onClick={() => choose(value)}
            className={cn(
              "focus-ring flex h-7 items-center gap-1.5 rounded-sm px-2.5 text-caption-1 font-semibold text-muted-foreground transition-colors hover:text-foreground",
              view === value && "bg-card text-foreground shadow-xs"
            )}
          >
            <Icon aria-hidden="true" className="size-3.5" /> {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// Translucent values are shown composited over the page they sit on.
const paint = (value: string, canvas: string) => `linear-gradient(${value}, ${value}), ${canvas}`

function Dot({ value, canvas }: { value: string; canvas: string }) {
  return <span aria-hidden="true" className="size-3 shrink-0 rounded-full border" style={{ background: paint(value, canvas) }} />
}

function Card({ row }: { row: ColorRow }) {
  const same = row.light === row.dark
  return (
    <li className="flex flex-col overflow-hidden rounded-md border bg-card">
      <div className="flex h-24 border-b" role="img" aria-label={same ? `${row.label}: ${row.light}` : `${row.label}: ${row.light} in light, ${row.dark} in dark`}>
        <div className="flex-1" style={{ background: paint(row.light, row.canvasLight) }} />
        {!same && <div className="flex-1" style={{ background: paint(row.dark, row.canvasDark) }} />}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold">{row.label}</span>
            <CopyButton value={`var(${row.name})`} label={`Copy var(${row.name})`} className="-mr-2 -mt-1.5 size-7" />
          </div>
          <code className="truncate font-mono text-caption-1 text-muted-foreground" title={row.name}>{row.name}</code>
        </div>
        <dl className="flex flex-col gap-1 text-caption-1">
          {same ? (
            <div className="flex items-center gap-2">
              <dt className="text-muted-foreground">Both modes</dt>
              <dd className="ml-auto truncate font-mono" title={row.light}>{row.light}</dd>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Dot value={row.light} canvas={row.canvasLight} />
                <dt className="text-muted-foreground">Light</dt>
                <dd className="ml-auto truncate font-mono" title={row.light}>{row.light}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Dot value={row.dark} canvas={row.canvasDark} />
                <dt className="text-muted-foreground">Dark</dt>
                <dd className="ml-auto truncate font-mono" title={row.dark}>{row.dark}</dd>
              </div>
            </>
          )}
        </dl>
        {row.source ? (
          <p className="mt-auto flex flex-col gap-0.5 border-t pt-3 text-caption-1 text-muted-foreground">
            <span>Maps to</span>
            <code className="truncate whitespace-nowrap font-mono text-foreground" title={row.source}>{row.source}</code>
          </p>
        ) : row.note ? (
          <p className="mt-auto border-t pt-3 text-caption-1 text-muted-foreground">{row.note}</p>
        ) : null}
      </div>
    </li>
  )
}

function Swatch({ value, canvas, label }: { value: string; canvas: string; label: string }) {
  return <span role="img" aria-label={`${label}: ${value}`} className="inline-block size-6 rounded-sm border" style={{ background: paint(value, canvas) }} />
}

export function ColorTokenView({ rows, alias = false }: { rows: ColorRow[]; alias?: boolean }) {
  const [view] = useView()
  if (view === "grid") {
    return (
      <ul className="not-prose my-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => <Card key={r.name} row={r} />)}
      </ul>
    )
  }
  const head = alias ? ["Preview", "shadcn variable", "Proto-Lab token", "Utility"] : ["Light", "Dark", "Variable", "Utility", "Value (light / dark)", "Use"]
  return (
    <div className="not-prose my-6 overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-left">
        <thead className="bg-muted text-caption-1 text-muted-foreground">
          <tr>{head.map((h) => <th key={h} scope="col" className="px-3 py-2 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => alias ? (
            <tr key={r.name} className="align-middle">
              <td className="px-3 py-2"><span className="flex gap-1"><Swatch value={r.light} canvas={r.canvasLight} label="Light" /><Swatch value={r.dark} canvas={r.canvasDark} label="Dark" /></span></td>
              <td className="px-3 py-2 font-mono text-caption-1">{r.name}</td>
              <td className="px-3 py-2 font-mono text-caption-1">{r.source}</td>
              <td className="px-3 py-2 font-mono text-caption-1">{r.utility ?? "none"}</td>
            </tr>
          ) : (
            <tr key={r.name} className="align-middle">
              <td className="px-3 py-2"><Swatch value={r.light} canvas={r.canvasLight} label="Light" /></td>
              <td className="px-3 py-2"><Swatch value={r.dark} canvas={r.canvasDark} label="Dark" /></td>
              <td className="px-3 py-2 font-mono text-caption-1">{r.name}</td>
              <td className="px-3 py-2 font-mono text-caption-1">{r.utility ?? "none"}</td>
              <td className="px-3 py-2 font-mono text-caption-1 text-muted-foreground">{r.light}{r.dark !== r.light && <> / {r.dark}</>}</td>
              <td className="px-3 py-2 text-caption-1 text-muted-foreground">{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
