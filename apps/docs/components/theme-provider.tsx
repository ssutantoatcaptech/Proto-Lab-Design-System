"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

export type Theme = "light" | "dark" | "system"
const KEY = "theme"
const query = () => window.matchMedia("(prefers-color-scheme: dark)")

// Runs in <head> before paint so the page never flashes the wrong theme.
export const themeScript = `try{var t=localStorage.getItem("${KEY}")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){}`

type Ctx = { theme: Theme; resolvedTheme: "light" | "dark"; setTheme: (t: Theme) => void }
const ThemeContext = createContext<Ctx>({ theme: "system", resolvedTheme: "light", setTheme: () => {} })

function apply(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && query().matches)
  const root = document.documentElement
  // Suppress transitions for one frame so every surface switches together.
  const style = document.createElement("style")
  style.textContent = "*,*::before,*::after{transition:none!important}"
  document.head.appendChild(style)
  root.classList.toggle("dark", dark)
  root.style.colorScheme = dark ? "dark" : "light"
  requestAnimationFrame(() => style.remove())
  return dark ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [resolvedTheme, setResolved] = useState<"light" | "dark">("light")

  useEffect(() => {
    let stored: Theme = "system"
    try { stored = (localStorage.getItem(KEY) as Theme) || "system" } catch {}
    setThemeState(stored)
    setResolved(document.documentElement.classList.contains("dark") ? "dark" : "light")
  }, [])

  // A framed block (/view) follows the theme chosen in the page around it.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return
      const t = (e.newValue as Theme) || "system"
      setThemeState(t)
      setResolved(apply(t))
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  useEffect(() => {
    if (theme !== "system") return
    const mq = query()
    const onChange = () => setResolved(apply("system"))
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    try { localStorage.setItem(KEY, t) } catch {}
    setThemeState(t)
    setResolved(apply(t))
  }, [])

  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
