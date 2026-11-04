import type { Match, MatchDimension, MatchMode, MatchResult, MatchSubject } from "./match-finder"

// Sample data for a capital markets coverage desk: a client book of founder
// and family owned companies, and the PE sponsors who might buy them as
// bolt-ons. Every firm and figure is fictional. `runDemoMatch` scores pairs
// with simple, readable rules so each reason on a card is true to the data.
// Replace it with a call to your own model or service.

type Company = { id: string; name: string; sector: string; revenue: number; region: string; ownership: "Founder owned" | "Family owned" | "PE backed"; signals: string[] }
type Sponsor = { id: string; name: string; fund: string; sectors: string[]; revenue: [number, number]; regions: string[]; platforms: Record<string, string>; why: string }

const companies: Company[] = [
  { id: "carver", name: "Carver Precision Machining", sector: "Industrials", revenue: 85, region: "Midwest", ownership: "Founder owned", signals: ["Founder nearing retirement", "Hired a CFO"] },
  { id: "bluegrass", name: "Bluegrass Specialty Pharmacy", sector: "Healthcare", revenue: 140, region: "Southeast", ownership: "Founder owned", signals: ["Second location opened", "Payer contract renewal due"] },
  { id: "lakeshore", name: "Lakeshore HVAC Services", sector: "Business services", revenue: 60, region: "Midwest", ownership: "Family owned", signals: ["Third generation succession"] },
  { id: "tidewater", name: "Tidewater Cold Storage", sector: "Logistics", revenue: 210, region: "Mid-Atlantic", ownership: "Family owned", signals: ["Capacity expansion planned", "Term loan matures 2027"] },
  { id: "piedmont", name: "Piedmont Dental Partners", sector: "Healthcare", revenue: 95, region: "Southeast", ownership: "PE backed", signals: ["Sponsor holding period at five years"] },
  { id: "summitpack", name: "Summit Packaging Co.", sector: "Industrials", revenue: 175, region: "Northeast", ownership: "Founder owned", signals: ["Inbound interest from strategics"] },
]

const sponsors: Sponsor[] = [
  { id: "halvorsen", name: "Halvorsen Equity", fund: "Fund XII ($16B, 2023)", sectors: ["Industrials", "Logistics"], revenue: [75, 250], regions: ["Midwest", "Mid-Atlantic", "Northeast"], platforms: { Industrials: "Keel Industrial", Logistics: "Brightline Logistics" }, why: "Fund XII is 35% deployed and has two LOIs out on industrial carve outs." },
  { id: "northbridge", name: "Northbridge Capital Partners", fund: "Fund VIII ($6B, 2022)", sectors: ["Industrials", "Business services"], revenue: [40, 150], regions: ["Midwest", "Southeast"], platforms: { "Business services": "Corvid Field Services" }, why: "Keel Industrial's refinancing frees up capacity for an add-on in the next two quarters." },
  { id: "redwater", name: "Redwater Growth", fund: "Growth Fund IV ($3B, 2024)", sectors: ["Healthcare"], revenue: [50, 200], regions: ["Southeast", "Mid-Atlantic"], platforms: { Healthcare: "Lumen Health" }, why: "Lumen Health's S-1 means Redwater wants scale in specialty pharmacy before the IPO window." },
  { id: "calderpike", name: "Calder & Pike", fund: "Fund V ($4B, 2021)", sectors: ["Business services", "Logistics"], revenue: [30, 120], regions: ["Midwest", "Northeast"], platforms: { "Business services": "Trellis Facilities" }, why: "Calder & Pike closed its third bolt-on this year and is looking for a fourth before a recap." },
  { id: "summitridge", name: "Summit Ridge Partners", fund: "Healthcare Fund II ($2.4B, 2026)", sectors: ["Healthcare"], revenue: [60, 300], regions: ["Midwest", "Southeast"], platforms: {}, why: "Summit Ridge just held a first close and needs a platform in healthcare services." },
  { id: "ashgrove", name: "Ashgrove Capital", fund: "Fund III ($1.8B, 2022)", sectors: ["Logistics", "Industrials"], revenue: [100, 400], regions: ["Mid-Atlantic", "Southeast", "Northeast"], platforms: { Logistics: "Brightline Logistics" }, why: "Ashgrove is resetting Brightline's covenants and wants accretive volume to support it." },
]

export const dimensions: MatchDimension[] = [
  { id: "sector", label: "Sector fit" },
  { id: "size", label: "Size fit" },
  { id: "geography", label: "Geography" },
  { id: "ownership", label: "Ownership" },
  { id: "strategic", label: "Strategic fit" },
]

const money = (m: number) => (m >= 1000 ? `$${(m / 1000).toFixed(1)}B` : `$${Math.round(m)}M`)

export const modes: MatchMode[] = [
  {
    id: "company",
    label: "I have a company",
    listLabel: "Client book",
    searchPlaceholder: "Search companies",
    runLabel: "Find sponsor matches",
    emptyText: "Pick a client, then run the match to see which sponsors fit best, scored and ranked with the reasons.",
    steps: ["Reading the client profile", "Scoring sponsors on five dimensions", "Writing the pitch for each match"],
    subjects: companies.map((c) => ({ id: c.id, name: c.name, meta: `${c.sector} · ${money(c.revenue)} revenue`, tag: `${c.ownership} · ${c.region}` })),
  },
  {
    id: "sponsor",
    label: "I have a sponsor",
    listLabel: "Sponsors",
    searchPlaceholder: "Search sponsors",
    runLabel: "Find client matches",
    emptyText: "Pick a sponsor, then run the match to see which clients fit their bolt-on themes, scored and ranked with the reasons.",
    steps: ["Reading the sponsor's themes", "Scoring the client book on five dimensions", "Writing the pitch for each match"],
    subjects: sponsors.map((s) => ({ id: s.id, name: s.name, meta: `${s.sectors.join(", ")} · ${money(s.revenue[0])} to ${money(s.revenue[1])}`, tag: s.fund })),
  },
]

function score(c: Company, s: Sponsor): Omit<Match, "id" | "name" | "subtitle"> {
  const platform = s.platforms[c.sector]
  const sector = s.sectors.includes(c.sector)
    ? { score: 9, reason: `${c.sector} is a stated ${s.name} theme.` }
    : { score: 3, reason: `${s.name} doesn't invest in ${c.sector.toLowerCase()}.` }
  const [lo, hi] = s.revenue
  const size = c.revenue >= lo && c.revenue <= hi
    ? { score: 9, reason: `${money(c.revenue)} revenue sits inside the ${money(lo)} to ${money(hi)} target.` }
    : c.revenue >= lo * 0.75 && c.revenue <= hi * 1.25
      ? { score: 6, reason: `${money(c.revenue)} is just outside the ${money(lo)} to ${money(hi)} target.` }
      : { score: 3, reason: `${money(c.revenue)} is far from the ${money(lo)} to ${money(hi)} target.` }
  const geography = s.regions.includes(c.region)
    ? { score: 8, reason: `${s.name} already owns businesses in the ${c.region}.` }
    : { score: 5, reason: `No ${s.name} holdings in the ${c.region} yet.` }
  const ownership = c.ownership === "Founder owned"
    ? { score: 9, reason: "Founder owned businesses are the easiest bolt-ons to approach." }
    : c.ownership === "Family owned"
      ? { score: 8, reason: "Family owned, with a succession question to open on." }
      : { score: 4, reason: "Already PE backed, so this would be a secondary sale." }
  const strategic = platform
    ? { score: 9, reason: `Adds capacity to ${platform}, its current platform.` }
    : sector.score >= 9
      ? { score: 7, reason: `Could be a new ${c.sector.toLowerCase()} platform for ${s.name}.` }
      : { score: 3, reason: "No clear strategic fit." }

  const parts = { sector, size, geography, ownership, strategic }
  const overall = Object.values(parts).reduce((a, p) => a + p.score, 0) / 5
  const deal = c.revenue * (c.sector === "Healthcare" ? 1.6 : 1.1)
  return {
    score: Math.round(overall * 10) / 10,
    why: s.why,
    pitch: platform
      ? `${c.name} gives ${platform} a ${c.region} foothold and ${money(c.revenue)} of revenue to build on.`
      : `${c.name} could anchor a ${c.sector.toLowerCase()} platform for ${s.fund}.`,
    economics: [
      { label: "Our role", value: overall >= 8 ? "Lead left" : "Joint lead" },
      { label: "Deal size", value: money(deal) },
      { label: "Est. fee", value: `$${(deal * 0.02).toFixed(1)}M` },
    ],
    dimensions: parts,
    sources: ["CRM", "PitchBook", "SEC filing"],
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function runDemoMatch(modeId: string, subject: MatchSubject): Promise<MatchResult> {
  await wait(2600)
  if (modeId === "company") {
    const c = companies.find((x) => x.id === subject.id)!
    const matches = sponsors
      .map((s) => ({ id: s.id, name: s.name, subtitle: s.platforms[c.sector] ? `Platform: ${s.platforms[c.sector]}` : "New platform", ...score(c, s) }))
      .filter((m) => m.score >= 6)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
    return { title: c.name, meta: `${c.sector} · ${money(c.revenue)} revenue · ${c.ownership} · ${c.region}`, signals: c.signals, matches }
  }
  const s = sponsors.find((x) => x.id === subject.id)!
  const matches = companies
    .map((c) => ({ id: c.id, name: c.name, subtitle: `${c.sector} · ${money(c.revenue)} · ${c.region}`, ...score(c, s) }))
    .filter((m) => m.score >= 6)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
  return { title: s.name, meta: `${s.fund} · ${s.sectors.join(", ")} · ${money(s.revenue[0])} to ${money(s.revenue[1])}`, signals: [s.why], matches }
}
