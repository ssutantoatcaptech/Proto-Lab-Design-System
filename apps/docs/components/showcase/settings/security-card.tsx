"use client"

import * as React from "react"
import { cn } from "cn"
import { CheckCircle2Icon, ShieldCheckIcon } from "lucide-react"

import { Badge } from "@/registry/proto-lab/ui/badge"
import { Button } from "@/registry/proto-lab/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/proto-lab/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/registry/proto-lab/ui/field"
import { Input } from "@/registry/proto-lab/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/registry/proto-lab/ui/input-otp"
import { Progress } from "@/registry/proto-lab/ui/progress"
import { Separator } from "@/registry/proto-lab/ui/separator"

function strength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong"]

function PasswordForm() {
  const [current, setCurrent] = React.useState("")
  const [next, setNext] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [touched, setTouched] = React.useState({ current: false, next: false, confirm: false })
  const [updated, setUpdated] = React.useState(false)

  const score = strength(next)
  const currentError = current.length === 0 ? "Enter your current password." : null
  const nextError =
    next.length < 8
      ? "Use at least 8 characters."
      : next === current
        ? "Choose a password you have not used here."
        : null
  const confirmError = confirm !== next || confirm.length === 0 ? "Passwords do not match." : null
  const valid = !currentError && !nextError && !confirmError

  const show = {
    current: touched.current && currentError,
    next: touched.next && nextError,
    confirm: touched.confirm && confirmError,
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ current: true, next: true, confirm: true })
    if (!valid) return
    setCurrent("")
    setNext("")
    setConfirm("")
    setTouched({ current: false, next: false, confirm: false })
    setUpdated(true)
  }

  return (
    <form onSubmit={onSubmit} aria-label="Change password" className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Field data-invalid={!!show.current || undefined}>
          <FieldLabel htmlFor="pw-current">Current password</FieldLabel>
          <Input
            id="pw-current"
            type="password"
            autoComplete="current-password"
            value={current}
            aria-invalid={!!show.current || undefined}
            onChange={(e) => {
              setCurrent(e.target.value)
              setUpdated(false)
            }}
            onBlur={() => setTouched((t) => ({ ...t, current: true }))}
          />
          {show.current && <FieldError>{currentError}</FieldError>}
        </Field>
        <Field data-invalid={!!show.next || undefined}>
          <FieldLabel htmlFor="pw-new">New password</FieldLabel>
          <Input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            value={next}
            aria-invalid={!!show.next || undefined}
            aria-describedby="pw-strength"
            onChange={(e) => {
              setNext(e.target.value)
              setUpdated(false)
            }}
            onBlur={() => setTouched((t) => ({ ...t, next: true }))}
          />
          <div id="pw-strength" className="flex flex-col gap-1">
            <Progress
              value={next ? (score / 4) * 100 : 0}
              aria-label="Password strength"
              className={cn(
                score <= 1 && "**:data-[slot=progress-indicator]:bg-destructive",
                score === 2 && "**:data-[slot=progress-indicator]:bg-warning",
                score >= 3 && "**:data-[slot=progress-indicator]:bg-success"
              )}
            />
            <span className="text-xs text-muted-foreground">
              {next ? `Strength: ${strengthLabel[score]}` : "Use 12 or more characters with a number and a symbol."}
            </span>
          </div>
          {show.next && <FieldError>{nextError}</FieldError>}
        </Field>
        <Field data-invalid={!!show.confirm || undefined}>
          <FieldLabel htmlFor="pw-confirm">Confirm new password</FieldLabel>
          <Input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            aria-invalid={!!show.confirm || undefined}
            onChange={(e) => {
              setConfirm(e.target.value)
              setTouched((t) => ({ ...t, confirm: true }))
              setUpdated(false)
            }}
          />
          {show.confirm && <FieldError>{confirmError}</FieldError>}
        </Field>
      </FieldGroup>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs" aria-live="polite">
          {updated && (
            <span className="inline-flex items-center gap-1 text-success">
              <CheckCircle2Icon className="size-3.5" aria-hidden /> Password updated
            </span>
          )}
        </span>
        <Button type="submit" variant="outline">
          Update password
        </Button>
      </div>
    </form>
  )
}

function TwoStep({ onVerified, verified }: { onVerified: () => void; verified: boolean }) {
  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  function verify(value = code) {
    if (value.length < 6) {
      setError("Enter all 6 digits.")
      return
    }
    if (value === "123456") {
      setError(null)
      onVerified()
    } else {
      setError("That code did not match. Try again.")
    }
  }

  if (verified) {
    return (
      <div className="flex items-start gap-3 rounded-lg bg-success-subtle p-3 text-sm">
        <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">Two step verification is on</span>
          <span className="text-xs text-muted-foreground">
            You will enter a code from your authenticator app at sign in.
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Field data-invalid={!!error || undefined}>
        <FieldLabel htmlFor="otp-code">Authenticator code</FieldLabel>
        <FieldDescription className="text-xs">
          Enter the 6 digit code from your app. For this demo, use 123456.
        </FieldDescription>
        <div className="flex flex-wrap items-center gap-3">
          <InputOTP
            id="otp-code"
            maxLength={6}
            value={code}
            inputMode="numeric"
            pattern="^[0-9]*$"
            aria-invalid={!!error || undefined}
            onChange={(v) => {
              setCode(v)
              setError(null)
            }}
            onComplete={(v: string) => verify(v)}
          >
            <InputOTPGroup>
              {[0, 1, 2].map((i) => (
                <InputOTPSlot key={i} index={i} aria-invalid={!!error || undefined} />
              ))}
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              {[3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} aria-invalid={!!error || undefined} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <Button type="button" size="sm" onClick={() => verify()}>
            Verify
          </Button>
        </div>
        {error && <FieldError>{error}</FieldError>}
      </Field>
    </div>
  )
}

export function SecurityCard() {
  const [verified, setVerified] = React.useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Keep your CapTech account protected.</CardDescription>
        <CardAction>
          {verified ? (
            <Badge className="bg-success-subtle text-success">Protected</Badge>
          ) : (
            <Badge variant="outline">Action needed</Badge>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <PasswordForm />
        <Separator />
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium">Two step verification</h3>
            {verified && (
              <Button variant="ghost" size="sm" onClick={() => setVerified(false)}>
                Turn off
              </Button>
            )}
          </div>
          <TwoStep verified={verified} onVerified={() => setVerified(true)} />
        </div>
      </CardContent>
    </Card>
  )
}
