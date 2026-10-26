"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "cn"

export type TocItem = { title: string; url: string; depth: number }

const OFFSET = 80 // matches the headings' scroll-mt-20
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

// Highlights the heading currently in view, like ui.shadcn.com's "On This Page".
export function DocsToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.url ?? null)
  // While a click scroll runs, the observer would light up every section it
  // passes, so it's ignored until the scroll lands or the reader takes over.
  const scrolling = useRef(false)
  const frame = useRef(0)

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(decodeURIComponent(i.url.slice(1))))
      .filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrolling.current) return
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(`#${visible[0].target.id}`)
      },
      { rootMargin: "-80px 0px -70% 0px" }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items])

  useEffect(() => {
    // Wheel, touch or keys stop a click scroll so the reader is never fought.
    const stop = () => { cancelAnimationFrame(frame.current); scrolling.current = false }
    const opts = { passive: true }
    window.addEventListener("wheel", stop, opts)
    window.addEventListener("touchstart", stop, opts)
    window.addEventListener("keydown", stop)
    return () => {
      stop()
      window.removeEventListener("wheel", stop)
      window.removeEventListener("touchstart", stop)
      window.removeEventListener("keydown", stop)
    }
  }, [])

  function go(e: React.MouseEvent<HTMLAnchorElement>, url: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    const el = document.getElementById(decodeURIComponent(url.slice(1)))
    if (!el) return
    e.preventDefault()
    setActive(url)
    history.replaceState(null, "", url)

    const start = window.scrollY
    const max = document.documentElement.scrollHeight - window.innerHeight
    const end = Math.min(max, Math.max(0, el.getBoundingClientRect().top + start - OFFSET))
    const distance = end - start
    const land = () => { scrolling.current = false; el.focus({ preventScroll: true }) }
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1")

    cancelAnimationFrame(frame.current)
    if (Math.abs(distance) < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, end)
      land()
      return
    }
    // Longer trips take a little longer, within 300 to 700ms.
    const duration = Math.min(700, Math.max(300, Math.abs(distance) * 0.4))
    const t0 = performance.now()
    scrolling.current = true
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      window.scrollTo(0, start + distance * ease(t))
      if (t < 1) frame.current = requestAnimationFrame(step)
      else land()
    }
    frame.current = requestAnimationFrame(step)
  }

  if (!items.length) return null
  return (
    <nav aria-label="On this page" className="flex flex-col gap-2">
      <h4 className="text-caption-1 text-muted-foreground">On This Page</h4>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.url} style={{ paddingLeft: `${Math.max(0, item.depth - 2) * 12}px` }}>
            <a
              href={item.url}
              onClick={(e) => go(e, item.url)}
              aria-current={active === item.url ? "location" : undefined}
              className={cn(
                "focus-ring block rounded-sm text-muted-foreground transition-colors hover:text-foreground",
                active === item.url && "text-foreground"
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
