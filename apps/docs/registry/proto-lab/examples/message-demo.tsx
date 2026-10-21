import { Avatar, AvatarFallback } from "@/registry/proto-lab/ui/avatar"
import { Bubble, BubbleContent } from "@/registry/proto-lab/ui/bubble"
import { Message, MessageAvatar, MessageContent, MessageGroup, MessageHeader } from "@/registry/proto-lab/ui/message"

export default function MessageDemo() {
  return (
    <MessageGroup className="w-full max-w-md gap-4">
      <Message>
        <MessageAvatar>
          <Avatar><AvatarFallback>PN</AvatarFallback></Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Priya Natarajan</MessageHeader>
          <Bubble variant="muted">
            <BubbleContent>Can you share the workshop findings before Thursday?</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <Bubble>
            <BubbleContent>Yes. The synthesis deck goes out tomorrow morning.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  )
}
