import { FileSpreadsheetIcon, FileTextIcon, XIcon } from "lucide-react"
import {
  Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription,
  AttachmentGroup, AttachmentMedia, AttachmentTitle,
} from "@/registry/proto-lab/ui/attachment"

export default function AttachmentDemo() {
  return (
    <AttachmentGroup className="w-full max-w-lg">
      <Attachment>
        <AttachmentMedia><FileTextIcon /></AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Discovery findings.pdf</AttachmentTitle>
          <AttachmentDescription>2.4 MB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove Discovery findings.pdf"><XIcon /></AttachmentAction>
        </AttachmentActions>
      </Attachment>
      <Attachment state="uploading">
        <AttachmentMedia><FileSpreadsheetIcon /></AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Q3 timesheets.xlsx</AttachmentTitle>
          <AttachmentDescription>Uploading, 64%</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </AttachmentGroup>
  )
}
