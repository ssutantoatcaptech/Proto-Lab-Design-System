"use client"

import { useRef } from "react"
import { cn } from "cn"
import { CopyButton } from "@/components/copy-button"

export function CodeBlock({ className, title, children, ...props }: React.ComponentProps<"pre"> & { title?: string }) {
  const ref = useRef<HTMLPreElement>(null)
  return (
    <figure className="group relative my-6 overflow-hidden rounded-lg border bg-background">
      {title && (
        <figcaption className="flex h-10 items-center border-b px-4 font-mono text-caption-1 text-muted-foreground">{title}</figcaption>
      )}
      <pre ref={ref} className={cn("overflow-x-auto py-3 pl-4 pr-12 font-mono text-sm", className)} {...props}>
        {children}
      </pre>
      <CopyButton getValue={() => ref.current?.innerText ?? ""} label="Copy code" className="absolute right-2 top-1.5" />
    </figure>
  )
}
