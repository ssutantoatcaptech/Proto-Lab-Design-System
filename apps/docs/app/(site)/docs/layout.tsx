// Docs pages render inside SiteShell (components/site-header.tsx), which
// draws the full height sidebar with the logo and puts the header beside it.
// Each content section is its own card (see the page and mdx-components
// "section").
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children
}
