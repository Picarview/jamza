import type { Metadata, Viewport } from 'next';
import { PillNav } from '@/components/PillNav';
import { Footer } from '@/components/Footer';
import { getPublicContent } from '@/lib/content';
import { epilogue, swung } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'jamza — A different perspective.', template: '%s · jamza' },
  description:
    'jamza brings independent artists, bold ideas and creative communities together. JAMZA! FESTIVAL returns Saturday 19 December 2026.',
  icons: { icon: '/images/logo-main.png' },
  openGraph: {
    title: 'JAMZA! FESTIVAL 2026 — Saturday 19 December',
    description: 'A festive music experience celebrating women in the arts.',
    images: ['/images/festival/carousel/01.jpg'],
  },
};

export const viewport: Viewport = { themeColor: '#580e79' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getPublicContent();
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
        <Footer settings={settings} />
      </body>
    </html>
  );
}
