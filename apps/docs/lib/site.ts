export const site = {
  name: "Proto-Lab",
  description: "CapTech's design system on shadcn/ui: Fluent 2 foundations, CapTech brand, ready for agents.",
  github: "https://github.com/ssutantoatcaptech/Proto-Lab-Design-System",
  nav: [
    { title: "Docs", href: "/docs", match: (p: string) => p === "/docs" || /^\/docs\/(installation|theming|dark-mode|registry|upstream)/.test(p) },
    { title: "Foundations", href: "/docs/foundations/color", match: (p: string) => p.startsWith("/docs/foundations") },
    { title: "Components", href: "/docs/components", match: (p: string) => p.startsWith("/docs/components") },
    { title: "Charts", href: "/charts", match: (p: string) => p.startsWith("/charts") },
    { title: "Blocks", href: "/blocks", match: (p: string) => p.startsWith("/blocks") },
    { title: "Showcase", href: "/showcase", match: (p: string) => p.startsWith("/showcase") },
  ],
}
