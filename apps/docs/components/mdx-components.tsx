import Link from "next/link"
import type { MDXComponents } from "mdx/types"
import { cn } from "cn"
import { Callout } from "@/components/callout"
import { CodeBlock } from "@/components/code-block"
import { ComponentPreview } from "@/components/component-preview"
import { InstallCommand } from "@/components/install-command"
import {
  AliasTable, ColorTokens, ContrastTable, ElevationScale, MotionTokens, RadiusScale, SpacingScale, TypeRamp,
} from "@/components/token-tables"
import { HeuristicBadges, HeuristicIndex } from "@/components/heuristics"
import { IconGallery } from "@/components/icon-gallery"
import { FontStatus } from "@/components/font-status"
import { UpstreamAlignment } from "@/components/upstream-alignment"
import { ComponentsIndex } from "@/components/components-index"

const heading = (Tag: "h2" | "h3" | "h4", cls: string) =>
  function Heading({ className, ...props }: React.ComponentProps<"h2">) {
    return <Tag className={cn("scroll-mt-20", cls, className)} {...props} />
  }

export const mdxComponents: MDXComponents = {
  h2: heading("h2", "mt-12 mb-4 text-subtitle-1 first:mt-0"),
  h3: heading("h3", "mt-8 mb-3 text-subtitle-2"),
  h4: heading("h4", "mt-6 mb-2 font-semibold"),
  p: ({ className, ...props }) => <p className={cn("my-4 text-base leading-7", className)} {...props} />,
  ul: ({ className, ...props }) => <ul className={cn("my-4 ml-6 list-disc text-base leading-7 [&>li]:mt-2", className)} {...props} />,
  ol: ({ className, ...props }) => <ol className={cn("my-4 ml-6 list-decimal text-base leading-7 [&>li]:mt-2", className)} {...props} />,
  a: ({ className, href = "", ...props }) => {
    const cls = cn("focus-ring rounded-sm font-semibold text-link underline underline-offset-4", className)
    return href.startsWith("/") || href.startsWith("#")
      ? <Link href={href} className={cls} {...props} />
      : <a href={href} className={cls} target="_blank" rel="noreferrer" {...props} />
  },
  strong: ({ className, ...props }) => <strong className={cn("font-semibold", className)} {...props} />,
  hr: () => <hr className="my-8" />,
  blockquote: ({ className, ...props }) => <blockquote className={cn("my-6 border-l-2 pl-4 text-muted-foreground", className)} {...props} />,
  table: ({ className, ...props }) => (
    <div className="my-6 overflow-x-auto rounded-lg border bg-card">
      <table className={cn("w-full text-left text-sm", className)} {...props} />
    </div>
  ),
  thead: ({ className, ...props }) => <thead className={cn("bg-muted text-caption-1 text-muted-foreground", className)} {...props} />,
  tr: ({ className, ...props }) => <tr className={cn("border-b last:border-0", className)} {...props} />,
  th: ({ className, ...props }) => <th className={cn("px-3 py-2 font-semibold", className)} {...props} />,
  td: ({ className, ...props }) => <td className={cn("px-3 py-2 align-top", className)} {...props} />,
  code: ({ className, ...props }) => (
    <code className={cn("font-mono [:not(pre)>&]:rounded-sm [:not(pre)>&]:bg-muted [:not(pre)>&]:px-1 [:not(pre)>&]:py-0.5 [:not(pre)>&]:text-sm", className)} {...props} />
  ),
  pre: (props) => <CodeBlock {...props} />,
  section: ({ className, ...props }) => (
    <section className={cn("rounded-md bg-card px-4 py-6 md:px-8 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)} {...props} />
  ),
  Callout,
  ComponentPreview,
  InstallCommand,
  AliasTable,
  ColorTokens,
  ContrastTable,
  ElevationScale,
  MotionTokens,
  RadiusScale,
  SpacingScale,
  TypeRamp,
  HeuristicBadges,
  HeuristicIndex,
  IconGallery,
  FontStatus,
  UpstreamAlignment,
  ComponentsIndex,
}
