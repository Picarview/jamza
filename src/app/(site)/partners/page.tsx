import type { Metadata } from 'next';
import { Partners } from '@/components/home/Partners';
import { getPublicContent } from '@/lib/content';
import { baseOpenGraph } from '@/lib/site';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Partners',
  description:
    'The partners making JAMZA! FESTIVAL 2026 happen — Wafa House, Picarview, Beda’s Events Center, PHYR3HAUS, Afrodite Society, Breaktime_hq, Stonehouse, Kobena Africa and GTP.',
  alternates: { canonical: '/partners' },
  openGraph: { ...baseOpenGraph, url: '/partners', title: 'JAMZA! FESTIVAL 2026 — Partners' },
};

export default async function PartnersPage() {
  const { partners } = await getPublicContent();
  return <Partners partners={partners} />;
}
