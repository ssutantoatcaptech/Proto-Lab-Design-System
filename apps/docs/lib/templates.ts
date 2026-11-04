export type Template = {
  slug: string
  title: string
  description: string
  image: string
  stack: string[]
  inside: { title: string; description: string }[]
  run: string
  note: string
  source: { label: string; href: string; ref: string }
}

export const templates: Template[] = [
  {
    slug: "huntington-capital-markets",
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
    run: "cd templates/huntington-capital-markets\npython3 -m venv .venv\n.venv/bin/pip install -r requirements.txt\n./start.sh",
    note: "Runs at localhost:5000. AI sections need the bedrock-claude AWS profile or an ANTHROPIC_API_KEY; without them the page loads with fallback content.",
    source: {
      label: "njewell2/huntington-capital-markets-demo",
      href: "https://github.com/njewell2/huntington-capital-markets-demo/tree/Pauls_POC",
      ref: "Pauls_POC @ 8b48fe8",
    },
  },
]
