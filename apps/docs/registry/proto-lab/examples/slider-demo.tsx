import { Slider } from "@/registry/proto-lab/ui/slider"

export default function SliderDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <span className="text-sm font-medium" id="allocation-label">Weekly allocation in hours</span>
      <Slider defaultValue={[32]} max={40} step={4} aria-labelledby="allocation-label" />
    </div>
  )
}
