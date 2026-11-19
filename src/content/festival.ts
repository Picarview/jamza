/**
 * JAMZA! FESTIVAL 2026 — copy taken from the official carousel creative.
 * Fill in the TODO fields as soon as they are confirmed; the site adapts automatically.
 */
export const festival = {
  name: 'JAMZA! FESTIVAL',
  edition: '2026',
  // Ghana is on GMT all year.
  startsAt: '2026-12-19T12:00:00Z',
  hours: '12PM – 5AM',
  dressCode: 'Purple, cream, red or green',
  // Official colours. Wear any of them, or combine them in African print.
  dressColours: [
    { name: 'Purple', hex: '#580e79' },
    { name: 'Cream', hex: '#fff9f3' },
    { name: 'Red', hex: '#d23a35' },
    { name: 'Green', hex: '#00843d' },
  ],
  dateLabel: 'Saturday 19th December 2026',
  shortDate: 'Sat 19 Dec',
  venue: 'Beda’s Events Center' as string | null,
  city: 'Old Ashongman, Accra',
  map: {
    // Google Maps listing: “Beda’s Pub and Events Center, 49 Silver St, Accra”.
    link: 'https://maps.app.goo.gl/Ziuqqabna1kwERDH6',
    directions:
      'https://www.google.com/maps/dir/?api=1&destination=Beda%E2%80%99s+Pub+and+Events+Center%2C+49+Silver+St%2C+Accra',
    embed:
      'https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1sBeda%E2%80%99s+Pub+and+Events+Center,+49+Silver+St,+Accra!6i16',
  },
  // Official contact. Placeholder addresses in the admin Settings fall back to this.
  email: 'jamzafestival@gmail.com',
  credit: { name: 'Picarview', url: 'https://picarview.com' as string | null },
  // Official socials. A value set in the admin dashboard (Settings) takes priority.
  instagram: { url: 'https://www.instagram.com/jamza_festival/', handle: '@jamza_festival' },
  ticketUrl: null as string | null, // TODO: checkout link — until then, ticket buttons scroll to #tickets
  currency: 'GHC',
  tickets: [
    {
      id: 'early-bird',
      name: 'Early Bird',
      price: 75,
      note: '11–25 Nov',
      endsAt: '2026-11-25T23:59:59Z',
      featured: true,
    },
    { id: 'student', name: 'Student', price: 55, note: 'Till 18 Dec', endsAt: '2026-12-18T23:59:59Z' },
    { id: 'regular', name: 'Regular', price: 100, note: '26 Nov – 18 Dec', startsAt: '2026-11-26T00:00:00Z', endsAt: '2026-12-18T23:59:59Z' },
    { id: 'vip', name: 'VIP', price: 200, note: '26 Nov – 18 Dec', startsAt: '2026-11-26T00:00:00Z', endsAt: '2026-12-18T23:59:59Z' },
    { id: 'gate', name: 'At the Gate', price: 120, note: '19 Dec only', startsAt: '2026-12-19T00:00:00Z' },
    { id: 'community', name: 'Break Time Community', price: null, note: 'Price to be confirmed' },
  ] as {
    id: string;
    name: string;
    price: number | null;
    note: string; // sales window
    startsAt?: string;
    endsAt?: string;
    featured?: boolean;
  }[],
  // Every ticket covers all three parts of the night.
  allAccess: 'Every ticket covers all three parts: Break Time, The Concert and The After Party.',
  groupDeal: { minimum: 4, discount: 5, opensAt: '2026-11-26T00:00:00Z' },

  intro:
    'JAMZA! FESTIVAL is a festive music experience: renditions of classic Christmas songs, original festive compositions, interludes, and artists’ own original works.',
  mission:
    'It exists to give female artists a stage, and audiences a lively, intimate, celebratory night. Different sounds, styles and levels of experience — one dynamic lineup.',
  grand: 'This year it’s more than a concert. It’s a Grand Festival, in three parts.',

  acts: [
    {
      id: 'break-time',
      numeral: 'I',
      title: 'Break Time',
      time: '12:00 – 4:30pm',
      kicker: 'Pause. Unwind. Play.',
      theme: 'orange',
      images: [
        { src: '/images/festival/break-time.webp', alt: 'A guest laughing during the Break Time segment' },
        { src: '/images/festival/hero-singer.webp', alt: 'A performer in red light' },
      ],
      body: [
        'A welcoming space to pause, unwind and have fun amidst everything happening in the world — for people who care about art in all its forms, mental well-being, and community.',
        'Coming together, finding comfort in community, and making room for the simple things that bring us joy.',
      ],
      tags: ['Yoga', 'Karaoke', 'Mental wellness talk & checks', 'Paint & Sip', 'Games'],
    },
    {
      id: 'concert',
      numeral: 'II',
      title: 'The Concert',
      time: '6:00 – 9:30pm',
      kicker: 'Christmas, reimagined.',
      theme: 'green',
      images: [
        { src: '/images/festival/concert.webp', alt: 'A guitarist singing on stage' },
        { src: '/images/festival/concert-2.webp', alt: 'A singer with eyes closed at the microphone' },
      ],
      body: [
        'The main live music experience: female artists, guest performers, poets and Beda’s House Band performing iconic Christmas songs.',
        'Reimagined classics, live instrumentation and spoken word — a fresh take on the sounds of the season, and the warmth and nostalgia that make Christmas special.',
      ],
      tags: ['Female artists', 'Beda’s House Band', 'Guest artists', 'Spoken word', 'AJL Initiative', 'Christmas classics'],
    },
    {
      id: 'after-party',
      numeral: 'III',
      title: 'The After Party',
      time: '10:30pm – 5:00am',
      kicker: 'Into the early hours.',
      theme: 'purple',
      images: [
        { src: '/images/festival/after-party.webp', alt: 'Two guests in festive headbands' },
        { src: '/images/festival/diva.webp', alt: 'A singer performing under colourful lights' },
      ],
      body: [
        'The festival moves to the dancefloor with a lineup of seasoned female DJs from Ghana.',
        'Music, drinks and a lively floor — celebrating the women behind the decks, and keeping it going into the early hours of the morning.',
      ],
      tags: ['Female DJs', 'Dancing', 'Drinking games', 'Till 5am'],
    },
  ],

  carousel: [
    'What is JAMZA FESTIVAL?',
    'JAMZA! FESTIVAL is a festive music experience showcasing female artists.',
    'About the festival: this year it is a Grand Festival in three parts.',
    'Part 1: The Break Time Segment.',
    'Break Time: activities, interactive sessions, art, games, food and drinks.',
    'Part 2: The Concert.',
    'The Concert: reimagined Christmas classics, live instrumentation and spoken word.',
    'Part 3: The After Party with female DJs from Ghana.',
    'The After Party keeps the celebration going into the early hours.',
    'You don’t want to miss this.',
    'Event date: Saturday 19th December 2026.',
  ].map((alt, i) => ({ src: `/images/festival/carousel/${String(i + 1).padStart(2, '0')}.webp`, alt })),
} as const;

export type Act = (typeof festival.acts)[number];

/** jamza, the collective behind the festival. */
export const values = [
  { title: 'Expression', line: 'Room to be yourself.', color: 'tomato' },
  { title: 'Connection', line: 'Better, together.', color: 'pine' },
  { title: 'Possibility', line: 'Make what’s next.', color: 'plum' },
] as const;
