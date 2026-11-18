'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { festival } from '@/content/festival';
import { Icon } from '../Icon';
import { Reveal } from '../Reveal';

/** The official 11-slide carousel, presented as a swipeable story with progress bars. */
export function StoryReel() {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const slides = festival.carousel;

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const go = (to: number) => {
    const el = track.current;
    if (!el) return;
    const next = (to + slides.length) % slides.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="story-title" className="relative overflow-hidden bg-[linear-gradient(180deg,#12031c,#1f0530)] py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_auto]">
        <Reveal>
          <p className="eyebrow text-gold">The official story</p>
          <h2 id="story-title" className="display mt-4 text-6xl sm:text-7xl">
            Swipe the story
          </h2>
          <p className="mt-5 max-w-md text-lg text-lavender">
            Everything you need to know about the night, in eleven slides. Share it with whoever
            you’re bringing.
          </p>
          <div className="mt-8 flex gap-3">
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className="glass grid size-14 place-items-center rounded-full transition-transform hover:-translate-x-1">
              <Icon icon={ArrowLeft01Icon} size={22} />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className="glass grid size-14 place-items-center rounded-full transition-transform hover:translate-x-1">
              <Icon icon={ArrowRight01Icon} size={22} />
            </button>
          </div>
        </Reveal>

        {/* Phone frame */}
        <Reveal delay={0.1} rotate={4} className="mx-auto w-[min(88vw,22rem)]">
          <div className="glass rotate-2 rounded-[2.75rem] p-3">
            <div className="relative overflow-hidden rounded-[2.1rem] bg-night">
              <div className="absolute inset-x-3 top-3 z-10 flex gap-1" aria-hidden>
                {slides.map((_, i) => (
                  <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-cream/30">
                    <span className={`block h-full rounded-full bg-cream transition-[width] duration-500 ${i <= index ? 'w-full' : 'w-0'}`} />
                  </span>
                ))}
              </div>
              <div
                ref={track}
                className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                tabIndex={0}
                role="region"
                aria-roledescription="carousel"
                aria-label="JAMZA! FESTIVAL story slides"
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') go(index + 1);
                  if (e.key === 'ArrowLeft') go(index - 1);
                }}
              >
                {slides.map((slide, i) => (
                  <div key={slide.src} className="w-full shrink-0 snap-center" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
                    <Image src={slide.src} alt={slide.alt} width={1080} height={1350} sizes="22rem" className="aspect-[4/5] h-auto w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
