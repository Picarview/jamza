import type { Metadata, Viewport } from 'next';
import { PillNav } from '@/components/PillNav';
import { Footer } from '@/components/Footer';
import { getPublicContent } from '@/lib/content';
import { starterPartners } from '@/content/partners';
import { baseOpenGraph, siteDescription, siteName, siteUrl } from '@/lib/site';
import { epilogue, swung } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'JAMZA! FESTIVAL 2026 · Sat 19 Dec · Accra',
    template: '%s · JAMZA! FESTIVAL',
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    'JAMZA',
    'JAMZA! FESTIVAL',
    'Christmas concert Accra',
    'Christmas music festival Ghana',
    'female artists Ghana',
    'women in music',
    'female DJs Accra',
    'live music Accra December 2026',
    'Beda’s Old Ashongman',
  ],
  category: 'music',
  creator: 'JAMZA!',
  alternates: { canonical: '/' },
  openGraph: {
    ...baseOpenGraph,
    url: '/',
    title: 'JAMZA! FESTIVAL 2026 — Saturday 19 December, Accra',
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JAMZA! FESTIVAL 2026 — Saturday 19 December, Accra',
    description: siteDescription,
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: '#580e79' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings, partners } = await getPublicContent();
  return (
    <html lang="en" className={`${swung.variable} ${epilogue.variable}`}>
      <body className="grain overflow-x-clip">
        <a
          href="#main"
          className="droplet fixed left-4 top-4 z-[80] -translate-y-24 rounded-full px-4 py-2 font-bold text-plum focus:translate-y-0"
        >
          Skip to content
        </a>
        <PillNav />
        <main id="main">{children}</main>
        <Footer settings={settings} partners={partners.length ? partners : starterPartners} />
      </body>
    </html>
  );
}
