import { getPublicContent } from '@/lib/content';
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
  return (
    <>
      <Hero />
      <WhatIs />
      <TheNight />
      <Tickets />
      <Lineup artists={content.artists} />
      <StoryReel />
      <LastTime />
      <Venue />
      <UnderTheTree posts={content.posts} partners={content.partners} />
      <Letter email={content.settings.email} />
    </>
  );
}
