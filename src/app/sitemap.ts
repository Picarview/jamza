import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: 'daily', priority: 1, lastModified: new Date() },
    { url: `${siteUrl}/2025`, changeFrequency: 'yearly', priority: 0.6, lastModified: new Date('2026-11-18') },
  ];
}
