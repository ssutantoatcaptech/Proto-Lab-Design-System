import { AlertCircleIcon, InfoIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/registry/proto-lab/ui/alert"

export default function AlertDemo() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <Alert>
        <InfoIcon />
        <AlertTitle>Workspace shared</AlertTitle>
        <AlertDescription>Everyone on the engagement can now view and comment.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Upload failed</AlertTitle>
        <AlertDescription>The file is over 25 MB. Compress it or share a link instead.</AlertDescription>
      </Alert>
    </div>
  )
}
