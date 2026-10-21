// Renders registry components and writes their computed styles into #out,
// which scripts/e2e-registry.js reads from headless Chrome.
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CxCustomerExperienceIllustration } from "@/components/captech-icons/practice-areas"

const probe = (sel: string) => {
  const s = getComputedStyle(document.querySelector(sel) as HTMLElement)
  return {
    height: s.height, radius: s.borderTopLeftRadius, font: s.fontFamily, weight: s.fontWeight,
    size: s.fontSize, lineHeight: s.lineHeight, bg: s.backgroundColor, color: s.color,
  }
}

export default function App() {
  const [out, setOut] = useState("")
  useEffect(() => {
    document.fonts.ready.then(() => setOut(JSON.stringify({
      button: probe("#btn"),
      input: probe("#input"),
      card: probe("#card"),
      darkButton: probe("#dark-btn"),
      darkCard: probe("#dark-card"),
      body: probe("body"),
      gibsonLoaded: [...document.fonts].some((f) => f.family.replace(/"/g, "") === "canada-type-gibson"),
      icon: getComputedStyle(document.querySelector("#icon path") as Element).fill,
      darkIcon: getComputedStyle(document.querySelector("#dark-icon path") as Element).fill,
    })))
  }, [])
  return (
    <div className="flex max-w-md flex-col gap-4 p-6">
      <Button id="btn">Save</Button>
      <CxCustomerExperienceIllustration id="icon" title="Customer Experience" />
      <Input id="input" placeholder="name@captechconsulting.com" />
      <Card id="card">
        <CardHeader>
          <CardTitle>Card</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>
      <div className="dark bg-background p-4">
        <Button id="dark-btn">Dark</Button>
        <Card id="dark-card"><CardContent>Dark card</CardContent></Card>
        <CxCustomerExperienceIllustration id="dark-icon" />
      </div>
      <pre id="out">{out}</pre>
    </div>
  )
}
