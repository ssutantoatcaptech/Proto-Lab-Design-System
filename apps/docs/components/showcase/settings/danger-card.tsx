"use client"

import * as React from "react"
import { ArchiveIcon, ArchiveRestoreIcon, TriangleAlertIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/proto-lab/ui/alert-dialog"
import { Button } from "@/registry/proto-lab/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/proto-lab/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/registry/proto-lab/ui/field"
import { Input } from "@/registry/proto-lab/ui/input"

const WORKSPACE = "riverbank-cx"

export function DangerCard() {
  const [open, setOpen] = React.useState(false)
  const [typed, setTyped] = React.useState("")
  const [archived, setArchived] = React.useState(false)
  const matches = typed.trim() === WORKSPACE

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setTyped("")
  }

  function archive(e?: React.FormEvent) {
    e?.preventDefault()
    if (!matches) return
    setArchived(true)
    onOpenChange(false)
  }

  return (
    <Card className="ring-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <TriangleAlertIcon className="size-4" aria-hidden />
          Danger zone
        </CardTitle>
        <CardDescription>Actions here affect everyone in the workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        {archived ? (
          <div className="flex flex-col gap-3 rounded-lg bg-muted p-4" aria-live="polite">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Riverbank CX is archived</span>
              <span className="text-xs text-muted-foreground">
                The workspace is read only. You can restore it for 30 days.
              </span>
            </div>
            <Button variant="outline" size="sm" className="self-start" onClick={() => setArchived(false)}>
              <ArchiveRestoreIcon data-icon="inline-start" />
              Restore workspace
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 rounded-lg border border-destructive/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Archive workspace</span>
              <span className="text-xs text-muted-foreground">
                Freezes files, boards and timesheets for Riverbank CX.
              </span>
            </div>
            <AlertDialog open={open} onOpenChange={onOpenChange}>
              <AlertDialogTrigger render={<Button variant="destructive" className="shrink-0" />}>
                <ArchiveIcon data-icon="inline-start" />
                Archive
              </AlertDialogTrigger>
              <AlertDialogContent>
                <form onSubmit={archive} className="grid gap-4">
                  <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive-subtle text-destructive">
                      <ArchiveIcon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Archive Riverbank CX?</AlertDialogTitle>
                    <AlertDialogDescription>
                      All 5 members lose edit access. Billing stops at the end of the month.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Field>
                    <FieldLabel htmlFor="archive-confirm">
                      Type {WORKSPACE} to confirm
                    </FieldLabel>
                    <Input
                      id="archive-confirm"
                      value={typed}
                      autoComplete="off"
                      placeholder={WORKSPACE}
                      onChange={(e) => setTyped(e.target.value)}
                    />
                    <FieldDescription className="text-xs">
                      {typed.length > 0 && !matches
                        ? "Not a match yet. Check the spelling."
                        : "The button unlocks when the name matches."}
                    </FieldDescription>
                  </Field>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction type="submit" variant="destructive" disabled={!matches}>
                      Archive workspace
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </form>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
