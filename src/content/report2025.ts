/**
 * JAMZA! 2025 Event Report — written by Frances Dellor.
 * Page images are rendered from public/reports/jamza-2025-report.pdf (see README to regenerate).
 * Text below is transcribed from the PDF so the report is readable without the images.
 */
export const report2025 = {
  title: 'JAMZA! 2025 Event Report',
  author: 'Frances Dellor',
  pdf: '/reports/jamza-2025-report.pdf',
  pdfSize: '15 MB',
  pageSize: { width: 1240, height: 1754 },
  pages: [
    'Cover — JAMZA! Event Report 2025',
    'About us and executive summary',
    'Our mission and our vision',
    'Artist lineup',
    'Artist lineup, continued',
    'Beda’s House Band, with Okoe Amartey-fio',
    'Christmas song setlist',
    'GTP sponsorship',
    'GTP sponsorship — the designers',
    'The JAMZA! giveaway',
    'Conclusion',
    'Photos from the night',
    'More photos from the night',
    'Executive team',
  ].map((title, i) => {
    const n = String(i + 1).padStart(2, '0');
    return { title, src: `/reports/2025/page-${n}.webp`, thumb: `/reports/2025/thumb-${n}.webp` };
  }),
  stats: [
    { value: '≈102', label: 'people in the room' },
    { value: '14', label: 'female performers' },
    { value: '10', label: 'Christmas songs on the setlist' },
    { value: '120', label: 'yards of GTP fabric' },
    { value: '6', label: 'Ghanaian designers' },
  ],
  summary:
    'The first JAMZA! — an all-female festive music experience of Christmas classics, original festive compositions, interludes and artists’ own works, in a lively, intimate and celebratory room.',
  text: [
    {
      heading: 'About us',
      body: [
        'JAMZA! is a Christmas concert featuring a lineup of talented female artists, bringing together great live music, community, and the spirit of Christmas for a memorable night of music and celebration.',
      ],
    },
    {
      heading: 'Executive summary',
      body: [
        'JAMZA! 2025 successfully delivered an all-female line up festive music experience, combining renditions of classic Christmas songs, original festive compositions, interludes, and artists’ personal non-Christmas works. The concert achieved its goal of creating a platform to showcase female artists while providing audience engagement through a lively, intimate, and celebratory atmosphere.',
        'Approximately 102 people attended, including paying attendees and guests with complimentary tickets.',
      ],
    },
    {
      heading: 'Our mission',
      body: [
        'To create a high-quality Christmas music experience that brings people together while providing a meaningful platform for female artists to perform, connect, collaborate, and be seen.',
      ],
    },
    {
      heading: 'Our vision',
      body: [
        'To become a leading Christmas music experience in Ghana, known for exceptional live performances and for creating greater visibility, opportunities, and connection for women in music.',
      ],
    },
    {
      heading: 'Artist lineup',
      body: [
        '14 female performers delivered diverse and high-quality performances across the concert. The lineup brought together different sounds, styles, and levels of experience, creating a dynamic musical experience for the audience. A skilled female MC kept the programme flowing and engaging.',
        'Esibaby, Sharlene, Legasie (host), Teniade, Creatrixx, Sea The UFO, Maame Alpha, Makayy, Auds, Brenny, Fale, Japhyre, Tower, Ami, Kiki Celine.',
      ],
    },
    {
      heading: 'Backed by Beda’s House Band',
      body: [
        'JAMZA!’s live music was backed by Beda’s House Band, featuring Beda E. on bass, Isack T. on keys, Daniel S. on guitar, and Evan E. on drums. The band provided a strong live foundation throughout the concert, supporting the artists and bringing depth, energy, and musical cohesion to each performance.',
        'Adding to the musical experience was renowned Ghanaian percussionist Okoe A., who joined Beda’s House Band as a guest instrumentalist. His contribution brought an additional layer of rhythm and musicality to the performances, further enriching the live sound of JAMZA!.',
      ],
    },
    {
      heading: 'Christmas song setlist',
      body: [
        'All I Want for Christmas Is You · O Holy Night · Mistletoe (acoustic guitar) · Last Christmas · Have Yourself a Merry Little Christmas (acoustic guitar) · Silent Night · O Come, O Come, Emmanuel · Santa Baby · The Christmas Song (Chestnuts Roasting on an Open Fire) · Wutah — Bronya',
      ],
    },
    {
      heading: 'GTP sponsorship',
      body: [
        'JAMZA! partnered with GTP, which sponsored 120 yards of fabric for the project. Six Ghanaian designers contributed as collaborators, transforming the fabric into custom looks for selected artists and performers. This collaboration brought together music, fashion, and local textile design, adding a distinct Ghanaian creative element to the overall visual identity of the concert.',
        'Designers: The Ohui Brand, Jeffrey Ness, Whyefelle, Gray’s Raiment, World Genius, Acumen Luxury Brand.',
      ],
    },
    {
      heading: 'The JAMZA! giveaway',
      body: [
        'A special giveaway segment was held during the show, where three audience members received GTP fabric. The giveaway was part of an interactive moment with the host, who invited members of the audience to sing their favourite Christmas songs, with three participants selected to receive the GTP fabric as prizes.',
      ],
    },
    {
      heading: 'Conclusion',
      body: [
        'JAMZA! 2025 achieved its vision of creating a festive, all-female music showcase that brought together artists, creatives, and audience members for a shared celebration of music and the Christmas season. The event provided a meaningful platform for female performers and designers to collaborate, express their creativity, and connect with a live audience. Beyond the performances, JAMZA! created opportunities for interaction and community, making the experience more engaging for everyone involved.',
        'As the inaugural edition, the lessons and experiences gained will help shape future editions, with a continued focus on strengthening the quality of the production, artist experience, collaborations, and audience reach. JAMZA! aims to build on this foundation and grow into a major highlight of Ghana’s festive season.',
      ],
    },
    {
      heading: 'Executive team',
      body: [
        'Founder/Organiser: Frances Dellor · Band Head/Venue Owner: Beda E. · Coordination: Fafali Dellor · Venue: Beda’s Events Center · Head Sponsor: GTP',
      ],
    },
  ],
} as const;
