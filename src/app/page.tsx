import { getPublicContent } from '@/lib/content';
import { festivalEvent } from '@/lib/structured-data';
import { lineup } from '@/content/lineup';
import { JsonLd } from '@/components/JsonLd';
import { Hero } from '@/components/home/Hero';
import { WhatIs } from '@/components/home/WhatIs';
import { TheNight } from '@/components/home/TheNight';
import { Lineup } from '@/components/home/Lineup';
import { StoryReel } from '@/components/home/StoryReel';
import { Tickets } from '@/components/home/Tickets';
import { LastTime } from '@/components/home/LastTime';
import { UnderTheTree } from '@/components/home/UnderTheTree';
import { Letter } from '@/components/home/Letter';

// Re-read CMS content at most once a minute.
export const revalidate = 60;

export default async function Home() {
  const content = await getPublicContent();
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
      <UnderTheTree posts={content.posts} />
      <Letter email={content.settings.email} />
    </>
  );
}
