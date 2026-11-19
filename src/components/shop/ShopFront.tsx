'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Add01Icon, MinusSignIcon, PlusSignIcon, Tick02Icon } from '@hugeicons/core-free-icons';
import { festival } from '@/content/festival';
import type { Product } from '@/content/shop';
import { FormCard } from '../FormCard';
import { Icon } from '../Icon';
import { Reveal } from '../Reveal';

type Cart = Record<string, { qty: number; size?: string }>;

const price = (p: Product) => (p.price !== null ? `${festival.currency} ${p.price}` : 'Price soon');

const copy = {
  shop: { eyebrow: 'The JAMZA! shop', title: 'Bring the noise', side: 'Shake it, wave it, light it up. Your kit for the night.' },
  merch: { eyebrow: 'Festival merch', title: 'For the night itself', side: 'Little extras to make the day yours.' },
};

/** Product window + pre-order form for one group: the JAMZA! shop (/shop) or festival merch (/merch). */
export function ShopFront({ group, note, products }: { group: 'shop' | 'merch'; note: string; products: Product[] }) {
  const [cart, setCart] = useState<Cart>({});
  const line = (id: string) => cart[id] ?? { qty: 0, size: products.find((p) => p.id === id)?.sizes?.[1] };
  const setQty = (id: string, qty: number) =>
    setCart((c) => ({ ...c, [id]: { ...(c[id] ?? line(id)), qty: Math.max(0, Math.min(50, qty)) } }));
  const setSize = (id: string, size: string) => setCart((c) => ({ ...c, [id]: { ...(c[id] ?? line(id)), size } }));
  const total = Object.values(cart).reduce((a, l) => a + l.qty, 0);

  const items = products.filter((p) => p.group === group);

  const basket = (
    <fieldset className="mb-8">
      <legend className="display text-3xl">Your pre-order</legend>
      <div className="mt-5">
          <ul className="grid gap-3">
            {items.map((p) => {
                const { qty, size } = line(p.id);
                return (
                  <li
                    key={p.id}
                    className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border-2 p-3 transition-colors ${qty ? 'border-plum bg-white' : 'border-plum/10 bg-white/60'}`}
                  >
                    {p.image ? (
                      <Image src={p.image} alt="" width={112} height={140} className="h-14 w-11 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className={`grid size-14 shrink-0 place-items-center rounded-xl text-cream ${p.color}`}>
                        {p.icon && <Icon icon={p.icon} size={26} />}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold leading-tight">{p.name}</span>
                      <span className="whitespace-nowrap text-sm text-plum/60">{price(p)}</span>
                    </span>
                    {p.sizes && (
                      <select
                        value={size}
                        onChange={(e) => setSize(p.id, e.target.value)}
                        aria-label={`${p.name} size`}
                        className="rounded-full border-2 border-plum/15 bg-white px-3 py-1.5 text-sm font-bold"
                      >
                        {p.sizes.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    )}
                    <span className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setQty(p.id, qty - 1)}
                        disabled={!qty}
                        aria-label={`Remove one ${p.name}`}
                        className="grid size-9 place-items-center rounded-full border-2 border-plum/15 disabled:opacity-30"
                      >
                        <Icon icon={MinusSignIcon} size={16} />
                      </button>
                      <span className="w-7 text-center font-bold tabular-nums" aria-live="polite" aria-label={`${qty} ${p.name}`}>
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(p.id, qty + 1)}
                        aria-label={`Add one ${p.name}`}
                        className="grid size-9 place-items-center rounded-full bg-plum text-cream"
                      >
                        <Icon icon={PlusSignIcon} size={16} />
                      </button>
                    </span>
                    <input type="hidden" name={`qty-${p.id}`} value={qty} />
                    {p.sizes && <input type="hidden" name={`size-${p.id}`} value={size} />}
                  </li>
                );
              })}
          </ul>
        </div>
      <p className="mt-4 text-sm font-semibold text-plum/60">
        {total ? `${total} item${total === 1 ? '' : 's'} in your pre-order` : 'Nothing picked yet'}
      </p>
    </fieldset>
  );

  return (
    <>
      {/* Shop window */}
      <section aria-labelledby="shop-window" className="bg-cream py-20 text-plum sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-tomato">{copy[group].eyebrow}</p>
              <h2 id="shop-window" className="display mt-3 text-6xl">
                {copy[group].title}
              </h2>
            </div>
            <p className="max-w-xs text-plum/70">{copy[group].side}</p>
          </Reveal>
          {!items.length && (
            <p className="mt-12 rounded-[2rem] border-2 border-dashed border-plum/20 p-8 text-lg text-plum/70">New items are on the way. Check back soon.</p>
          )}
          <ul className={`mt-12 grid gap-8 ${group === 'shop' ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
            {items.map((p, i) => {
              const { qty, size } = line(p.id);
              return (
                <li key={p.id}>
                  <Reveal delay={i * 0.08}>
                    <article className="group overflow-hidden rounded-[2rem] bg-white shadow-[10px_14px_0_rgb(31_5_48/0.12)]">
                      {p.image ? (
                        <div className="overflow-hidden bg-[#e9e9e9]">
                          <Image
                            src={p.image}
                            alt={p.name}
                            width={1000}
                            height={1250}
                            sizes="(min-width: 640px) 34rem, 92vw"
                            className="aspect-[4/5] h-auto w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                        </div>
                      ) : (
                        <div className={`grid aspect-square place-items-center text-cream ${p.color}`}>
                          {p.icon && <Icon icon={p.icon} size={72} strokeWidth={1.4} className="transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110" />}
                        </div>
                      )}
                      <div className="p-6">
                        <div className={`flex gap-2 ${group === 'merch' ? 'flex-col items-start' : 'items-start justify-between gap-4'}`}>
                          <h3 className="headline text-2xl">{p.name}</h3>
                          <span className="shrink-0 rounded-full bg-plum/10 px-3 py-1 text-sm font-bold">{price(p)}</span>
                        </div>
                        <p className="mt-2 text-plum/70">{p.blurb}</p>
                        <div className="mt-5 flex flex-wrap items-center gap-2" role="radiogroup" aria-label={`${p.name} size`}>
                          {p.sizes?.map((s) => (
                            <button
                              key={s}
                              type="button"
                              role="radio"
                              aria-checked={size === s}
                              onClick={() => setSize(p.id, s)}
                              className={`min-w-11 rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-colors ${
                                size === s ? 'border-plum bg-plum text-cream' : 'border-plum/15 hover:border-plum/40'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setQty(p.id, qty + 1);
                              document.getElementById('order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            className="btn ml-auto bg-plum py-3 text-cream shadow-[4px_5px_0_var(--color-tomato)]"
                          >
                            <Icon icon={qty ? Tick02Icon : Add01Icon} size={18} /> {qty ? `${qty} added` : 'Add'}
                          </button>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Order */}
      {items.length > 0 && (
      <section id="order" aria-label="Pre-order" className="scroll-mt-20 bg-night py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <FormCard kind={group} submitLabel="Send pre-order" before={basket} note={note} />
          </Reveal>
        </div>
      </section>
      )}
    </>
  );
}
