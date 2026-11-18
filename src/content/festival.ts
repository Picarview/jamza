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
  dressCode: 'Festive',
  dateLabel: 'Saturday 19th December 2026',
  shortDate: 'Sat 19 Dec',
  venue: 'Beda’s Hotel & Event Centre' as string | null,
  city: 'Old Ashongman, Accra',
  map: {
    // Google Maps listing: “Beda’s Pub and Events Center, 49 Silver St, Accra”.
    link: 'https://maps.app.goo.gl/Ziuqqabna1kwERDH6',
    directions:
      'https://www.google.com/maps/dir/?api=1&destination=Beda%E2%80%99s+Pub+and+Events+Center%2C+49+Silver+St%2C+Accra',
    embed:
      'https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1sBeda%E2%80%99s+Pub+and+Events+Center,+49+Silver+St,+Accra!6i16',
  },
  ticketUrl: null as string | null, // TODO: checkout link — until then, ticket buttons scroll to #tickets
  currency: 'GHC',
  tickets: [
    {
      id: 'early-bird',
      name: 'Early Bird',
      price: 75,
      note: 'Till 25 November',
      endsAt: '2026-11-25T23:59:59Z',
      featured: true,
    },
    { id: 'student', name: 'Student', price: 55, note: 'Student ticket' },
    { id: 'regular', name: 'Regular', price: 100, note: 'General admission' },
    { id: 'vip', name: 'VIP', price: 200, note: 'VIP access' },
    { id: 'gate', name: 'At the Gate', price: 120, note: 'Bought on the day' },
    { id: 'community', name: 'Break Time Community', price: null, note: 'Price to be confirmed' },
  ] as {
    id: string;
    name: string;
    price: number | null;
    note: string;
    endsAt?: string;
    featured?: boolean;
  }[],
  groupDeal: { minimum: 4, discount: 5 },

  intro:
    'JAMZA! FESTIVAL is a festive music experience: renditions of classic Christmas songs, original festive compositions, interludes, and artists’ own non-Christmas works.',
  mission:
    'It exists to give female artists a stage, and audiences a lively, intimate, celebratory night. Different sounds, styles and levels of experience — one dynamic lineup.',
  grand: 'This year it’s more than a concert. It’s a Grand Festival, in three parts.',

  acts: [
    {
      id: 'break-time',
      numeral: 'I',
      title: 'Break Time',
      kicker: 'Pause. Unwind. Play.',
      theme: 'orange',
      images: [
        { src: '/images/festival/break-time.jpg', alt: 'A guest laughing during the Break Time segment' },
        { src: '/images/festival/hero-singer.jpg', alt: 'A performer in red light' },
      ],
      body: [
        'A welcoming space to pause, unwind and have fun amidst everything happening in the world — for people who care about art in all its forms, mental well-being, and community.',
        'Coming together, finding comfort in community, and making room for the simple things that bring us joy.',
      ],
      tags: ['Stretching', 'Real conversations', 'Art', 'Games', 'Performances', 'Food & drinks'],
    },
    {
      id: 'concert',
      numeral: 'II',
      title: 'The Concert',
      kicker: 'Christmas, reimagined.',
      theme: 'green',
      images: [
        { src: '/images/festival/concert.jpg', alt: 'A guitarist singing on stage' },
        { src: '/images/festival/concert-2.jpg', alt: 'A singer with eyes closed at the microphone' },
      ],
      body: [
        'The main live music experience: female artists and musicians, poets, and a live band performing iconic Christmas songs.',
        'Reimagined classics, live instrumentation and spoken word — a fresh take on the sounds of the season, and the warmth and nostalgia that make Christmas special.',
      ],
      tags: ['Christmas classics', 'Original songs', 'Spoken word', 'Live band'],
    },
    {
      id: 'after-party',
      numeral: 'III',
      title: 'The After Party',
      kicker: 'Into the early hours.',
      theme: 'purple',
      images: [
        { src: '/images/festival/after-party.jpg', alt: 'Two guests in festive headbands' },
        { src: '/images/festival/diva.jpg', alt: 'A singer performing under colourful lights' },
      ],
      body: [
        'The festival moves to the dancefloor with a lineup of seasoned female DJs from Ghana.',
        'Music, drinks and a lively floor — celebrating the women behind the decks, and keeping it going into the early hours of the morning.',
      ],
      tags: ['Female DJs', 'Dancefloor', 'Drinks', 'Till late'],
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
  ].map((alt, i) => ({ src: `/images/festival/carousel/${String(i + 1).padStart(2, '0')}.jpg`, alt })),
} as const;

export type Act = (typeof festival.acts)[number];

/** jamza, the collective behind the festival. */
export const values = [
  { title: 'Expression', line: 'Room to be yourself.', color: 'tomato' },
  { title: 'Connection', line: 'Better, together.', color: 'pine' },
  { title: 'Possibility', line: 'Make what’s next.', color: 'plum' },
] as const;
