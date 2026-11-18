'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown01Icon, Location01Icon, Ticket01Icon } from '@hugeicons/core-free-icons';
import { festival } from '@/content/festival';
import { Countdown } from '../Countdown';
import { Icon } from '../Icon';

/**
 * "Lights down" — the moment before the show. Full-bleed stage photography crossfades
 * while the light shifts through the colours of the three acts.
 * Swap in high-res originals or a video loop here when they arrive.
 */
const scenes = [
  { label: 'Tonight', src: '/images/festival/stage-ensemble.jpg', focus: '50% 35%', light: '#d8461e' },
  { label: 'Break Time', src: '/images/festival/stage-bow-dress.jpg', focus: '55% 4%', light: '#f06a1f' },
  { label: 'The Concert', src: '/images/festival/stage-guitar.jpg', focus: '55% 30%', light: '#00843d' },
  { label: 'The After Party', src: '/images/festival/stage-solo.jpg', focus: '52% 28%', light: '#7a1aa3' },
] as const;

const SCENE_MS = 6000;

export function Hero() {
  const reduce = useReducedMotion();
  const [scene, setScene] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(() => setScene((s) => (s + 1) % scenes.length), SCENE_MS);
    return () => clearInterval(id);
  }, [reduce, paused]);

  const current = scenes[scene];
  const ticketHref = festival.ticketUrl ?? '#tickets';

  return (
    <section
      ref={ref}
      id="tonight"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden bg-night"
    >
      {/* Photography */}
      <motion.div className="absolute inset-0 -z-30 lg:left-[34%]" style={reduce ? undefined : { y: photoY }}>
        <AnimatePresence initial={false}>
          <motion.div
            key={current.src}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
          >
            <Image
              src={current.src}
              alt=""
              fill
              priority={scene === 0}
              sizes="(min-width: 1024px) 66vw, 100vw"
              className={`object-cover ${reduce ? '' : 'animate-[kenburns_7.5s_ease-out_forwards]'}`}
              style={{ objectPosition: current.focus }}
            />
          </motion.div>
        </AnimatePresence>
        {/* Preload the next scene so crossfades never flash. */}
        <Image
          src={scenes[(scene + 1) % scenes.length].src}
          alt=""
          fill
          sizes="100vw"
          className="pointer-events-none opacity-0"
          aria-hidden
        />
      </motion.div>

      {/* Stage light: tints the room in the colour of each act. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-20 mix-blend-color"
        animate={{ backgroundColor: current.light }}
        transition={{ duration: 1.6 }}
        style={{ opacity: 0.38 }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-20"
        animate={{
          background: `radial-gradient(55% 60% at 75% 0%, ${current.light}70, transparent 70%), radial-gradient(40% 50% at 0% 100%, ${current.light}40, transparent 70%)`,
        }}
        transition={{ duration: 1.6 }}
      />
      {/* Desktop: the photo melts into the dark on the left, where the type lives. */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 -z-10 hidden w-[60%] bg-[linear-gradient(90deg,#12031c_0%,#12031c_55%,transparent_100%)] lg:block"
      />
      {/* Legibility: darken the floor and the left edge. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(18_3_28/0.55)_0%,rgb(18_3_28/0.05)_30%,rgb(18_3_28/0.35)_55%,rgb(18_3_28/0.96)_100%),linear-gradient(90deg,rgb(18_3_28/0.7)_0%,transparent_60%)]"
      />

      <motion.div
        className="mx-auto w-full max-w-7xl px-4 pb-8 pt-32 sm:px-6 sm:pb-10"
        style={reduce ? undefined : { y: copyY, opacity: fade }}
      >
        <motion.p
          className="eyebrow flex items-center gap-3 text-cream/80"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Grand Festival edition · {festival.edition}
        </motion.p>

        <h1 id="hero-title" className="display mt-5 text-[clamp(3rem,8vw,7.25rem)] leading-[0.9]">
          {['JAMZA!', 'Festival'].map((word, i) => (
            <span key={word} className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                initial={reduce ? false : { y: '105%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.35 + i * 0.12, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              >
                {i === 0 ? (
                  <>
                    JAMZA<span className="text-tomato">!</span>
                  </>
                ) : (
                  word
                )}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          className="mt-5 max-w-sm text-base text-cream/80 sm:text-lg"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
        >
          A festive night of music, poetry and dance, celebrating women in the arts.
        </motion.p>

        {/* When, where, how long, and the way in. */}
        <motion.div
          className="mt-10 grid gap-6 sm:grid-cols-[auto_auto] sm:justify-start sm:gap-x-12 lg:grid-cols-[auto_auto_1fr] lg:items-center"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <p className="headline text-lg sm:text-xl">{festival.dateLabel.replace('Saturday ', 'Sat ')}</p>
            <a href="#venue" className="mt-1 flex items-center gap-1.5 text-sm text-cream/70 underline-offset-4 transition-colors hover:text-cream hover:underline">
              <Icon icon={Location01Icon} size={15} />
              {festival.venue}, {festival.city}
            </a>
          </div>
          <Countdown to={festival.startsAt} compact />
          <div className="flex gap-2 sm:col-span-2 lg:col-span-1 lg:justify-self-end">
            <a
              href={ticketHref}
                            className="btn droplet flex-1 justify-center text-plum lg:flex-none"
            >
              <Icon icon={Ticket01Icon} size={18} />
              Get tickets
            </a>
            <a
              href="#what-is-jamza"
              aria-label="Scroll to learn more"
              className="grid size-[3.1rem] shrink-0 place-items-center rounded-full border border-cream/25 transition-colors hover:bg-cream/10"
            >
              <Icon icon={ArrowDown01Icon} size={20} className={reduce ? '' : 'animate-bounce'} />
            </a>
          </div>
        </motion.div>

        {/* Scene index — doubles as a preview of the running order. */}
        <div
          className="mt-6 grid grid-cols-4 gap-3"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {scenes.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setScene(i)}
              aria-label={`Show ${s.label}`}
              aria-pressed={i === scene}
              className="group text-left"
            >
              <span className="block h-[2px] overflow-hidden rounded-full bg-cream/20">
                {i === scene && (
                  <motion.span
                    key={`${scene}-${paused}`}
                    className="block h-full origin-left"
                    style={{ backgroundColor: s.light === '#7a1aa3' ? '#e3d1ea' : s.light }}
                    initial={{ scaleX: reduce || paused ? 1 : 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: reduce || paused ? 0 : SCENE_MS / 1000, ease: 'linear' }}
                  />
                )}
              </span>
              <span
                className={`mt-2 hidden text-xs font-semibold uppercase tracking-[0.14em] transition-colors sm:block ${
                  i === scene ? 'text-cream' : 'text-cream/45 group-hover:text-cream/75'
                }`}
              >
                {i > 0 && <span className="mr-1.5 text-cream/45">{['', 'I', 'II', 'III'][i]}</span>}
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
