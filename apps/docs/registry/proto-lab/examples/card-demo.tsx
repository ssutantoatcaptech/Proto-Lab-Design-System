import { Button } from "@/registry/proto-lab/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/proto-lab/ui/card"

export default function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Discovery workshop</CardTitle>
        <CardDescription>Two days with the client team to map the current journey.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Thursday and Friday, 9:00 to 3:00. Bring the latest research readout.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button>Accept</Button>
        <Button variant="outline">Propose a time</Button>
      </CardFooter>
    </Card>
  )
}
