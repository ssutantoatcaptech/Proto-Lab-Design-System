"use client"

import { Badge } from "@/registry/proto-lab/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/proto-lab/ui/card"

import { AgentDock } from "./ai-agent"
import { context, demoReply, prompts } from "./ai-agent-data"

// A stand-in account page with the agent docked beside it.
export default function AiAgentPage() {
  return (
    <AgentDock
      defaultOpen
      title="AI agent"
      subtitle="Ask about sponsors, deals and markets"
      prompts={prompts}
      context={context}
      placeholder="Ask about your pipeline"
      onSend={demoReply}
    >
      <main className="flex flex-col gap-6 p-4 md:p-8">
        <header className="flex flex-col gap-1">
          <span className="text-caption-1-strong text-muted-foreground">Sponsor account</span>
          <h1 className="text-title-2">Halvorsen Equity</h1>
          <p className="text-muted-foreground">Fund XII ($16B, 2023) · Industrials and logistics · 35% deployed</p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Lead left acquisition financing</CardTitle>
            <CardDescription>TLB, revolver and ABL for an industrial carve out. Two LOIs in market.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge>High</Badge>
            <Badge variant="outline">CRM</Badge>
            <Badge variant="secondary">$7.2M est. fee · 84% confidence</Badge>
          </CardContent>
        </Card>
        <p className="max-w-prose text-muted-foreground">
          The agent docks beside the page on wide screens and opens as a sheet on narrow ones. Close it and the floating button brings it back.
        </p>
      </main>
    </AgentDock>
  )
}
