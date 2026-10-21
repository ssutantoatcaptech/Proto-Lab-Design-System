import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/registry/proto-lab/ui/input-otp"
import { Label } from "@/registry/proto-lab/ui/label"

export default function InputOTPDemo() {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="client-code">Client portal code</Label>
      <InputOTP id="client-code" maxLength={6} inputMode="numeric">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <p className="text-sm text-muted-foreground">We sent a 6 digit code to your email.</p>
    </div>
  )
}
