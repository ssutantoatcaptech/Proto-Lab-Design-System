"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

// auto: light by day, dark by night, from the device clock (the default).
// system: whatever the device's appearance setting says.
export type Theme = "auto" | "light" | "dark" | "system"
const KEY = "theme"
export const DAY_START = 7 // 7 AM
export const NIGHT_START = 19 // 7 PM
const query = () => window.matchMedia("(prefers-color-scheme: dark)")

export const isNight = (d = new Date()) => d.getHours() < DAY_START || d.getHours() >= NIGHT_START

// When auto next flips: today or tomorrow at 7 AM or 7 PM.
export function nextSwitch(d = new Date()) {
  const n = new Date(d)
  n.setMinutes(0, 0, 0)
  if (d.getHours() < DAY_START) n.setHours(DAY_START)
  else if (d.getHours() < NIGHT_START) n.setHours(NIGHT_START)
  else { n.setDate(n.getDate() + 1); n.setHours(DAY_START) }
  return n
}

// Runs in <head> before paint so the page never flashes the wrong theme.
export const themeScript = `try{var t=localStorage.getItem("${KEY}")||"auto";var h=new Date().getHours();var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches)||(t==="auto"&&(h<${DAY_START}||h>=${NIGHT_START}));document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){}`

type Ctx = { theme: Theme; resolvedTheme: "light" | "dark"; setTheme: (t: Theme) => void }
const ThemeContext = createContext<Ctx>({ theme: "auto", resolvedTheme: "light", setTheme: () => {} })

const resolve = (theme: Theme): "light" | "dark" =>
  theme === "dark" || (theme === "system" && query().matches) || (theme === "auto" && isNight()) ? "dark" : "light"

function apply(theme: Theme) {
  const resolved = resolve(theme)
  const root = document.documentElement
  if (root.classList.contains("dark") === (resolved === "dark")) return resolved
  // Suppress transitions for one frame so every surface switches together.
  const style = document.createElement("style")
  style.textContent = "*,*::before,*::after{transition:none!important}"
  document.head.appendChild(style)
  root.classList.toggle("dark", resolved === "dark")
  root.style.colorScheme = resolved
  requestAnimationFrame(() => style.remove())
  return resolved
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("auto")
  const [resolvedTheme, setResolved] = useState<"light" | "dark">("light")
  // The saved choice is only known after mount. Until then the auto and
  // system watchers must not run, or they'd overwrite a saved Light or Dark.
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let stored: Theme = "auto"
    try { stored = (localStorage.getItem(KEY) as Theme) || "auto" } catch {}
    setThemeState(stored)
    setResolved(apply(stored))
    setLoaded(true)
  }, [])

  // A framed block (/view) follows the theme chosen in the page around it.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return
      const t = (e.newValue as Theme) || "auto"
      setThemeState(t)
      setResolved(apply(t))
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  // System: follow the device setting as it changes.
  useEffect(() => {
    if (!loaded || theme !== "system") return
    const mq = query()
    const onChange = () => setResolved(apply("system"))
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [theme, loaded])

  // Auto: switch at 7 AM and 7 PM even if the tab stays open, and check again
  // when the tab comes back (timers sleep in background tabs and on sleep).
  useEffect(() => {
    if (!loaded || theme !== "auto") return
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      setResolved(apply("auto"))
      clearTimeout(timer)
      timer = setTimeout(tick, Math.max(1000, nextSwitch().getTime() - Date.now() + 500))
    }
    const onVisible = () => { if (document.visibilityState === "visible") tick() }
    tick()
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", tick)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", tick)
    }
  }, [theme, loaded])

  const setTheme = useCallback((t: Theme) => {
    try { localStorage.setItem(KEY, t) } catch {}
    setThemeState(t)
    setResolved(apply(t))
  }, [])

  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
