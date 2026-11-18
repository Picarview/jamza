/**
 * JAMZA! FESTIVAL 2026 lineup — official confirmed list from the organisers.
 * Shown until artists are added in the admin dashboard (CMS artists take over when present).
 * Internal booking notes are deliberately not published here.
 * Not yet listed: Abiana (marked "Hold" in the brief).
 */
export type LineupArtist = {
  id: string;
  name: string;
  role: string;
  image: string;
  url: string;
  tier: 'main' | 'guest';
};

const ig = (handle: string) => `https://www.instagram.com/${handle}/`;

const main = [
  ['Susan Augustt', 'susan_augustt'],
  ['Makayy', 'makayy_official'],
  ['Sea', 'sea.ufo'],
  ['Esi Baby', 'esibaby'],
  ['Currie', 'tracy_currie_kanzy'],
  ['Jahzara', 'jahzaraagyemang'],
  ['Riaboss', 'theriaboss'],
  ['Ami', 'ami_tamakloe'],
] as const;

const guests = [
  ['Duafe Adenkum Palmwine Band', 'duafe.adenkum.band', 'Palmwine band'],
  ['Teniadé', 'tenimuse', ''],
  ['Akoto', 'divaakoto', ''], // brief says "Akoto (Ksi)" — confirm billing name
  ['Leuce', 'leuce_777', ''],
  ['Seyram', 'sey.word', 'Poetry'],
  ['Enam', 'enammusic__', ''],
] as const;

export const starterLineup: LineupArtist[] = [
  ...main.map(([name, handle], i) => ({ id: `main-${i}`, name, role: '', image: '', url: ig(handle), tier: 'main' as const })),
  ...guests.map(([name, handle, role], i) => ({ id: `guest-${i}`, name, role, image: '', url: ig(handle), tier: 'guest' as const })),
];
