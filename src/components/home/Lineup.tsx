'use client';

import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { Fragment, useState } from 'react';
import { InstagramIcon, SnowflakeIcon } from '@hugeicons/core-free-icons';
import type { LineupArtist } from '@/content/lineup';
import { safeUrl } from '@/lib/safe-url';
import { brand } from '../Brand';
import { Icon } from '../Icon';
import { Reveal } from '../Reveal';

const tiers = {
  main: {
    size: 'text-[clamp(2.4rem,6.5vw,5.25rem)]',
    flake: 28,
  },
  guest: {
    size: 'text-[clamp(1.6rem,3.6vw,2.75rem)]',
    flake: 18,
  },
} as const;

/** Festival-poster billing: main artists big, special guests below. Names link to Instagram. */
export function Lineup({ artists }: { artists: LineupArtist[] }) {
  const [hovered, setHovered] = useState<LineupArtist | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 28 });
  const sy = useSpring(y, { stiffness: 300, damping: 28 });

  const main = artists.filter((a) => a.tier === 'main');
  const guests = artists.filter((a) => a.tier === 'guest');

  const billing = (list: LineupArtist[], tier: keyof typeof tiers) => (
    <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 sm:gap-x-5">
      {list.map((artist, i) => {
        const url = safeUrl(artist.url);
        const name = (
          <>
            {safeUrl(artist.image) && (
              <img
                src={safeUrl(artist.image)}
                alt=""
                loading="lazy"
                className="mx-auto mb-2 size-14 rounded-full border-4 border-peach object-cover [@media(hover:hover)]:hidden"
              />
            )}
            <span className={`headline block uppercase transition-colors duration-300 group-hover:text-ember ${tiers[tier].size}`}>
              {brand(artist.name)}
            </span>
            {(artist.role || url) && (
              <span className="mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-lavender/75">
                {artist.role && brand(artist.role)}
                {url && (
                  <Icon
                    icon={InstagramIcon}
                    size={14}
                    className="opacity-60 transition-opacity group-hover:opacity-100"
                  />
                )}
              </span>
            )}
          </>
        );
        return (
          <Fragment key={artist.id}>
            {i > 0 && (
              <li aria-hidden className="text-tomato">
                <Icon icon={SnowflakeIcon} size={tiers[tier].flake} />
              </li>
            )}
            <li
              onPointerEnter={() => setHovered(artist)}
              onPointerLeave={() => setHovered(null)}
              className="group text-center"
            >
              <Reveal delay={Math.min(i, 8) * 0.04}>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${artist.name} on Instagram`}>
                    {name}
                  </a>
                ) : (
                  name
                )}
              </Reveal>
            </li>
          </Fragment>
        );
      })}
    </ul>
  );

  return (
    <section
      id="lineup"
      aria-labelledby="lineup-title"
      className="relative overflow-hidden bg-night py-28"
      onPointerMove={(e) => {
        x.set(e.clientX);
        y.set(e.clientY);
      }}
    >
      <div className="absolute left-1/2 top-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-plum/40 blur-[140px]" />
      <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
        <Reveal>
          <p className="eyebrow text-gold">On stage · Women in the arts</p>
          <h2 id="lineup-title" className="display mt-4 text-6xl sm:text-7xl">
            The Lineup
          </h2>
        </Reveal>

        {artists.length ? (
          <>
            <div className="mt-14">{billing(main.length ? main : artists, 'main')}</div>
            {guests.length > 0 && (
              <div className="mt-20">
                <Reveal>
                  <p className="flex items-center justify-center gap-4 text-gold">
                    <span className="h-px w-12 bg-gold/40" />
                    <span className="display text-3xl sm:text-4xl">Special guests</span>
                    <span className="h-px w-12 bg-gold/40" />
                  </p>
                </Reveal>
                <div className="mt-8">{billing(guests, 'guest')}</div>
              </div>
            )}
          </>
        ) : (
          <div className="mt-14">
            <ul className="flex flex-wrap justify-center gap-3" aria-hidden>
              {['w-56', 'w-40', 'w-64', 'w-36', 'w-48', 'w-44', 'w-60'].map((w, i) => (
                <li key={i} className={`glass h-14 rounded-full ${w} animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </ul>
            <p className="display mt-10 text-4xl text-gold sm:text-5xl">Lineup drops soon…</p>
            <p className="mt-3 text-lavender">Female artists, musicians, poets, a live band and DJs. Names landing here first.</p>
          </div>
        )}
      </div>

      {/* Cursor-following portrait sticker (pointer devices, CMS photos only). */}
      <AnimatePresence>
        {hovered && safeUrl(hovered.image) && (
          <motion.div
            key={hovered.id}
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-40 hidden w-56 overflow-hidden rounded-[1.75rem] border-[6px] border-peach shadow-[10px_14px_0_rgb(0_0_0/0.35)] [@media(hover:hover)]:block"
            style={{ x: sx, y: sy, translateX: '-50%', translateY: '-110%' }}
            initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
          >
            <img src={safeUrl(hovered.image)} alt="" className="aspect-[4/5] w-full object-cover" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
