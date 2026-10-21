import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/registry/proto-lab/ui/carousel"

const findings = [
  { label: "Finding 1", text: "Members call support because claim status is hard to find online." },
  { label: "Finding 2", text: "Agents switch between four systems to answer one billing question." },
  { label: "Finding 3", text: "Half of new members never finish account setup on mobile." },
]

export default function CarouselDemo() {
  return (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {findings.map((f) => (
          <CarouselItem key={f.label}>
            <div className="flex h-40 flex-col justify-center gap-2 rounded-md border bg-card p-6">
              <span className="text-xs font-medium text-primary">{f.label}</span>
              <p className="text-sm">{f.text}</p>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
