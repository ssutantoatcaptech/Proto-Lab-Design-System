import { DirectionProvider } from "@/registry/proto-lab/ui/direction"
import { Slider } from "@/registry/proto-lab/ui/slider"

const panels = [
  { dir: "ltr", label: "Left to right", caption: "Utilization" },
  { dir: "rtl", label: "Right to left", caption: "نسبة الاستخدام" },
] as const

export default function DirectionDemo() {
  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-4">
      {panels.map((panel) => (
        <DirectionProvider key={panel.dir} direction={panel.dir}>
          <div dir={panel.dir} className="flex flex-col gap-3 rounded-md border bg-card p-4">
            <span className="text-xs text-muted-foreground">{panel.label}</span>
            <span className="text-sm font-medium">{panel.caption}</span>
            <Slider defaultValue={[60]} aria-label={panel.caption} />
          </div>
        </DirectionProvider>
      ))}
    </div>
  )
}
