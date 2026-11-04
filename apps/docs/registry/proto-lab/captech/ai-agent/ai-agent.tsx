"use client"

import * as React from "react"
import { ArrowUpIcon, FileTextIcon, PaperclipIcon, SparklesIcon, XIcon } from "lucide-react"

import {
  Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle,
} from "@/registry/proto-lab/ui/attachment"
import { Badge } from "@/registry/proto-lab/ui/badge"
import { Bubble, BubbleContent } from "@/registry/proto-lab/ui/bubble"
import { Button } from "@/registry/proto-lab/ui/button"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@/registry/proto-lab/ui/input-group"
import { Message, MessageContent } from "@/registry/proto-lab/ui/message"
import {
  MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerProvider, MessageScrollerViewport,
} from "@/registry/proto-lab/ui/message-scroller"
import { Sheet, SheetContent, SheetTitle } from "@/registry/proto-lab/ui/sheet"
import { Spinner } from "@/registry/proto-lab/ui/spinner"
import { cn } from "cn"

// An AI agent that docks beside any page: suggested prompts to start, a
// context chip for what the user is looking at, attachments, and replies that
// cite their sources. On wide screens it docks and pushes the page over; on
// narrow screens it opens as a sheet. A floating button brings it back.
// Harvested from the Huntington Capital Markets POC (AI Assistant). The block
// never calls a model itself: `onSend` returns the reply.

export type AgentPrompt = { title: string; description: string; prompt: string }
export type AgentFile = { name: string; size: number }
export type AgentMessage = { id: string; role: "user" | "assistant"; content: string; sources?: string[]; files?: AgentFile[] }
export type AgentReply = { content: string; sources?: string[] }
export type AgentContext = { label: string; detail: string }

type PanelProps = {
  title?: string
  subtitle?: string
  prompts?: AgentPrompt[]
  context?: AgentContext | null
  placeholder?: string
  onSend: (messages: AgentMessage[], context: AgentContext | null) => Promise<AgentReply>
}

const size = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`)
let seq = 0
const nextId = () => `m${++seq}`

export function AgentPanel({
  title = "AI agent",
  subtitle = "Ask about anything on this page",
  prompts = [],
  context: initialContext = null,
  placeholder = "Ask a question",
  onSend,
  onClose,
  className,
  conversation,
}: PanelProps & {
  onClose?: () => void
  className?: string
  /** Pass to keep the conversation when the panel closes (AgentDock does). */
  conversation?: [AgentMessage[], React.Dispatch<React.SetStateAction<AgentMessage[]>>]
}) {
  const own = React.useState<AgentMessage[]>([])
  const [messages, setMessages] = conversation ?? own
  const [draft, setDraft] = React.useState("")
  const [files, setFiles] = React.useState<AgentFile[]>([])
  const [context, setContext] = React.useState<AgentContext | null>(initialContext)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileInput = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => setContext(initialContext), [initialContext])

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || pending) return
    const next = [...messages, { id: nextId(), role: "user" as const, content, files: files.length ? files : undefined }]
    setMessages(next)
    setDraft("")
    setFiles([])
    setError(null)
    setPending(true)
    try {
      const reply = await onSend(next, context)
      setMessages((m) => [...m, { id: nextId(), role: "assistant", ...reply }])
    } catch (e) {
      setError(e instanceof Error ? e.message : "The agent couldn't answer.")
    } finally {
      setPending(false)
    }
  }

  const retry = () => {
    const last = [...messages].reverse().find((m) => m.role === "user")
    if (!last) return
    setMessages((m) => m.slice(0, m.lastIndexOf(last)))
    send(last.content)
  }

  return (
    <section aria-label={title} className={cn("flex h-full min-h-0 flex-col bg-card", className)}>
      <header className="flex items-start gap-3 border-b p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <SparklesIcon className="size-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-subtitle-2">{title}</h2>
          <p className="truncate text-caption-1 text-muted-foreground">{subtitle}</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => { setMessages([]); setError(null) }}>New chat</Button>
        )}
        {onClose && (
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label={`Close ${title}`}>
            <XIcon />
          </Button>
        )}
      </header>

      {context && (
        <div className="flex items-center gap-2 border-b bg-muted/60 px-4 py-2 text-caption-1">
          <Badge variant="secondary">{context.label}</Badge>
          <span className="min-w-0 flex-1 truncate">{context.detail}</span>
          <button type="button" onClick={() => setContext(null)} aria-label="Remove context" className="focus-ring grid size-6 place-items-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <XIcon className="size-3.5" />
          </button>
        </div>
      )}

      <MessageScrollerProvider>
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-4 p-4">
              {messages.length === 0 && (
                <div className="flex flex-col gap-4 py-2">
                  <p className="text-muted-foreground">
                    I can read this page, your CRM and market data, and help you prepare. Try one of these:
                  </p>
                  <ul className="flex flex-col gap-2">
                    {prompts.map((p) => (
                      <li key={p.title}>
                        <button
                          type="button"
                          onClick={() => send(p.prompt)}
                          className="focus-ring flex w-full flex-col gap-0.5 rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary hover:bg-muted/60"
                        >
                          <span className="text-sm font-semibold">{p.title}</span>
                          <span className="text-caption-1 text-muted-foreground">{p.description}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {messages.map((m) => (
                <MessageScrollerItem key={m.id} messageId={m.id}>
                  <Message align={m.role === "user" ? "end" : "start"}>
                    <MessageContent className="gap-2">
                      {m.files && (
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {m.files.map((f) => <Badge key={f.name} variant="outline"><FileTextIcon data-icon="inline-start" />{f.name}</Badge>)}
                        </div>
                      )}
                      <Bubble variant={m.role === "user" ? "default" : "muted"}>
                        <BubbleContent><Rich text={m.content} /></BubbleContent>
                      </Bubble>
                      {m.sources && m.sources.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-caption-1 text-muted-foreground">Sources</span>
                          {m.sources.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                        </div>
                      )}
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              ))}

              {pending && (
                <Message align="start">
                  <MessageContent>
                    <Bubble variant="muted">
                      <BubbleContent className="flex items-center gap-2 text-muted-foreground"><Spinner />Thinking</BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              )}

              {error && (
                <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
                  <span>{error}</span>
                  <Button size="sm" variant="outline" onClick={retry}>Try again</Button>
                </div>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <form
        className="flex flex-col gap-2 border-t p-3"
        onSubmit={(e) => { e.preventDefault(); send(draft) }}
      >
        {files.length > 0 && (
          <AttachmentGroup>
            {files.map((f) => (
              <Attachment key={f.name}>
                <AttachmentMedia><FileTextIcon /></AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{f.name}</AttachmentTitle>
                  <AttachmentDescription>{size(f.size)}</AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions>
                  <AttachmentAction aria-label={`Remove ${f.name}`} onClick={() => setFiles((x) => x.filter((y) => y.name !== f.name))}><XIcon /></AttachmentAction>
                </AttachmentActions>
              </Attachment>
            ))}
          </AttachmentGroup>
        )}
        <InputGroup>
          <InputGroupTextarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(draft) }
            }}
            placeholder={placeholder}
            aria-label={placeholder}
            rows={2}
            className="max-h-40"
          />
          <InputGroupAddon align="block-end" className="justify-between">
            <InputGroupButton size="icon-sm" variant="ghost" aria-label="Attach a file" onClick={() => fileInput.current?.click()}>
              <PaperclipIcon />
            </InputGroupButton>
            <InputGroupButton type="submit" size="icon-sm" variant="default" aria-label="Send" disabled={!draft.trim() || pending}>
              <ArrowUpIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <input
          ref={fileInput}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []).map((f) => ({ name: f.name, size: f.size }))
            setFiles((x) => [...x, ...picked.filter((p) => !x.some((y) => y.name === p.name))])
            e.target.value = ""
          }}
        />
        <p className="text-center text-caption-1 text-muted-foreground">Enter to send, Shift and Enter for a new line.</p>
      </form>
    </section>
  )
}

// Paragraphs and "- " bullet lines, enough for agent replies without a
// markdown dependency.
function Rich({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2">
      {text.split(/\n{2,}/).map((block, i) => {
        const lines = block.split("\n")
        if (lines.every((l) => l.startsWith("- "))) {
          return <ul key={i} className="flex list-disc flex-col gap-1 pl-4">{lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>
        }
        return <p key={i}>{block}</p>
      })}
    </div>
  )
}

function useWide(query = "(min-width: 1024px)") {
  const [wide, setWide] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setWide(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [query])
  return wide
}

// The page plus the agent. Docked beside the page on wide screens, a sheet on
// narrow ones; a floating button opens it whenever it's closed.
export function AgentDock({
  children,
  defaultOpen = false,
  launcherLabel = "AI agent",
  ...panel
}: PanelProps & { children: React.ReactNode; defaultOpen?: boolean; launcherLabel?: string }) {
  const [open, setOpen] = React.useState(defaultOpen)
  const conversation = React.useState<AgentMessage[]>([])
  const wide = useWide()

  return (
    <div className="flex min-h-svh">
      <div className="min-w-0 flex-1">{children}</div>

      {wide && open && (
        <aside className="sticky top-0 h-svh w-[26rem] shrink-0 border-l">
          <AgentPanel {...panel} conversation={conversation} onClose={() => setOpen(false)} />
        </aside>
      )}

      {!wide && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" showCloseButton={false} className="w-full p-0 data-[side=right]:sm:max-w-md">
            <SheetTitle className="sr-only">{panel.title ?? "AI agent"}</SheetTitle>
            <AgentPanel {...panel} conversation={conversation} onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      {!open && (
        <Button size="lg" onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-40 rounded-full px-4 shadow-lg">
          <SparklesIcon data-icon="inline-start" />
          {launcherLabel}
        </Button>
      )}
    </div>
  )
}
