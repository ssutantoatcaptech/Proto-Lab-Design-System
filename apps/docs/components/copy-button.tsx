"use client"

import { useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/registry/proto-lab/ui/button"

export function CopyButton({ value, getValue, label = "Copy", className }: {
  value?: string
  getValue?: () => string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn("text-muted-foreground hover:text-foreground", className)}
      aria-label={copied ? "Copied" : label}
      onClick={async () => {
        await navigator.clipboard.writeText(value ?? getValue?.() ?? "")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span className="sr-only" aria-live="polite">{copied ? "Copied" : ""}</span>
    </Button>
  )
}
