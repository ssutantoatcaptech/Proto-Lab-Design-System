"use client"

import { useState } from "react"
import { ExternalLinkIcon, FileIcon, MonitorIcon, RotateCwIcon, SmartphoneIcon, TabletIcon, TerminalIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/registry/proto-lab/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/proto-lab/ui/tooltip"
import { CopyButton } from "@/components/copy-button"

type File = { path: string; raw: string; code: React.ReactNode }

const WIDTHS = [
  { value: "desktop", label: "Desktop", icon: MonitorIcon, width: "100%" },
  { value: "tablet", label: "Tablet (768px)", icon: TabletIcon, width: "768px" },
  { value: "mobile", label: "Mobile (375px)", icon: SmartphoneIcon, width: "375px" },
] as const

function Segmented<T extends string>({ label, value, options, onChange }: {
  label: string
  value: T
  options: { value: T; label: string; icon?: React.ComponentType<{ className?: string }> }[]
  onChange: (v: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-md bg-muted p-0.5">
      {options.map(({ value: v, label: l, icon: Icon }) => {
        const button = (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            aria-label={Icon ? l : undefined}
            onClick={() => onChange(v)}
            className={cn(
              "focus-ring flex h-7 items-center gap-1.5 rounded-sm px-2.5 text-caption-1 font-semibold text-muted-foreground transition-colors hover:text-foreground",
              value === v && "bg-card text-foreground shadow-xs"
            )}
          >
            {Icon ? <Icon className="size-3.5" /> : l}
          </button>
        )
        return Icon ? (
          <Tooltip key={v}>
            <TooltipTrigger render={button} />
            <TooltipContent>{l}</TooltipContent>
          </Tooltip>
        ) : button
      })}
    </div>
  )
}

// One block: a framed live preview (the bare /view route) with a toolbar,
// or its files at the paths a project receives them.
export function BlockFrame({ name, description, height, files }: {
  name: string
  description: string | null
  height: number
  files: File[]
}) {
  const [tab, setTab] = useState<"preview" | "code">("preview")
  const [width, setWidth] = useState<(typeof WIDTHS)[number]["value"]>("desktop")
  const [reload, setReload] = useState(0)
  const [active, setActive] = useState(0)
  const command = `npx shadcn@latest add ${name}`
  const file = files[active]

  return (
    <section id={name} aria-label={name} className="scroll-mt-20 flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <a href={`#${name}`} className="focus-ring w-fit rounded-sm font-semibold hover:underline">{name}</a>
          {description && <p className="text-caption-1 text-muted-foreground">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented label="View" value={tab} onChange={setTab} options={[{ value: "preview", label: "Preview" }, { value: "code", label: "Code" }]} />
          {tab === "preview" && (
            <>
              <Segmented label="Preview width" value={width} onChange={setWidth} options={WIDTHS.map(({ value, label, icon }) => ({ value, label, icon }))} />
              <Tooltip>
                <TooltipTrigger render={<Button variant="ghost" size="icon-sm" onClick={() => setReload((r) => r + 1)} aria-label="Reload preview" />}>
                  <RotateCwIcon />
                </TooltipTrigger>
                <TooltipContent>Reload preview</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger render={<Button variant="ghost" size="icon-sm" nativeButton={false} render={<a href={`/view/${name}`} target="_blank" rel="noreferrer" aria-label="Open in a new tab" />} />}>
                  <ExternalLinkIcon />
                </TooltipTrigger>
                <TooltipContent>Open in a new tab</TooltipContent>
              </Tooltip>
            </>
          )}
          <div className="flex h-8 items-center gap-2 rounded-md border bg-card pl-2.5 pr-1 font-mono text-caption-1">
            <TerminalIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">{command}</span>
            <CopyButton value={command} label="Copy install command" className="size-7" />
          </div>
        </div>
      </div>

      {tab === "preview" ? (
        <div className="overflow-hidden rounded-md border bg-muted">
          <div className="mx-auto transition-[width] duration-200" style={{ width: WIDTHS.find((w) => w.value === width)!.width, maxWidth: "100%" }}>
            <iframe
              key={reload}
              src={`/view/${name}`}
              title={`${name} preview`}
              loading="lazy"
              className="block w-full border-x bg-background first:border-x-0"
              style={{ height }}
            />
          </div>
        </div>
      ) : (
        <div className="grid overflow-hidden rounded-md border bg-card md:grid-cols-[14rem_minmax(0,1fr)]" style={{ height }}>
          <ul aria-label="Files" className="flex gap-1 overflow-x-auto border-b p-2 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r">
            {files.map((f, i) => (
              <li key={f.path} className="shrink-0">
                <button
                  type="button"
                  aria-current={i === active ? "true" : undefined}
                  onClick={() => setActive(i)}
                  className={cn(
                    "focus-ring flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left font-mono text-caption-1 text-muted-foreground hover:bg-muted hover:text-foreground",
                    i === active && "bg-muted text-foreground"
                  )}
                >
                  <FileIcon aria-hidden="true" className="size-3.5 shrink-0" />
                  <span className="truncate" title={f.path}>{f.path}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="relative min-h-0 overflow-auto bg-background">
            <div className="sticky top-0 flex items-center justify-between border-b bg-background px-4 py-2">
              <span className="truncate font-mono text-caption-1 text-muted-foreground">{file.path}</span>
              <CopyButton value={file.raw} label={`Copy ${file.path}`} className="size-7" />
            </div>
            <div className="px-4 py-3 font-mono text-sm [&_pre]:bg-transparent!">{file.code}</div>
          </div>
        </div>
      )}
    </section>
  )
}
