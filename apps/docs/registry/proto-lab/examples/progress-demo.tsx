import { Progress, ProgressLabel, ProgressValue } from "@/registry/proto-lab/ui/progress"

export default function ProgressDemo() {
  return (
    <Progress value={68} className="w-full max-w-sm">
      <ProgressLabel>Discovery interviews</ProgressLabel>
      <ProgressValue />
    </Progress>
  )
}
