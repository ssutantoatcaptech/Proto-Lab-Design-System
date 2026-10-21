export const site = {
  name: "Proto-Lab",
  description: "CapTech's design system on shadcn/ui: Fluent 2 foundations, CapTech brand, ready for agents.",
  github: "https://github.com/ssutantoatcaptech/Proto-Lab-Design-System",
  nav: [
    { title: "Docs", href: "/docs", match: (p: string) => p === "/docs" || /^\/docs\/(installation|theming|dark-mode|registry|agents)/.test(p) },
    { title: "Foundations", href: "/docs/foundations/color", match: (p: string) => p.startsWith("/docs/foundations") },
    { title: "Components", href: "/docs/components/button", match: (p: string) => p.startsWith("/docs/components") },
  ],
}
