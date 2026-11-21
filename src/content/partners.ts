/**
 * JAMZA! FESTIVAL 2026 sponsors & partners — official list and order from the organisers.
 * Shown until partners are added in the admin dashboard; once the CMS has any, those are used.
 * Logos live in public/images/partners (originals in assets-source/partners).
 */
export const starterPartners = [
  { name: 'Picarview', image: '/images/partners/picarview.webp', url: 'https://picarview.com' },
  { name: 'Wafa House', image: '/images/partners/wafa-house.webp' },
  { name: 'Beda’s Events Center', image: '/images/partners/bedas.webp', tagline: 'Our venue' },
  { name: 'PHYR3HAUS', image: '/images/partners/phyr3haus.webp' },
  { name: 'Afrodite Society', image: '/images/partners/afrodite-society.webp' },
  { name: 'Breaktime_hq', image: '/images/partners/breaktime-hq.webp' },
  { name: 'Stonehouse', image: '/images/partners/stonehouse.webp' },
  { name: 'Kobena Africa', image: '/images/partners/kobena-africa.webp' },
  { name: 'GTP', image: '/images/partners/gtp.webp', tagline: 'Life. Styled.' },
  { name: 'Icewise', image: '/images/partners/icewise.webp' },
  { name: 'Panford', image: '/images/partners/panford.webp' },
].map((p, i) => ({ id: `starter-${i}`, url: '', tagline: '', ...p }));
