import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { JoinTabs } from '@/components/join/JoinTabs';
import { getPublicContent } from '@/lib/content';
import { baseOpenGraph } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Get involved',
  description:
    'Join the JAMZA! Ticket Sales Team and earn 20% commission, or apply to sell at the JAMZA! FESTIVAL 2026 marketplace (deadline 28 November).',
  alternates: { canonical: '/join' },
  openGraph: { ...baseOpenGraph, url: '/join', title: 'Get involved — JAMZA! FESTIVAL 2026' },
};

export default async function JoinPage() {
  const { settings } = await getPublicContent();
  return (
    <>
      <PageHeader
        eyebrow="JAMZA! FESTIVAL 2026"
        title="Get involved"
        intro="Help us bring the night to life: sell tickets with the team, or show your work at the marketplace."
      />
      <section className="bg-night pb-28 pt-14">
        <JoinTabs vendorDeadline={settings.vendorDeadline} />
      </section>
    </>
  );
}
