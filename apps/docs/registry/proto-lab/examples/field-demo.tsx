import {
  Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet,
} from "@/registry/proto-lab/ui/field"
import { Input } from "@/registry/proto-lab/ui/input"

export default function FieldDemo() {
  return (
    <FieldSet className="w-full max-w-sm">
      <FieldLegend>Log time</FieldLegend>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="project-code">Project code</FieldLabel>
          <Input id="project-code" placeholder="CX-2041" />
          <FieldDescription>Find it on the engagement overview.</FieldDescription>
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="hours">Hours</FieldLabel>
          <Input id="hours" defaultValue="26" aria-invalid />
          <FieldError>Enter 24 hours or fewer for a single day.</FieldError>
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}
