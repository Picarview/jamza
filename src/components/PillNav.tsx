'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Cancel01Icon,
  GiftIcon,
  HandshakeIcon,
  Facebook01Icon,
  InstagramIcon,
  TiktokIcon,
  Location01Icon,
  Mail01Icon,
  Menu01Icon,
  Mic01Icon,
  PartyIcon,
  ShoppingBag01Icon,
  Ticket01Icon,
} from '@hugeicons/core-free-icons';
import { festival } from '@/content/festival';
import { Icon } from './Icon';
import { brand } from './Brand';

/** Home-page sections (scroll-tracked) mixed with full pages. */
const stops = [
  { id: 'the-night', label: 'The Night', icon: PartyIcon },
  { id: 'lineup', label: 'Lineup', icon: Mic01Icon },
  { id: 'visit', label: 'Visit', icon: Location01Icon, page: '/visit' },
  { id: 'shop', label: 'Shop', icon: ShoppingBag01Icon, page: '/shop' },
  { id: 'merch', label: 'Merch', icon: GiftIcon, page: '/merch' },
  { id: 'join', label: 'Get involved', icon: HandshakeIcon, page: '/join' },
  { id: 'letter', label: 'Contact', icon: Mail01Icon },
] as { id: string; label: string; icon: typeof PartyIcon; page?: string }[];

/** Section ids observed on the home page; the hero ("tonight") clears the highlight. */
const tracked = ['tonight', ...stops.filter((s) => !s.page).map((s) => s.id)];

/** Track which stop is under the middle of the viewport. */
function useActiveStop(enabled: boolean) {
  const [active, setActive] = useState<string>('');
  useEffect(() => {
    if (!enabled) {
      setActive('');
      return;
    }
    setActive('tonight');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const id of tracked) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [enabled]);
  return active;
}

export function PillNav({ ticketUrl }: { ticketUrl: string | null }) {
  // Section links live on the home page; elsewhere they navigate back to it.
  const pathname = usePathname();
  const onHome = pathname === '/';
  const base = onHome ? '' : '/';
  const section = useActiveStop(onHome);
  const active = stops.find((s) => s.page && pathname.startsWith(s.page))?.id ?? section;
  const hrefOf = (stop: (typeof stops)[number]) => stop.page ?? `${base}#${stop.id}`;
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  useMotionValueEvent(scrollY, 'change', (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    if (y > 500 && y > previous + 6) setHidden(true);
    else if (y < previous - 6) setHidden(false);
  });

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const highlight = hovered ?? active;
  const ticketHref = ticketUrl ?? `${base}#tickets`;

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:pt-4"
        animate={{ y: hidden && !open ? -120 : 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      >
        <nav
          aria-label="Running order"
          className={`relative flex w-full max-w-6xl items-center justify-between gap-2 overflow-hidden rounded-full p-1.5 pl-3 transition-colors duration-500 ${
            scrolled ? 'glass glass-tint-plum' : 'bg-transparent'
          }`}
        >
          {/* How far through the night you are. */}
          <motion.span
            aria-hidden
            className="absolute inset-x-6 bottom-0 h-[2px] origin-left rounded-full bg-gradient-to-r from-ember via-pine to-lavender"
            style={{ scaleX: progress, opacity: scrolled ? 1 : 0 }}
          />

          <a href={`${base}#tonight`} aria-label="JAMZA! — back to the top" className="group shrink-0">
            <Image
              src="/images/logo-main.png"
              alt="JAMZA!"
              width={994}
              height={780}
              priority
              className="h-10 w-auto transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-6 group-hover:scale-110 sm:h-11"
            />
          </a>

          <ul className="glass hidden items-center rounded-full p-1 lg:flex" onMouseLeave={() => setHovered(null)}>
            {stops.map((stop) => (
              <li key={stop.id} className="relative">
                <a
                  href={hrefOf(stop)}
                  aria-current={active === stop.id ? (stop.page ? 'page' : 'location') : undefined}
                  onMouseEnter={() => setHovered(stop.id)}
                  onFocus={() => setHovered(stop.id)}
                  onBlur={() => setHovered(null)}
                  className={`relative z-10 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-300 ${
                    highlight === stop.id ? 'text-plum' : 'text-cream/85 hover:text-cream'
                  }`}
                >
                  {highlight === stop.id && (
                    <motion.span
                      layoutId="pill"
                      className="droplet absolute inset-0 -z-10 rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                    />
                  )}
                  <Icon icon={stop.icon} size={15} />
                  {brand(stop.label)}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={ticketHref}
                            className="hidden items-center gap-2 rounded-full bg-tomato px-4 py-2.5 text-sm font-bold text-cream shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] transition-transform duration-300 ease-[var(--ease-spring)] hover:-rotate-2 hover:scale-105 sm:flex"
            >
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-gold" />
              </span>
              <Icon icon={Ticket01Icon} size={16} />
              Get tickets
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="running-order"
              className="droplet flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-plum lg:hidden"
            >
              Menu
              <Icon icon={Menu01Icon} size={18} />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="running-order"
            role="dialog"
            aria-modal="true"
            aria-label="Running order"
            className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-plum px-5 pb-10 pt-5 lg:hidden"
            initial={{ clipPath: 'circle(0% at 90% 4%)' }}
            animate={{ clipPath: 'circle(150% at 90% 4%)' }}
            exit={{ clipPath: 'circle(0% at 90% 4%)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between">
              <Image src="/images/logo-main.png" alt="JAMZA!" width={994} height={780} className="h-12 w-auto" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="droplet flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-plum"
                autoFocus
              >
                Close <Icon icon={Cancel01Icon} size={18} />
              </button>
            </div>
            <p className="eyebrow mt-10 text-gold">The running order</p>
            <ol className="mt-4 flex flex-col items-start gap-3">
              {stops.map((stop, i) => (
                <motion.li
                  key={stop.id}
                  initial={{ opacity: 0, y: 30, rotate: i % 2 ? 4 : -4 }}
                  animate={{ opacity: 1, y: 0, rotate: i % 2 ? 1.5 : -1.5 }}
                  transition={{ delay: 0.15 + i * 0.05, type: 'spring', stiffness: 300, damping: 22 }}
                >
                  <a
                    href={hrefOf(stop)}
                    onClick={() => setOpen(false)}
                    className={`display flex items-center gap-3 rounded-full px-6 py-3 text-4xl ${
                      active === stop.id ? 'droplet text-plum' : 'glass text-cream'
                    }`}
                  >
                    <span className="text-base font-sans font-bold opacity-60">0{i + 1}</span>
                    {brand(stop.label)}
                  </a>
                </motion.li>
              ))}
            </ol>
            <a
              href="/2025"
              onClick={() => setOpen(false)}
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-cream/25 px-5 py-3 font-semibold"
            >
              Read the {brand('JAMZA!')} 2025 report
            </a>
            <a
              href="/partners"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-cream/25 px-5 py-3 font-semibold"
            >
              Partners
            </a>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { href: festival.instagram.url, icon: InstagramIcon, label: festival.instagram.handle, aria: 'Instagram' },
                { href: festival.tiktok.url, icon: TiktokIcon, label: 'TikTok', aria: 'TikTok' },
                { href: festival.facebook.url, icon: Facebook01Icon, label: 'Facebook', aria: 'Facebook' },
              ].map((s) => (
                <a
                  key={s.aria}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.aria} (opens in a new tab)`}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-cream/25 px-5 py-3 font-semibold"
                >
                  <Icon icon={s.icon} size={18} /> {s.label}
                </a>
              ))}
            </div>
            <p className="mt-auto pt-10 text-lavender">
              {brand(festival.name)} · {festival.dateLabel}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
