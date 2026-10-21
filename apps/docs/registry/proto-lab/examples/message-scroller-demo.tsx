import { Bubble, BubbleContent } from "@/registry/proto-lab/ui/bubble"
import { Message, MessageContent } from "@/registry/proto-lab/ui/message"
import {
  MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem,
  MessageScrollerProvider, MessageScrollerViewport,
} from "@/registry/proto-lab/ui/message-scroller"

const messages = [
  { id: "1", mine: false, text: "Kickoff with the claims team is confirmed for Monday." },
  { id: "2", mine: true, text: "Great. I will draft the interview guide today." },
  { id: "3", mine: false, text: "Please add questions on the intake handoff." },
  { id: "4", mine: true, text: "Added. I also booked the journey mapping room." },
  { id: "5", mine: false, text: "Thanks. Can we review findings on Thursday?" },
  { id: "6", mine: true, text: "Yes. I will send the synthesis deck Wednesday night." },
  { id: "7", mine: false, text: "Perfect. Loop in the Data & Analytics lead too." },
]

export default function MessageScrollerDemo() {
  return (
    <MessageScrollerProvider>
      <MessageScroller className="h-72 w-full max-w-md rounded-md border bg-card">
        <MessageScrollerViewport>
          <MessageScrollerContent className="gap-3 p-4">
            {messages.map((m) => (
              <MessageScrollerItem key={m.id} messageId={m.id}>
                <Message align={m.mine ? "end" : "start"}>
                  <MessageContent>
                    <Bubble variant={m.mine ? "default" : "muted"}>
                      <BubbleContent>{m.text}</BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}
