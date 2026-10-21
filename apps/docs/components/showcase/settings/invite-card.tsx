"use client"

import * as React from "react"
import { MailIcon, SendIcon, XIcon } from "lucide-react"

import { Badge } from "@/registry/proto-lab/ui/badge"
import { Button } from "@/registry/proto-lab/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/proto-lab/ui/card"
import { Field, FieldError, FieldLabel } from "@/registry/proto-lab/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/proto-lab/ui/input-group"

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function InviteCard() {
  const [value, setValue] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [invites, setInvites] = React.useState<string[]>([
    "lena.marsh@captechconsulting.com",
  ])
  const [sent, setSent] = React.useState<number | null>(null)

  function add(e?: React.FormEvent) {
    e?.preventDefault()
    const email = value.trim().toLowerCase()
    if (!email) {
      setError("Type an email address first.")
      return
    }
    if (!emailPattern.test(email)) {
      setError("That does not look like an email. Try name@company.com.")
      return
    }
    if (invites.includes(email)) {
      setError("That person is already on the list.")
      return
    }
    setInvites((list) => [...list, email])
    setValue("")
    setError(null)
    setSent(null)
  }

  function remove(email: string) {
    setInvites((list) => list.filter((x) => x !== email))
    setSent(null)
  }

  function send() {
    setSent(invites.length)
    setInvites([])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite people</CardTitle>
        <CardDescription>Add colleagues or client partners by email.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={add} aria-label="Add invite">
          <Field data-invalid={!!error || undefined}>
            <FieldLabel htmlFor="invite-email">Email address</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <MailIcon aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                id="invite-email"
                type="text"
                inputMode="email"
                placeholder="alex.chen@client.com"
                value={value}
                aria-invalid={!!error || undefined}
                onChange={(e) => {
                  setValue(e.target.value)
                  setError(null)
                }}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton type="submit" variant="secondary">
                  Add
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {error && <FieldError>{error}</FieldError>}
          </Field>
        </form>
        {invites.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground" aria-live="polite">
            {sent
              ? `${sent} ${sent === 1 ? "invite" : "invites"} sent. Add more above.`
              : "No one queued yet. Add an email above, then send."}
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2" aria-label="Queued invites">
            {invites.map((email) => (
              <li key={email}>
                <Badge variant="secondary" className="h-7 gap-1 pr-1 pl-3 text-xs">
                  {email}
                  <button
                    type="button"
                    onClick={() => remove(email)}
                    aria-label={`Remove ${email}`}
                    className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {invites.length} queued
        </span>
        <Button size="sm" disabled={invites.length === 0} onClick={send}>
          <SendIcon data-icon="inline-start" />
          Send invites
        </Button>
      </CardFooter>
    </Card>
  )
}
