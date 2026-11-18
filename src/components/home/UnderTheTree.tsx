'use client';

import { useRef, useState } from 'react';
import { ArrowUpRight01Icon, Cancel01Icon, GiftIcon } from '@hugeicons/core-free-icons';
import { safeUrl } from '@/lib/safe-url';
import type { Partner, Post } from '@/lib/types';
import { Icon } from '../Icon';
import { Marquee } from '../Marquee';
import { Reveal } from '../Reveal';
import { brand } from '../Brand';

const tagColors = ['bg-tomato', 'bg-pine', 'bg-plum', 'bg-ember'];

function formatDate(date: string) {
  const d = new Date(`${date}T00:00:00`);
  return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Announcements as gift tags hanging from a string; partners as the people who wrapped them. */
export function UnderTheTree({ posts, partners }: { posts: Post[]; partners: Partner[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Post | null>(null);
  const show = (post: Post) => {
    setOpen(post);
    dialog.current?.showModal();
  };

  return (
    <section id="under-the-tree" aria-labelledby="tree-title" className="relative overflow-hidden bg-cream py-28 text-plum">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-tomato">Announcements & stories</p>
            <h2 id="tree-title" className="display mt-4 text-6xl sm:text-7xl">
              Under the tree
            </h2>
          </div>
          <p className="max-w-xs text-plum/70">Little updates, wrapped and tagged. Pull one to open it.</p>
        </Reveal>

        {/* The string the tags hang from. */}
        <div className="relative mt-14">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="absolute inset-x-0 -top-3 h-12 w-full text-plum/30" aria-hidden>
            <path d="M0 10 Q300 60 600 20 T1200 14" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
          </svg>

          {posts.length ? (
            <ul className="relative grid gap-8 pt-10 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 6).map((post, i) => (
                <li key={post.id} className="origin-top" style={{ rotate: `${[-3, 2, -1.5, 3, -2, 1.5][i % 6]}deg` }}>
                  <Reveal delay={i * 0.08} y={-30}>
                    <button
                      type="button"
                      onClick={() => show(post)}
                      className="group relative block w-full origin-top rounded-[1.75rem] bg-white p-3 text-left shadow-[8px_12px_0_rgb(31_5_48/0.15)] transition-transform duration-500 ease-[var(--ease-spring)] hover:rotate-0 hover:scale-[1.02]"
                      style={{ clipPath: 'polygon(14% 0, 86% 0, 100% 9%, 100% 100%, 0 100%, 0 9%)' }}
                    >
                      <span aria-hidden className="absolute left-1/2 top-3 size-4 -translate-x-1/2 rounded-full border-4 border-plum/20 bg-cream" />
                      <span className={`mt-6 block overflow-hidden rounded-[1.25rem] ${tagColors[i % 4]}`}>
                        {safeUrl(post.image) ? (
                          <img src={safeUrl(post.image)} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <span className="grid aspect-[4/3] place-items-center text-cream"><Icon icon={GiftIcon} size={56} /></span>
                        )}
                      </span>
                      <span className="block px-2 pb-3 pt-5">
                        <span className="eyebrow text-tomato">{post.category} · {formatDate(post.date)}</span>
                        <span className="headline mt-2 block text-2xl leading-tight">{brand(post.title)}</span>
                        <span className="mt-2 line-clamp-2 block text-sm text-plum/70">{brand(post.excerpt)}</span>
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold">
                          Open it <Icon icon={ArrowUpRight01Icon} size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </span>
                      </span>
                    </button>
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : (
            <div className="relative flex flex-col items-center pt-16 text-center">
              <span className="grid size-24 animate-wobble place-items-center rounded-[1.75rem] bg-tomato text-cream shadow-[6px_8px_0_rgb(31_5_48/0.2)]">
                <Icon icon={GiftIcon} size={44} />
              </span>
              <p className="display mt-8 text-4xl">Still wrapping…</p>
              <p className="mt-2 text-plum/70">Announcements will land under the tree soon.</p>
            </div>
          )}
        </div>
      </div>

      {partners.length > 0 && (
        <div className="mt-28">
          <p className="eyebrow text-center text-plum/60">Wrapped with love by</p>
          <Marquee
            duration={Math.max(20, partners.length * 6)}
            className="mt-6 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]"
            items={partners.map((p) => {
              const url = safeUrl(p.url);
              const inner = (
                <span className="flex items-center gap-3 rounded-full border-2 border-plum/15 bg-white px-5 py-3 font-bold transition-colors hover:bg-plum hover:text-cream">
                  {safeUrl(p.image) ? <img src={safeUrl(p.image)} alt="" className="h-8 w-auto max-w-24 object-contain" /> : null}
                  {p.name}
                </span>
              );
              return url ? (
                <a href={url} target="_blank" rel="noopener noreferrer">{inner}</a>
              ) : (
                inner
              );
            })}
          />
        </div>
      )}

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        aria-labelledby="post-title"
        className="m-auto max-h-[88svh] w-[min(92vw,44rem)] overflow-y-auto rounded-[2rem] bg-cream p-0 text-plum backdrop:bg-night/70 backdrop:backdrop-blur-md"
      >
        {open && (
          <article>
            {safeUrl(open.image) && <img src={safeUrl(open.image)} alt="" className="aspect-[16/9] w-full object-cover" />}
            <div className="p-6 sm:p-10">
              <p className="eyebrow text-tomato">{open.category} · {formatDate(open.date)}</p>
              <h3 id="post-title" className="headline mt-3 text-4xl">{brand(open.title)}</h3>
              <div className="mt-6 whitespace-pre-line text-lg leading-relaxed text-plum/85">{brand(open.body)}</div>
            </div>
          </article>
        )}
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          aria-label="Close"
          className="droplet absolute right-4 top-4 grid size-11 place-items-center rounded-full text-plum"
        >
          <Icon icon={Cancel01Icon} size={20} />
        </button>
      </dialog>
    </section>
  );
}
