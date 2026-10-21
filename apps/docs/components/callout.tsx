import { AlertTriangleIcon, InfoIcon } from "lucide-react"
import { cn } from "cn"

export function Callout({ title, variant = "info", children }: {
  title?: string
  variant?: "info" | "warning"
  children: React.ReactNode
}) {
  const Icon = variant === "warning" ? AlertTriangleIcon : InfoIcon
  return (
    <div
      role="note"
      className={cn(
        "my-6 flex gap-3 rounded-lg border p-4",
        variant === "info" && "border-brand-stroke-2 bg-brand-background-inverted",
        variant === "warning" && "border-warning-stroke bg-warning-subtle"
      )}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", variant === "info" ? "text-brand-foreground-1" : "text-foreground")} />
      <div className="flex flex-col gap-1 [&>p]:m-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className="[&>p]:m-0">{children}</div>
      </div>
    </div>
  )
}
