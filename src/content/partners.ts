/**
 * Sponsors & partners from the 2026 campaign poster. Shown until partners are added in the
 * admin dashboard (with logos); as soon as the CMS has any, those are used instead.
 */
export const starterPartners = [
  { name: 'Afrodite Society' },
  { name: 'GTP', tagline: 'Life. Styled.' },
  { name: 'Phyrshaus' },
  { name: 'Picarview' },
  { name: 'Beda’s', tagline: 'Our venue' },
  { name: 'Stonehouse' },
].map((p, i) => ({ id: `starter-${i}`, url: '', image: '', tagline: '', ...p }));
