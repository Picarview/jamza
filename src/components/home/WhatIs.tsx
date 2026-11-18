import { festival, values } from '@/content/festival';
import { HalfMoons } from '../HalfMoons';
import { Marquee } from '../Marquee';
import { Reveal } from '../Reveal';
import { Icon } from '../Icon';
import { SnowflakeIcon } from '@hugeicons/core-free-icons';
import { brand } from '../Brand';

const sticker = {
  tomato: 'bg-tomato text-cream',
  pine: 'bg-pine text-cream',
  plum: 'bg-plum text-cream',
} as const;

/** The "about" — asked the way the festival creative asks it. */
export function WhatIs() {
  return (
    <section id="what-is-jamza" aria-labelledby="what-is-title" className="relative">
      {/* Tilted ticker that tapes the poster to the next section. */}
      <div className="relative z-10 -mb-6 -rotate-2 bg-peach py-4 text-plum shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)]">
        <Marquee
          duration={40}
          className="display text-3xl sm:text-4xl"
          separator={<Icon icon={SnowflakeIcon} size={26} className="text-tomato" />}
          items={['Christmas classics', 'Original songs', 'Poetry', 'Live band', 'Female DJs', 'Games', 'Food & drinks', 'Women in the arts']}
        />
      </div>

      <div className="torn-top relative overflow-hidden bg-cream pb-28 pt-28 text-plum">
        <HalfMoons className="absolute -right-12 top-10 w-60 sm:w-80" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h2 id="what-is-title" className="leading-none">
              <span className="block -rotate-3 font-sans text-4xl italic text-tomato sm:text-6xl">what is</span>
              <span className="display block text-[clamp(4rem,14vw,10rem)]">JAMZA!?</span>
            </h2>
            {/* The hand-drawn squiggle from the creative. */}
            <svg viewBox="0 0 300 40" className="mt-2 w-56 text-gold sm:w-72" aria-hidden="true">
              <path d="M4 22 C40 6 70 34 100 18 S160 4 190 22 S250 36 296 14" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
            </svg>
          </Reveal>

          <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-16">
            <Reveal delay={0.1}>
              <p className="headline text-3xl leading-[1.05] sm:text-4xl">{brand(festival.intro)}</p>
            </Reveal>
            <Reveal delay={0.2} className="space-y-5 text-lg text-plum/80">
              <p>{brand(festival.mission)}</p>
              <p className="font-semibold text-plum">{brand(festival.grand)}</p>
            </Reveal>
          </div>

          {/* jamza, the collective — values as stickers slapped on the page. */}
          <div className="mt-24">
            <p className="eyebrow text-plum/60">Made by {brand('jamza')} — a different perspective</p>
            <ul className="mt-6 grid gap-5 sm:grid-cols-3">
              {values.map((v, i) => (
                <li key={v.title}>
                  <Reveal delay={i * 0.1} rotate={i === 1 ? 4 : -4}>
                    <div
                      className={`rounded-[2rem] border-[6px] border-peach p-7 shadow-[8px_10px_0_rgb(31_5_48/0.25)] transition-transform duration-500 ease-[var(--ease-spring)] hover:-translate-y-2 hover:rotate-0 ${sticker[v.color]} ${
                        i === 1 ? 'rotate-2' : '-rotate-2'
                      }`}
                    >
                      <span className="eyebrow opacity-75">0{i + 1}</span>
                      <p className="display mt-6 text-5xl">{v.title}</p>
                      <p className="mt-2 text-lg opacity-90">{v.line}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
