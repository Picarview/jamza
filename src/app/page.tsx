import { getPublicContent } from '@/lib/content';
import { festivalEvent } from '@/lib/structured-data';
import { JsonLd } from '@/components/JsonLd';
import { Hero } from '@/components/home/Hero';
import { WhatIs } from '@/components/home/WhatIs';
import { TheNight } from '@/components/home/TheNight';
import { Lineup } from '@/components/home/Lineup';
import { StoryReel } from '@/components/home/StoryReel';
import { Venue } from '@/components/home/Venue';
import { Tickets } from '@/components/home/Tickets';
import { LastTime } from '@/components/home/LastTime';
import { Partners } from '@/components/home/Partners';
import { starterPartners } from '@/content/partners';
import { UnderTheTree } from '@/components/home/UnderTheTree';
import { Letter } from '@/components/home/Letter';

// Re-read CMS content at most once a minute.
export const revalidate = 60;

export default async function Home() {
  const content = await getPublicContent();
  return (
    <>
      <JsonLd data={festivalEvent(content.artists)} />
      <Hero />
      <WhatIs />
      <TheNight />
      <Tickets />
      <Lineup artists={content.artists} />
      <StoryReel />
      <LastTime />
      <Venue />
      <UnderTheTree posts={content.posts} />
      <Partners partners={content.partners.length ? content.partners : starterPartners} />
      <Letter email={content.settings.email} />
    </>
  );
}
