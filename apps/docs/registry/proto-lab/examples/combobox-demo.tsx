"use client"

import {
  Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList,
} from "@/registry/proto-lab/ui/combobox"

const engagements = [
  "Member portal redesign",
  "Claims data platform",
  "Contact center modernization",
  "Pricing strategy assessment",
  "ERP integration",
  "Loyalty program analytics",
]

export default function ComboboxDemo() {
  return (
    <Combobox items={engagements}>
      <ComboboxInput placeholder="Search engagements" aria-label="Engagement" className="w-64" />
      <ComboboxContent>
        <ComboboxEmpty>No engagements match.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
