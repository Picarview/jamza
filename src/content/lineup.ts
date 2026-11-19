/**
 * JAMZA! FESTIVAL 2026 lineup — official confirmed list, bios and photos supplied by the organisers.
 * Each artist gets a page at /<slug>. Internal booking notes are deliberately not published.
 * Not yet listed: Abiana (marked "Hold" in the brief); MVSSY (bio supplied, not on the lineup list).
 */
export type Photo = { src: string; width: number; height: number };

export type LineupArtist = {
  id: string;
  slug: string;
  name: string;
  role: string;
  tier: 'main' | 'guest';
  image: string;
  url: string; // Instagram
  handle: string;
  bio: string[];
  photos: Photo[];
  accent: 'tomato' | 'pine' | 'plum' | 'ember';
};

const ig = (handle: string) => `https://www.instagram.com/${handle}/`;
const photo = (file: string, width: number, height: number): Photo => ({ src: `/images/artists/${file}.webp`, width, height });
const accents = ['tomato', 'pine', 'plum', 'ember'] as const;

type Entry = Omit<LineupArtist, 'id' | 'image' | 'url' | 'accent'>;

const entries: Entry[] = [
  {
    slug: 'susan-augustt',
    name: 'Susan Augustt',
    role: 'Neo Afro-soul vocalist',
    tier: 'main',
    handle: 'susan_augustt',
    photos: [photo('susan-augustt', 934, 1400)],
    bio: [
      'Based in Accra, Susan Augustt is a neo Afro-soul powerhouse whose raw, emotive vocals seamlessly bridge the intimacy of jazz and funk with the infectious energy of her Ga-Ewe and Ashanti roots.',
      'A professional performer for over a decade, she does not just sing; she preserves her heritage, weaving English with Twi and Ga to tell stories that resonate across borders.',
      'Susan is a defining figure in Ghana’s alternative music scene and the founder of the “Augustt in August” annual concert series. A true DIY force of nature, she successfully self-managed two tours across Germany, proving her business acumen matches her vocal prowess.',
    ],
  },
  {
    slug: 'makayy',
    name: 'Makayy',
    role: 'Singer & guitarist · Founder of JAMZA!',
    tier: 'main',
    handle: 'makayy_official',
    photos: [photo('makayy', 1267, 954)],
    bio: [
      'Makayy is a Ghanaian musician, live performer and events planner with a passion for music, creative expression and the arts. As a singer and guitarist, she is drawn to indie, alternative and acoustic music, with a particular interest in instrumental arrangements and percussive sounds.',
      'She has performed at venues and events including Beda’s, Zen Gardens, Accra Art District and Bella Afrikana. Beyond music, she is the founder of JAMZA!, a Ghanaian Christmas cultural festival spotlighting female artists and creatives, and co-founder of AJL Initiative, an instrument training programme equipping women with practical musical skills.',
      'Makayy continues to explore the intersection of music, culture and creative development, and is preparing to release her debut single, “CaNdY,” in 2027.',
    ],
  },
  {
    slug: 'sea',
    name: 'Sea',
    role: 'Alternative Afro, dancehall, R&B & soul',
    tier: 'main',
    handle: 'sea.ufo',
    photos: [photo('sea', 1120, 1400)],
    bio: [
      'SEA THE UFO is a London-born, Accra-based artist of Ghanaian and Jamaican heritage, weaving alternative Afro, Dancehall, R&B and Soul into a genre-bending sound.',
      'With her ethereal, breathy vocals and captivating presence, she balances softness with sensuality, creating music that celebrates individuality and defies convention.',
    ],
  },
  {
    slug: 'esi-baby',
    name: 'Esi Baby',
    role: 'Vocalist',
    tier: 'main',
    handle: 'esibaby',
    photos: [photo('esi-baby', 933, 1400)],
    bio: [],
  },
  {
    slug: 'currie',
    name: 'Currie',
    role: 'Gospel artist',
    tier: 'main',
    handle: 'tracy_currie_kanzy',
    photos: [photo('currie', 719, 1080)],
    bio: [
      'Currie is a rising gospel artist with over nine years of musical experience. Blending contemporary gospel with Afro-inspired sounds, she brings a unique expression to her music, using her gift to inspire, uplift, and connect with people through meaningful songs that reflect faith, hope, and life.',
    ],
  },
  {
    slug: 'jahzara',
    name: 'Jahzara',
    role: 'Co-host & performer',
    tier: 'main',
    handle: 'jahzaraagyemang',
    photos: [photo('jahzara', 1267, 1267), photo('jahzara-2', 1267, 845)],
    bio: [
      'Jahzara! — Diva of Ceremonies and International Host — is bringing the heat from Philadelphia, USA to Ghana! A singer-songwriter, bassist, and frontwoman of The Moonshadow Band, with a wild vibe combination of jazz fusion, funk, yacht rock and house.',
      'Over 20 years of performing, traveling, fashion shows and concerts internationally, she is bringing that big ENERGY to JAMZA! 2026 as our co-host and performer. Jahzara! is affectionately known in Ghana as Obaa Yaa Papabi!',
    ],
  },
  {
    slug: 'riaboss',
    name: 'Riaboss',
    role: 'Vocalist & songwriter',
    tier: 'main',
    handle: 'theriaboss',
    photos: [photo('riaboss', 768, 1024)],
    bio: [
      'A cat that wears many hats, Ria Boss (also known as Cat Mama) is most well known for being a powerhouse vocalist, songwriter and passionate live performer.',
      'She is also deeply rooted in community, having co-founded the live performance showcase and open mic platform “Ria Boss Open Mic”, and serving as the Creative Lead and Programs Facilitator for Black Girls Glow.',
      'Her latest release “Place I go to” is out now, a collaboration with the artist and Black Girls Glow alumni, malaïka. She is currently working on her next album and interdisciplinary project “Heartbreak Hotel” in her home of Accra.',
    ],
  },
  {
    slug: 'ami',
    name: 'Ami',
    role: 'Sound for healing, feeling & joy',
    tier: 'main',
    handle: 'ami_tamakloe',
    photos: [photo('ami', 1080, 1080), photo('ami-2', 720, 1080)],
    bio: [
      'Ami Tamakloe is a multidisciplinary cultural worker who uses sound as a tool for healing, feeling and joy. Whether spoken or sung, hummed or belted.',
    ],
  },
  {
    slug: 'duafe-adenkum-palmwine-band',
    name: 'Duafe Adenkum Palmwine Band',
    role: 'Traditional Akan Adenkum music',
    tier: 'guest',
    handle: 'duafe.adenkum.band',
    photos: [
      photo('duafe-adenkum-palmwine-band', 1179, 1148),
      photo('duafe-adenkum-palmwine-band-2', 1150, 795),
      photo('duafe-adenkum-palmwine-band-3', 1179, 812),
    ],
    bio: [
      'The Duafe Adenkum Band is a traditional Ghanaian music group founded in March 2025 by singer-songwriter Awura-Ama Agyapong, known professionally as Rama Blak.',
      'The group seeks to revive and reintroduce the traditional Akan Adenkum music practice into contemporary spaces, creating performance, skill-building, and income-earning opportunities for young women in Ghana’s music industry.',
    ],
  },
  {
    slug: 'teniade',
    name: 'Teniadé',
    role: 'Afrosoul singer & producer',
    tier: 'guest',
    handle: 'tenimuse',
    photos: [photo('teniade', 853, 1280)],
    bio: [
      'Teniadé is a British-Nigerian afrosoul singer and producer. Her music is an eclectic blend of sultry funk, jazz, soul and afrobeat crafted in Lagos and Accra.',
      'She is greatly inspired by artists such as the legendary Sade, Fela Kuti, Ebo Taylor and Bob Marley.',
    ],
  },
  {
    slug: 'akoto',
    name: 'Akoto', // brief says "Akoto (Ksi)" — confirm billing name; photo & bio to come
    role: 'Special guest',
    tier: 'guest',
    handle: 'divaakoto',
    photos: [],
    bio: [],
  },
  {
    slug: 'leuce',
    name: 'Leuce',
    role: 'Poet, writer & artist · Founder of Break Time',
    tier: 'guest',
    handle: 'leuce_777',
    photos: [photo('leuce', 1266, 1081)],
    bio: [
      'LEUCE is a poet, writer and artist based in Accra, Ghana. She writes the way she thinks, out loud and a little unruly, about death, food, God, grief, and what it means to feed your soul on purpose. Her work lives where poetry meets philosophy, with fashion, makeup, yoga and, lately, music all folded in, because to her they’re just different languages for the same feelings.',
      'She’s the founder of Break Time, a free monthly community space for art, fun, expression and mental health awareness, and she writes for Abysmal Productions, a creative house that makes theatre and projects that talk about the things people usually whisper. Mental health advocacy isn’t a side topic for her. It’s in everything she makes.',
      'Her philosophy is simple: live freely, love openly, and let others do the same.',
    ],
  },
  {
    slug: 'seyram',
    name: 'Seyram',
    role: 'Spoken-word poet',
    tier: 'guest',
    handle: 'sey.word',
    photos: [photo('seyram', 810, 1080)],
    bio: [
      'Seyram Aveh, known as Seyword, is a Ghanaian spoken-word poet, storyteller, and student leader. Her work explores themes of identity, society, patriotism, and personal reflection, with performances including “Gold Coast Echoes” and “Shine Ghana.”',
      'Beyond her creative work, Seyram is passionate about leadership and student advocacy. Through both her art and leadership, she seeks to inspire, empower, and create meaningful conversations within her community.',
    ],
  },
  {
    slug: 'enam',
    name: 'Enam',
    role: 'Afro-spiritual vocalist',
    tier: 'guest',
    handle: 'enammusic__',
    photos: [photo('enam', 1082, 1400)],
    bio: [
      'Enam Keteku Angela, popularly known as Enam (HADZIVODUSHI), is a powerful vocalist from Ghana, West Africa. Her genre of music is called Afro-spiritual, influenced by the Hadzivodushis (sound goddesses) of the “Yeweh shrine”.',
      'Enam started her musical journey from the shrine; her love for music grew stronger when she was singing with her great-grandmothers in the shrines in early childhood. This is not your regular music but chants woven in the frequency and vibrations of a higher dimension, to offer general healing and connection to the cosmic realms and planes.',
      'Enam the HADZIVODUSHI aspires to continue her ancestral genre of music and make it available to the whole world. Despite her versatility over the years, Enam has been mainly consistent and known for her unique smooth vocals and thick blond locs.',
    ],
  },
];

export const lineup: LineupArtist[] = entries.map((e, i) => ({
  ...e,
  id: e.slug,
  image: e.photos[0]?.src ?? '',
  url: ig(e.handle),
  accent: accents[i % accents.length],
}));

export const artistBySlug = (slug: string) => lineup.find((a) => a.slug === slug);
