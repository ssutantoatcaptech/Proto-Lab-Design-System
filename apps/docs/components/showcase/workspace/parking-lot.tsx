"use client"

import * as React from "react"
import { LightbulbIcon, PlusIcon, XIcon } from "lucide-react"

import { InnovationLightningIllustration } from "@/registry/proto-lab/icons/general"
import { Button } from "@/registry/proto-lab/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/proto-lab/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/registry/proto-lab/ui/empty"
import { Input } from "@/registry/proto-lab/ui/input"

import { useWorkspace } from "./workspace-context"

type Idea = { id: number; text: string }

export function ParkingLot() {
  const { log } = useWorkspace()
  const [ideas, setIdeas] = React.useState<Idea[]>([])
  const [adding, setAdding] = React.useState(false)
  const [draft, setDraft] = React.useState("")
  const nextId = React.useRef(1)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setIdeas((prev) => [...prev, { id: nextId.current++, text }])
    log({ kind: "idea", who: "You", text: `parked an idea: ${text}` })
    setDraft("")
    inputRef.current?.focus()
  }

  const cancel = () => {
    setAdding(false)
    setDraft("")
  }

  const form = adding && (
    <form onSubmit={add} className="flex w-full gap-2">
      <label htmlFor="parking-lot-idea" className="sr-only">
        Idea
      </label>
      <Input
        ref={inputRef}
        id="parking-lot-idea"
        placeholder="Self service plan comparison tool"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && cancel()}
      />
      <Button type="submit" disabled={!draft.trim()}>
        Add
      </Button>
    </form>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Idea parking lot</CardTitle>
        <CardDescription>Ideas from client sessions that are out of scope for now.</CardDescription>
        {ideas.length > 0 && !adding && (
          <CardAction>
            <Button variant="outline" size="icon-sm" aria-label="Add an idea" onClick={() => setAdding(true)}>
              <PlusIcon aria-hidden="true" />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {ideas.length === 0 ? (
          <Empty className="border bg-muted/30">
            <EmptyHeader>
              <EmptyMedia>
                <InnovationLightningIllustration size={64} />
              </EmptyMedia>
              <EmptyTitle>The parking lot is clear</EmptyTitle>
              <EmptyDescription>Capture ideas the client raises so they are ready for the next phase.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {adding ? (
                <>
                  {form}
                  <Button variant="ghost" size="sm" onClick={cancel}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setAdding(true)}>
                  <PlusIcon data-icon="inline-start" aria-hidden="true" />
                  Capture an idea
                </Button>
              )}
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <ul className="flex flex-col gap-2">
              {ideas.map((idea) => (
                <li key={idea.id} className="group/idea flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                  <LightbulbIcon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="min-w-0 flex-1 text-sm">{idea.text}</span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${idea.text}`}
                    className="opacity-0 group-hover/idea:opacity-100 focus-visible:opacity-100"
                    onClick={() => setIdeas((prev) => prev.filter((x) => x.id !== idea.id))}
                  >
                    <XIcon aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
            {form}
            {adding && (
              <Button variant="ghost" size="sm" className="self-end" onClick={cancel}>
                Done
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
