import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import "./docs.css"
import { ThemeProvider, themeScript } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { searchIndex, source } from "@/lib/source"
import { site } from "@/lib/site"

// Gibson is served by Adobe Fonts. Set ADOBE_FONTS_KIT to the web project ID
// (the "abc1234" in use.typekit.net/abc1234.css). Without it, text falls back
// to the system sans serif and the Typography page says so.
const adobeKit = process.env.ADOBE_FONTS_KIT

export const metadata: Metadata = {
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme" strategy="beforeInteractive">{themeScript}</Script>
        {adobeKit && (
          <>
            <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
            <link rel="stylesheet" href={`https://use.typekit.net/${adobeKit}.css`} />
          </>
        )}
      </head>
      <body className="min-h-svh antialiased">
        <ThemeProvider>
          <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:shadow-md">
            Skip to content
          </a>
          <SiteHeader tree={source.getPageTree()} search={searchIndex()} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
