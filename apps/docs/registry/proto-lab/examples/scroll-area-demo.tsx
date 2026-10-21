import { ScrollArea } from "@/registry/proto-lab/ui/scroll-area"
import { Separator } from "@/registry/proto-lab/ui/separator"

const findings = [
  "Checkout asks for billing address twice",
  "Search ignores product codes",
  "Order status emails arrive late",
  "Store locator fails on mobile data",
  "Returns policy is hard to find",
  "Loyalty points hidden until checkout",
  "Saved carts expire after one day",
  "Promo codes reject lowercase input",
  "Gift cards cannot combine with sales",
  "Delivery dates shift after payment",
]

export default function ScrollAreaDemo() {
  return (
    <ScrollArea className="h-56 w-72 rounded-md border">
      <div className="p-4">
        <h4 className="mb-3 text-sm font-medium">Usability findings</h4>
        {findings.map((f) => (
          <div key={f}>
            <div className="py-2 text-sm">{f}</div>
            <Separator />
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
