import type {Metadata} from 'next'
import { unstable_cache } from 'next/cache'
import {Golos_Text} from 'next/font/google'
import Script from 'next/script'
import { AppShell } from '@/components/app-shell'
import {
  DEFAULT_OG_IMAGE_PATH,
  SITE_BRAND,
  SITE_DEFAULT_TITLE,
  SITE_DESCRIPTION,
  SITE_URL,
  absoluteUrl,
} from "@/lib/seo"
import { sidebarCaseItemsQuery } from '@/lib/sanity/queries'
import { sanityClient } from '@/lib/sanity/client'
import type { SidebarCaseItem } from '@/lib/sanity/types'
import { TooltipProvider } from '@/ui-kit'
import './globals.css'

const golosText = Golos_Text({
  variable: '--font-golos-text',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_DEFAULT_TITLE,
    template: `%s | ${SITE_BRAND}`,
  },
  description: SITE_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: SITE_BRAND,
    title: SITE_DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    images: [{ url: absoluteUrl(DEFAULT_OG_IMAGE_PATH) }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
  },
}

const getSidebarCaseItems = unstable_cache(
  async () => sanityClient.fetch<SidebarCaseItem[]>(sidebarCaseItemsQuery),
  ['sidebar-case-items'],
  { revalidate: 300 }
)

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const sidebarCaseItems = await getSidebarCaseItems()

  return (
    <html lang="ru">
      <body className={golosText.variable}>
        <TooltipProvider>
          <AppShell sidebarCaseItems={sidebarCaseItems}>{children}</AppShell>
        </TooltipProvider>
        <Script
          src="https://timeweb.cloud/api/v1/cloud-ai/agents/627a97d4-e893-4f60-92eb-f5462dd08092/embed.js?collapsed=true"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
