import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import "./docs.css"
import { ThemeProvider, themeScript } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { searchIndex, source } from "@/lib/source"
import { site } from "@/lib/site"

// shadcn convention for Next.js: next/font defines --font-sans, the theme reads it.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <Script id="theme" strategy="beforeInteractive">{themeScript}</Script>
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
