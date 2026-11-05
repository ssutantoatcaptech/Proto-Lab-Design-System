#!/usr/bin/env node
/**
 * pattern-shots.mjs
 *
 * Takes a light and a dark thumbnail of every pattern for the Patterns
 * gallery: opens /view/<slug> in headless Chrome at 1440x900, captures the
 * top of the page at half scale, and writes
 * apps/docs/public/patterns/<slug>-{light,dark}.jpg.
 *
 * Needs the docs site running (npm run docs:dev). Usage:
 *   node scripts/pattern-shots.mjs                       every pattern
 *   node scripts/pattern-shots.mjs signal-feed login-01  only these
 *   DOCS_URL=http://localhost:5191 node scripts/pattern-shots.mjs
 */

import { spawn } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const DOCS = path.join(ROOT, "apps", "docs")
const OUT = path.join(DOCS, "public", "patterns")
const BASE = process.env.DOCS_URL ?? "http://localhost:5191"
const PORT = 9400 + Math.floor(Math.random() * 200)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Same sources as apps/docs/lib/patterns.ts.
function slugs() {
  const captech = JSON.parse(fs.readFileSync(path.join(DOCS, "registry", "proto-lab", "captech", "registry-items.json"), "utf8")).map((i) => i.name)
  const upstream = Object.keys(JSON.parse(fs.readFileSync(path.join(DOCS, "registry", "proto-lab", "blocks", "manifest.json"), "utf8")).blocks)
  return [...captech, "engagement-workspace", "account-settings", ...upstream]
}

function findChrome() {
  const candidates = [
    process.env.CHROME,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean)
  const hit = candidates.find((c) => fs.existsSync(c))
  if (!hit) throw new Error("Chrome not found. Set CHROME to its path.")
  return hit
}

async function main() {
  const wanted = process.argv.slice(2)
  const list = wanted.length ? slugs().filter((s) => wanted.includes(s)) : slugs()
  fs.mkdirSync(OUT, { recursive: true })

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "pattern-shots-"))
  const chrome = spawn(findChrome(), ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--window-size=1440,900", "--hide-scrollbars", "about:blank"], { stdio: "ignore" })
  try {
    let target
    for (let i = 0; i < 75 && !target; i++) {
      try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === "page") } catch {}
      await sleep(200)
    }
    if (!target) throw new Error("Chrome didn't start.")
    const ws = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((r, j) => { ws.addEventListener("open", r); ws.addEventListener("error", j) })
    let id = 0
    const pending = new Map()
    ws.addEventListener("message", (e) => {
      const m = JSON.parse(e.data)
      if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
    })
    const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
    await send("Page.enable")
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })

    for (const theme of ["light", "dark"]) {
      // Set the theme before any page script runs (the head script reads it
      // before paint), and hide the Next.js dev badge from the shots.
      const { result } = await send("Page.addScriptToEvaluateOnNewDocument", {
        source: `try{localStorage.setItem("theme","${theme}")}catch(e){};document.addEventListener("DOMContentLoaded",()=>{const s=document.createElement("style");s.textContent="nextjs-portal{display:none!important}";document.head.appendChild(s)})`,
      })
      for (const slug of list) {
        await send("Page.navigate", { url: `${BASE}/view/${slug}` })
        await sleep(3500)
        const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 80, clip: { x: 0, y: 0, width: 1440, height: 900, scale: 0.5 } })
        if (!shot.result?.data) { console.log(`  ✗ ${slug} (${theme})`); continue }
        fs.writeFileSync(path.join(OUT, `${slug}-${theme}.jpg`), Buffer.from(shot.result.data, "base64"))
        console.log(`  ✓ ${slug} (${theme})`)
      }
      await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: result.identifier })
    }
    ws.close()
  } finally {
    chrome.kill()
    fs.rmSync(profile, { recursive: true, force: true })
  }
  console.log(`\n  ${list.length} patterns, light and dark, in ${path.relative(ROOT, OUT)}`)
}

main().catch((e) => { console.error(e.message); process.exit(1) })
