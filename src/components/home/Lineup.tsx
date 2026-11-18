'use client';

import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { Fragment, useState } from 'react';
import { SnowflakeIcon } from '@hugeicons/core-free-icons';
import { safeUrl } from '@/lib/safe-url';
import type { Artist } from '@/lib/types';
import { Icon } from '../Icon';
import { Reveal } from '../Reveal';
import { brand } from '../Brand';

/** Headliners first and biggest, like a festival poster. */
const sizes = [
  'text-[clamp(3.2rem,9vw,7.5rem)]',
  'text-[clamp(2.6rem,7vw,5.5rem)]',
  'text-[clamp(2.2rem,5.5vw,4.25rem)]',
];
const sizeFor = (i: number) => sizes[i === 0 ? 0 : i < 3 ? 1 : 2];

export function Lineup({ artists }: { artists: Artist[] }) {
  const [hovered, setHovered] = useState<Artist | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 28 });
  const sy = useSpring(y, { stiffness: 300, damping: 28 });

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
      <div className="absolute left-1/2 top-1/2 size-[34rem] -translate-y-1/2 -translate-x-1/2 rounded-full bg-plum/40 blur-[140px]" />
      <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
        <Reveal>
          <p className="eyebrow text-gold">On stage · Women in the arts</p>
          <h2 id="lineup-title" className="display mt-4 text-6xl sm:text-7xl">
            The Lineup
          </h2>
        </Reveal>

        {artists.length ? (
          <ul className="mt-14 flex flex-wrap items-baseline justify-center gap-x-5 gap-y-3">
            {artists.map((artist, i) => (
              <Fragment key={artist.id}>
                {i > 0 && (
                  <li aria-hidden className="text-tomato">
                    <Icon icon={SnowflakeIcon} size={i < 3 ? 34 : 24} />
                  </li>
                )}
                <li
                  onPointerEnter={() => setHovered(artist)}
                  onPointerLeave={() => setHovered(null)}
                  className="group"
                >
                  <Reveal delay={Math.min(i, 8) * 0.05}>
                    {safeUrl(artist.image) && (
                      <img
                        src={safeUrl(artist.image)}
                        alt=""
                        loading="lazy"
                        className="mx-auto mb-2 size-14 rounded-full border-4 border-peach object-cover [@media(hover:hover)]:hidden"
                      />
                    )}
                    <span
                      className={`headline block cursor-default uppercase transition-colors duration-300 group-hover:text-ember ${sizeFor(i)}`}
                    >
                      {brand(artist.name)}
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-lavender/80">{brand(artist.role)}</span>
                  </Reveal>
                </li>
              </Fragment>
            ))}
          </ul>
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

      {/* Cursor-following portrait sticker (pointer devices only). */}
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
            {/* CMS images can come from any host, so a plain img is used deliberately. */}
            <img src={safeUrl(hovered.image)} alt="" className="aspect-[4/5] w-full object-cover" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
