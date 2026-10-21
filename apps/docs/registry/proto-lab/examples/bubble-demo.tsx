import { Bubble, BubbleContent, BubbleGroup } from "@/registry/proto-lab/ui/bubble"

export default function BubbleDemo() {
  return (
    <BubbleGroup className="w-full max-w-md">
      <Bubble variant="muted">
        <BubbleContent>Can you share the readout deck before Thursday's workshop?</BubbleContent>
      </Bubble>
      <Bubble align="end">
        <BubbleContent>Yes. I'll post it to the engagement channel by end of day.</BubbleContent>
      </Bubble>
      <Bubble align="end">
        <BubbleContent>It includes the three findings from the call center interviews.</BubbleContent>
      </Bubble>
    </BubbleGroup>
  )
}
