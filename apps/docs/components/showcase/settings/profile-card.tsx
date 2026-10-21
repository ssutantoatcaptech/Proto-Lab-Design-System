"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/registry/proto-lab/ui/avatar"
import { Button } from "@/registry/proto-lab/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/proto-lab/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/registry/proto-lab/ui/field"
import { Input } from "@/registry/proto-lab/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/proto-lab/ui/select"

const practices = [
  { value: "cx", label: "Customer Experience" },
  { value: "da", label: "Data & Analytics" },
  { value: "mc", label: "Management Consulting" },
  { value: "si", label: "Systems Integration" },
]

type Profile = { name: string; email: string; practice: string }

const initial: Profile = {
  name: "Maya Okafor",
  email: "maya.okafor@captechconsulting.com",
  practice: "cx",
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase()
}

export function ProfileCard() {
  const [saved, setSaved] = React.useState<Profile>(initial)
  const [draft, setDraft] = React.useState<Profile>(initial)
  const [justSaved, setJustSaved] = React.useState(false)

  const dirty =
    draft.name !== saved.name || draft.email !== saved.email || draft.practice !== saved.practice
  const nameError = draft.name.trim().length === 0 ? "Enter your name." : null
  const emailError = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())
    ? null
    : "Enter a valid email, like name@captechconsulting.com."
  const valid = !nameError && !emailError
  const practiceLabel = practices.find((p) => p.value === saved.practice)?.label

  function update(patch: Partial<Profile>) {
    setDraft((d) => ({ ...d, ...patch }))
    setJustSaved(false)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dirty || !valid) return
    setSaved({ ...draft, name: draft.name.trim(), email: draft.email.trim() })
    setDraft((d) => ({ ...d, name: d.name.trim(), email: d.email.trim() }))
    setJustSaved(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>How teammates and clients see you.</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" aria-label="Profile">
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials(saved.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">{saved.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                Senior Consultant, {practiceLabel}
              </span>
            </div>
          </div>
          <FieldGroup className="gap-4">
            <Field data-invalid={!!nameError || undefined}>
              <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
              <Input
                id="profile-name"
                value={draft.name}
                aria-invalid={!!nameError || undefined}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Maya Okafor"
              />
              {nameError && <FieldError>{nameError}</FieldError>}
            </Field>
            <Field data-invalid={!!emailError || undefined}>
              <FieldLabel htmlFor="profile-email">Work email</FieldLabel>
              <Input
                id="profile-email"
                type="email"
                value={draft.email}
                aria-invalid={!!emailError || undefined}
                onChange={(e) => update({ email: e.target.value })}
                placeholder="name@captechconsulting.com"
              />
              {emailError && <FieldError>{emailError}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-practice">Practice area</FieldLabel>
              <Select
                items={practices}
                value={draft.practice}
                onValueChange={(v) => v && update({ practice: v as string })}
              >
                <SelectTrigger id="profile-practice" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {practices.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-between gap-3">
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {justSaved ? (
              <span className="inline-flex items-center gap-1 text-success">
                <CheckIcon className="size-3.5" aria-hidden /> Saved
              </span>
            ) : dirty ? (
              "You have unsaved changes."
            ) : (
              "All changes saved."
            )}
          </span>
          <div className="flex gap-2">
            {dirty && (
              <Button type="button" variant="ghost" onClick={() => setDraft(saved)}>
                Reset
              </Button>
            )}
            <Button type="submit" disabled={!dirty || !valid}>
              Save
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
