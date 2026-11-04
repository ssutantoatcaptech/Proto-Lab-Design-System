// Starter: built on Proto-Lab, clone it and build on it.
// Reference: a snapshot of past work with its own styling. Read it for
// patterns worth turning into CapTech blocks; don't copy its CSS.
export type TemplateKind = "starter" | "reference"

export const KINDS: Record<TemplateKind, { label: string; meaning: string }> = {
  starter: { label: "Starter", meaning: "Built on Proto-Lab. Clone it and build on it." },
  reference: { label: "Reference", meaning: "Past work with its own styling. Read it for patterns; don't copy its CSS." },
}

export type Template = {
  slug: string
  kind: TemplateKind
  title: string
  description: string
  image: string
  stack: string[]
  inside: { title: string; description: string }[]
  run: string
  repo: string
  note: string
  source: { label: string; href: string; ref: string }
  intake: {
    contributors: string
    clientBrand: string | null
    harvest: string[]
  }
}

export const templates: Template[] = [
  {
    slug: "huntington-capital-markets",
    kind: "reference",
    title: "Huntington Capital Markets AI",
    description:
      "A banker's daily workspace for sponsor coverage: ranked deal signals, briefings, sponsor matching and an AI assistant, built for a client offsite demo.",
    image: "/templates/huntington-capital-markets.jpg",
    stack: ["Python", "Flask", "Claude on Bedrock", "Docker", "Showcase ready"],
    inside: [
      { title: "Sponsor briefing", description: "Call prep packs assembled from CRM, filings and market data." },
      { title: "Bolt-on scout", description: "Matches founder owned clients to private equity add-on themes." },
      { title: "Opportunity scanner", description: "Ranked deal signals with fee estimates and confidence." },
      { title: "Leadership view", description: "Pipeline and coverage roll-up for the division head." },
    ],
    repo: "https://github.com/captechconsulting/Proto-Lab-Design-System/tree/shadcn-foundation/templates/huntington-capital-markets",
    run: "cd templates/huntington-capital-markets\npython3 -m venv .venv\n.venv/bin/pip install -r requirements.txt\n./start.sh",
    note: "Runs at localhost:5000. AI sections need the bedrock-claude AWS profile or an ANTHROPIC_API_KEY; without them the page loads with fallback content.",
    source: {
      label: "njewell2/huntington-capital-markets-demo",
      href: "https://github.com/njewell2/huntington-capital-markets-demo/tree/Pauls_POC",
      ref: "Pauls_POC @ 8b48fe8",
    },
    intake: {
      contributors: "Steve Sutanto, Nathan Jewell, Paul Given, Genie Donnelly and others",
      clientBrand: "Huntington (own green palette, DM Sans and Source Serif)",
      harvest: ["Greeting hero with KPI strip", "Ranked signal cards with filter, sort and group", "AI briefing with sources", "Docked AI assistant"],
    },
  },
]
