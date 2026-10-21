"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, ChevronDownIcon, CopyIcon, ExternalLinkIcon } from "lucide-react"
import { Button } from "@/registry/proto-lab/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/registry/proto-lab/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/proto-lab/ui/tooltip"

type Link = { title: string; url: string }

export function PageActions({ markdown, previous, next }: { markdown: string; previous?: Link; next?: Link }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const prompt = (base: string) => {
    const q = `Read this page from the Proto-Lab design system docs and help me apply it:\n\n${location.href}`
    return `${base}${encodeURIComponent(q)}`
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="flex">
        <Button variant="secondary" onClick={copy} className="rounded-r-none" aria-live="polite">
          {copied ? <CheckIcon /> : <CopyIcon />} {copied ? "Copied" : "Copy Page"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="secondary" size="icon" className="rounded-l-none border-l border-background" aria-label="More ways to use this page" />}>
            <ChevronDownIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={copy}><CopyIcon /> Copy as Markdown</DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(prompt("https://claude.ai/new?q="), "_blank")}>
              <ExternalLinkIcon /> Open in Claude
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(prompt("https://chatgpt.com/?q="), "_blank")}>
              <ExternalLinkIcon /> Open in ChatGPT
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <NavArrow link={previous} label="Previous" icon={<ArrowLeftIcon />} />
      <NavArrow link={next} label="Next" icon={<ArrowRightIcon />} />
    </div>
  )
}

function NavArrow({ link, label, icon }: { link?: Link; label: string; icon: React.ReactNode }) {
  if (!link) {
    return <Button variant="secondary" size="icon" disabled aria-label={`No ${label.toLowerCase()} page`}>{icon}</Button>
  }
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="secondary" size="icon" nativeButton={false} render={<Link href={link.url} aria-label={`${label}: ${link.title}`} />} />}>
        {icon}
      </TooltipTrigger>
      <TooltipContent>{label}: {link.title}</TooltipContent>
    </Tooltip>
  )
}
