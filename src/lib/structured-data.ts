import { festival } from '@/content/festival';
import { report2025 } from '@/content/report2025';
import { sameAs, siteDescription, siteName, siteUrl } from './site';
import type { LineupArtist } from '@/content/lineup';

const organizer = {
  '@type': 'Organization',
  '@id': `${siteUrl}/#organization`,
  name: 'JAMZA!',
  url: siteUrl,
  logo: `${siteUrl}/icon.png`,
  email: festival.email,
  sameAs,
};

const place = {
  '@type': 'Place',
  name: festival.venue,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '49 Silver St',
    addressLocality: 'Old Ashongman, Accra',
    addressRegion: 'Greater Accra',
    addressCountry: 'GH',
  },
  hasMap: festival.map.link,
};

/** MusicEvent for search results (date, venue, ticket prices). */
export function festivalEvent(artists: LineupArtist[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizer,
      { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: siteUrl, name: siteName, publisher: { '@id': organizer['@id'] } },
      {
        '@type': 'MusicEvent',
        '@id': `${siteUrl}/#event`,
        name: 'JAMZA! FESTIVAL 2026',
        description: siteDescription,
        url: siteUrl,
        image: [`${siteUrl}/opengraph-image`, `${siteUrl}/images/tickets/poster.webp`],
        startDate: '2026-12-19T12:00:00+00:00',
        endDate: '2026-12-20T05:00:00+00:00',
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: place,
        organizer: { '@id': organizer['@id'] },
        inLanguage: 'en',
        isAccessibleForFree: false,
        offers: festival.tickets
          .filter((t) => t.price !== null)
          .map((t) => ({
            '@type': 'Offer',
            name: t.name,
            price: t.price,
            priceCurrency: 'GHS',
            availability: 'https://schema.org/InStock',
            url: festival.ticketUrl ?? `${siteUrl}/#tickets`,
            validFrom: '2026-11-01T00:00:00+00:00',
            ...(t.endsAt ? { validThrough: t.endsAt } : {}),
          })),
        ...(artists.length
          ? {
              performer: artists.map((a) => ({
                '@type': a.name.includes('Band') ? 'MusicGroup' : 'Person',
                name: a.name,
                url: `${siteUrl}/${a.slug}`,
                ...(a.url ? { sameAs: [a.url] } : {}),
              })),
            }
          : {}),
      },
    ],
  };
}

/** The 2025 report as an article by its author. */
export function reportArticle() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Report',
    headline: report2025.title,
    description: report2025.summary,
    url: `${siteUrl}/2025`,
    image: `${siteUrl}/2025/opengraph-image`,
    author: { '@type': 'Person', name: report2025.author },
    publisher: organizer,
    about: { '@type': 'MusicEvent', name: 'JAMZA! 2025', location: place, organizer: { '@id': organizer['@id'] } },
    encoding: { '@type': 'MediaObject', contentUrl: `${siteUrl}${report2025.pdf}`, encodingFormat: 'application/pdf' },
  };
}
