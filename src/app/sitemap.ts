import type { MetadataRoute } from 'next';
import { getPublicContent } from '@/lib/content';
import { siteUrl } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { lineup } = await getPublicContent();
  return [
    { url: `${siteUrl}/`, changeFrequency: 'daily', priority: 1, lastModified: new Date() },
    ...['/visit', '/shop', '/merch', '/join'].map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: 'weekly' as const, priority: 0.8, lastModified: new Date() })),
    { url: `${siteUrl}/partners`, changeFrequency: 'weekly', priority: 0.5, lastModified: new Date() },
    { url: `${siteUrl}/2025`, changeFrequency: 'yearly', priority: 0.6, lastModified: new Date('2026-11-18') },
    ...lineup.map((a) => ({ url: `${siteUrl}/${a.slug}`, changeFrequency: 'weekly' as const, priority: 0.7, lastModified: new Date() })),
  ];
}
