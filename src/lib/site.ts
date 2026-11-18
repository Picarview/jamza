import { festival } from '@/content/festival';

/** Canonical origin. Defaults to the domain on the campaign artwork. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://jamzafestival.com').replace(/\/$/, '');

export const siteName = 'JAMZA! FESTIVAL';

export const siteDescription =
  'A festive music experience celebrating women in the arts — Christmas classics, original songs, poetry, a live band and female DJs. Saturday 19 December 2026, 12PM–5AM at Beda’s, Old Ashongman, Accra.';

/** Shared Open Graph fields; pages spread this because Next replaces (not merges) openGraph per page. */
export const baseOpenGraph = {
  type: 'website' as const,
  siteName,
  locale: 'en_GH',
};

export const sameAs = [festival.instagram.url];
