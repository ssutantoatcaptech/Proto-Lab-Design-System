import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/registry/proto-lab/ui/accordion"

const questions = [
  {
    value: "scope",
    title: "What does a discovery engagement include?",
    body: "Two weeks of stakeholder interviews, a current state journey map, and a prioritized list of opportunities.",
  },
  {
    value: "team",
    title: "Who staffs the engagement?",
    body: "An engagement lead from Customer Experience, plus a data analyst from Data & Analytics when metrics are in scope.",
  },
  {
    value: "next",
    title: "What happens after the readout?",
    body: "We agree on one or two pilots and scope them as a follow on statement of work.",
  },
]

export default function AccordionDemo() {
  return (
    <Accordion defaultValue={["scope"]} className="w-full max-w-md">
      {questions.map((q) => (
        <AccordionItem key={q.value} value={q.value}>
          <AccordionTrigger>{q.title}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{q.body}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
