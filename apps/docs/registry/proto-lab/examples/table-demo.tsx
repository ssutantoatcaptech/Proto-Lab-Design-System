import {
  Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from "@/registry/proto-lab/ui/table"

const entries = [
  { project: "Retail checkout redesign", practice: "Customer Experience", hours: 16 },
  { project: "Claims data platform", practice: "Data & Analytics", hours: 14 },
  { project: "Operating model review", practice: "Management Consulting", hours: 6 },
  { project: "Policy system integration", practice: "Systems Integration", hours: 4 },
]

export default function TableDemo() {
  return (
    <Table className="max-w-xl">
      <TableCaption>Timesheet for the week of Oct 19.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Practice</TableHead>
          <TableHead className="text-right">Hours</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((e) => (
          <TableRow key={e.project}>
            <TableCell className="font-medium">{e.project}</TableCell>
            <TableCell className="text-muted-foreground">{e.practice}</TableCell>
            <TableCell className="text-right tabular-nums">{e.hours}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right tabular-nums">40</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
