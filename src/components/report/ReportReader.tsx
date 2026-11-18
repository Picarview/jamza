'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft01Icon, ArrowRight01Icon, Download04Icon } from '@hugeicons/core-free-icons';
import { Icon } from '../Icon';

type Page = { title: string; src: string; thumb: string };

/**
 * Reads the PDF as page images inside the site — no browser PDF viewer, no download prompt,
 * same experience on every phone.
 */
export function ReportReader({
  pages,
  size,
  pdf,
  pdfSize,
}: {
  pages: readonly Page[];
  size: { width: number; height: number };
  pdf: string;
  pdfSize: string;
}) {
  const [current, setCurrent] = useState(0);
  const [inView, setInView] = useState(false);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const container = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLOListElement>(null);

  // Which page is in the middle of the screen.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    const visible = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '-30% 0px -30% 0px' });
    if (container.current) visible.observe(container.current);
    return () => {
      io.disconnect();
      visible.disconnect();
    };
  }, []);

  // Keep the active thumbnail visible in the rail.
  useEffect(() => {
    rail.current?.querySelector<HTMLElement>(`[data-thumb="${current}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [current]);

  const go = useCallback(
    (i: number) => {
      const target = Math.max(0, Math.min(pages.length - 1, i));
      refs.current[target]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [pages.length],
  );

  useEffect(() => {
    if (!inView) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        go(current + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        go(current - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inView, current, go]);

  return (
    <div ref={container} className="relative mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[8.5rem_1fr]">
      {/* Thumbnail rail */}
      <nav aria-label="Report pages" className="hidden lg:block">
        <ol ref={rail} className="sticky top-24 flex max-h-[calc(100svh-8rem)] flex-col gap-3 overflow-y-auto py-1 pr-2 [scrollbar-width:thin]">
          {pages.map((p, i) => (
            <li key={p.src}>
              <button
                type="button"
                data-thumb={i}
                onClick={() => go(i)}
                aria-current={i === current ? 'page' : undefined}
                aria-label={`Page ${i + 1}: ${p.title}`}
                className={`group block w-full overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                  i === current ? 'border-gold shadow-[0_0_0_4px_rgb(222_191_131/0.2)]' : 'border-transparent opacity-55 hover:opacity-100'
                }`}
              >
                <img src={p.thumb} alt="" loading="lazy" className="aspect-[1240/1754] w-full object-cover" />
              </button>
              <span className={`mt-1 block text-center text-xs font-semibold ${i === current ? 'text-gold' : 'text-cream/40'}`}>{i + 1}</span>
            </li>
          ))}
        </ol>
      </nav>

      {/* Pages */}
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 sm:gap-10">
        {pages.map((p, i) => (
          <figure
            key={p.src}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-index={i}
            className="scroll-mt-24"
          >
            <Image
              src={p.src}
              alt={`Page ${i + 1} of ${pages.length}: ${p.title}`}
              width={size.width}
              height={size.height}
              priority={i === 0}
              sizes="(min-width: 1024px) 48rem, 100vw"
              className="h-auto w-full rounded-xl shadow-[0_30px_80px_-30px_rgb(0_0_0/0.8)] sm:rounded-2xl"
            />
            <figcaption className="sr-only">{p.title}</figcaption>
          </figure>
        ))}
      </div>

      {/* Floating page control */}
      <AnimatePresence>
        {inView && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="glass glass-tint-plum fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit items-center gap-1 rounded-full p-1.5 text-cream"
          >
            <button type="button" onClick={() => go(current - 1)} disabled={current === 0} aria-label="Previous page" className="grid size-10 place-items-center rounded-full transition-colors hover:bg-cream/15 disabled:opacity-30">
              <Icon icon={ArrowLeft01Icon} size={20} />
            </button>
            <span className="min-w-20 text-center text-sm font-bold tabular-nums" aria-live="polite">
              {current + 1} <span className="text-cream/50">/ {pages.length}</span>
            </span>
            <button type="button" onClick={() => go(current + 1)} disabled={current === pages.length - 1} aria-label="Next page" className="grid size-10 place-items-center rounded-full transition-colors hover:bg-cream/15 disabled:opacity-30">
              <Icon icon={ArrowRight01Icon} size={20} />
            </button>
            <span aria-hidden className="mx-1 h-6 w-px bg-cream/20" />
            <a href={pdf} download className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors hover:bg-cream/15" aria-label={`Download the PDF (${pdfSize})`}>
              <Icon icon={Download04Icon} size={18} />
              <span className="hidden sm:inline">PDF</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
