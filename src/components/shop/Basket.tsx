'use client';

import { useState } from 'react';
import { MinusSignIcon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { festival } from '@/content/festival';
import { shopProducts } from '@/content/shop';
import { Icon } from '../Icon';

/** Product tiles with quantity steppers; quantities submit as qty-<id>. */
export function Basket() {
  const [qty, setQty] = useState<Record<string, number>>({});
  const set = (id: string, n: number) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(50, n)) }));
  const total = Object.values(qty).reduce((a, b) => a + b, 0);

  return (
    <fieldset className="mb-8">
      <legend className="display text-3xl">Pick your merch</legend>
      <ul className="mt-5 grid gap-3">
        {shopProducts.map((p) => {
          const n = qty[p.id] ?? 0;
          return (
            <li
              key={p.id}
              className={`flex items-center gap-4 rounded-2xl border-2 p-3 transition-colors ${n ? 'border-plum bg-white' : 'border-plum/10 bg-white/60'}`}
            >
              <span className={`grid size-14 shrink-0 place-items-center rounded-xl text-cream ${p.color}`}>
                <Icon icon={p.icon} size={28} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold leading-tight">{p.name}</span>
                <span className="whitespace-nowrap text-sm text-plum/60">
                  {p.price !== null ? `${festival.currency} ${p.price}` : 'Price soon'}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <button type="button" onClick={() => set(p.id, n - 1)} disabled={!n} aria-label={`Remove one ${p.name}`} className="grid size-9 place-items-center rounded-full border-2 border-plum/15 disabled:opacity-30">
                  <Icon icon={MinusSignIcon} size={16} />
                </button>
                <span className="w-7 text-center font-bold tabular-nums" aria-live="polite" aria-label={`${n} ${p.name}`}>
                  {n}
                </span>
                <button type="button" onClick={() => set(p.id, n + 1)} aria-label={`Add one ${p.name}`} className="grid size-9 place-items-center rounded-full bg-plum text-cream">
                  <Icon icon={PlusSignIcon} size={16} />
                </button>
              </span>
              <input type="hidden" name={`qty-${p.id}`} value={n} />
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm font-semibold text-plum/60">
        {total ? `${total} item${total === 1 ? '' : 's'} in your pre-order` : 'Nothing picked yet'}
      </p>
    </fieldset>
  );
}
