import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from "@/registry/proto-lab/ui/code-block"

const code = `SELECT practice_area, SUM(hours) AS billable_hours
FROM timesheets
WHERE billable = TRUE
GROUP BY practice_area
ORDER BY billable_hours DESC;`

export default function CodeBlockDemo() {
  return (
    <CodeBlock className="max-w-lg">
      <CodeBlockHeader>
        <CodeBlockTitle>billable-hours.sql</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={code} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers>{code}</CodeBlockContent>
    </CodeBlock>
  )
}
