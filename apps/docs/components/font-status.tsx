"use client"

import { useEffect, useState } from "react"
import { CheckCircle2Icon, AlertTriangleIcon } from "lucide-react"

// Shows whether Gibson actually loaded, so a missing Adobe Fonts kit is visible
// instead of silently falling back to the system font.
export function FontStatus() {
  const [loaded, setLoaded] = useState<boolean | null>(null)
  useEffect(() => {
    document.fonts.ready.then(() => setLoaded(document.fonts.check('16px "canada-type-gibson"') && [...document.fonts].some((f) => f.family.replace(/"/g, "") === "canada-type-gibson")))
  }, [])
  if (loaded === null) return null
  return (
    <p role="status" className="not-prose my-4 flex items-start gap-2 rounded-lg border p-3 text-sm">
      {loaded ? (
        <><CheckCircle2Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" /><span>Gibson is loaded on this site from Adobe Fonts.</span></>
      ) : (
        <><AlertTriangleIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><span>Gibson isn&apos;t loaded here, so you are seeing the system sans serif. Set <code className="font-mono">ADOBE_FONTS_KIT</code> to the Adobe Fonts web project ID and restart.</span></>
      )}
    </p>
  )
}
