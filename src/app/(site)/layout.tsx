import { Footer } from '@/components/Footer';
import { PillNav } from '@/components/PillNav';
import { getPublicContent } from '@/lib/content';

// Content comes from Supabase; re-check at most once a minute (admin saves refresh it immediately).
export const revalidate = 60;

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
      <PillNav ticketUrl={settings.ticketUrl} />
      <main id="main">{children}</main>
      <Footer settings={settings} partners={partners} />
    </>
  );
}
