import { getPublicContent } from '@/lib/content';
import { festivalEvent } from '@/lib/structured-data';
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

// Re-read CMS content at most once a minute (admin saves refresh it immediately).
export const revalidate = 60;

export default async function Home() {
  const { lineup, posts, settings } = await getPublicContent();
  return (
    <>
      <JsonLd data={festivalEvent(lineup, settings.ticketUrl)} />
      <Hero ticketUrl={settings.ticketUrl} />
      <WhatIs />
      <TheNight />
      <Tickets ticketUrl={settings.ticketUrl} communityPrice={settings.communityPrice} />
      <Lineup artists={lineup} />
      <StoryReel />
      <LastTime />
      <UnderTheTree posts={posts} />
      <Letter email={settings.email} />
    </>
  );
}
