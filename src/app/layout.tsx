import type { Metadata, Viewport } from 'next';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${swung.variable} ${epilogue.variable}`}>
      <body className="grain overflow-x-clip">{children}</body>
    </html>
  );
}
