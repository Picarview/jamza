import { Footer } from '@/components/Footer';
import { PillNav } from '@/components/PillNav';
import { starterPartners } from '@/content/partners';
import { getPublicContent } from '@/lib/content';

/** Public site chrome: pill nav, main, footer. The admin has its own layout. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings, partners } = await getPublicContent();
  return (
    <>
      <a
        href="#main"
        className="droplet fixed left-4 top-4 z-[80] -translate-y-24 rounded-full px-4 py-2 font-bold text-plum focus:translate-y-0"
      >
        Skip to content
      </a>
      <PillNav />
      <main id="main">{children}</main>
      <Footer settings={settings} partners={partners.length ? partners : starterPartners} />
    </>
  );
}
