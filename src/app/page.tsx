import { getPublicContent } from '@/lib/content';
import { festivalEvent } from '@/lib/structured-data';
import { starterLineup } from '@/content/lineup';
import { JsonLd } from '@/components/JsonLd';
import { Hero } from '@/components/home/Hero';
import { WhatIs } from '@/components/home/WhatIs';
import { TheNight } from '@/components/home/TheNight';
import { Lineup } from '@/components/home/Lineup';
import { StoryReel } from '@/components/home/StoryReel';
import { Venue } from '@/components/home/Venue';
import { Tickets } from '@/components/home/Tickets';
import { LastTime } from '@/components/home/LastTime';
import { UnderTheTree } from '@/components/home/UnderTheTree';
import { Letter } from '@/components/home/Letter';

// Re-read CMS content at most once a minute.
export const revalidate = 60;

export default async function Home() {
  const content = await getPublicContent();
  // CMS artists take over once added in the admin; until then, the official 2026 list.
  const lineup = content.artists.length
    ? content.artists.map((a) => ({ ...a, url: '', tier: 'main' as const }))
    : starterLineup;
  return (
    <>
      <JsonLd data={festivalEvent(lineup)} />
      <Hero />
      <WhatIs />
      <TheNight />
      <Tickets />
      <Lineup artists={lineup} />
      <StoryReel />
      <LastTime />
      <Venue />
      <UnderTheTree posts={content.posts} />
      <Letter email={content.settings.email} />
    </>
  );
}
