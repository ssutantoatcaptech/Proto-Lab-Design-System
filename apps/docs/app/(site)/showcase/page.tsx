import { redirect } from "next/navigation"

// Examples became screens in Patterns.
export default function ShowcasePage() {
  redirect("/patterns?kind=screen&source=proto-lab")
}
