'use client';

import Link from 'next/link';
import { ArrowRight01Icon, InboxIcon, Mic01Icon, ShoppingBag01Icon, Ticket02Icon } from '@hugeicons/core-free-icons';
import { Icon } from '@/components/Icon';
import { festival } from '@/content/festival';
import { ago, kindMeta } from '../kinds';
import { useAdmin } from '../store';
import { Badge, Card, PageTitle } from '../ui';

export function Overview() {
  const { db, mode } = useAdmin();
  const days = Math.max(0, Math.ceil((new Date(festival.startsAt).getTime() - Date.now()) / 86_400_000));
  const unread = db.messages.filter((m) => m.status === 'new');
  const preorders = db.messages.filter((m) => m.kind === 'shop' || m.kind === 'merch');
  const redeemed = db.vouchers.reduce((a, v) => a + v.uses, 0);
  const capacity = db.vouchers.reduce((a, v) => a + v.maxUses, 0);

  const stats = [
    { label: 'New in inbox', value: unread.length, href: '/admin/inbox', icon: InboxIcon, accent: 'bg-tomato' },
    { label: 'Shop & merch orders', value: preorders.length, href: '/admin/inbox?kind=shop', icon: ShoppingBag01Icon, accent: 'bg-ember' },
    { label: `Vouchers used of ${capacity}`, value: redeemed, href: '/admin/vouchers', icon: Ticket02Icon, accent: 'bg-pine' },
    mode === 'supabase'
      ? { label: 'Active voucher codes', value: db.vouchers.filter((v) => v.active && v.uses < v.maxUses).length, href: '/admin/vouchers', icon: Ticket02Icon, accent: 'bg-plum' }
      : { label: 'Artists on the lineup', value: db.artists.filter((a) => a.visible).length, href: '/admin/lineup', icon: Mic01Icon, accent: 'bg-plum' },
  ];

  return (
    <>
      <PageTitle title="Overview" intro={`${days} day${days === 1 ? '' : 's'} to ${festival.name} · ${festival.dateLabel}.`} />

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="glass group flex h-full flex-col justify-between gap-6 rounded-[1.75rem] p-5 transition-transform hover:-translate-y-1">
              <span className={`grid size-11 place-items-center rounded-full text-cream ${s.accent}`}>
                <Icon icon={s.icon} size={20} />
              </span>
              <span>
                <span className="headline block text-5xl tabular-nums">{s.value}</span>
                <span className="mt-1 flex items-center justify-between text-sm text-cream/70">
                  {s.label}
                  <Icon icon={ArrowRight01Icon} size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="display text-3xl">Latest in the inbox</h2>
            <Link href="/admin/inbox" className="text-sm font-bold text-plum/70 hover:text-plum">
              Open inbox
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-plum/10">
            {db.messages.slice(0, 5).map((m) => (
              <li key={m.id}>
                <Link href={`/admin/inbox?id=${m.id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                  <span className={`size-2 shrink-0 rounded-full ${m.status === 'new' ? 'bg-tomato' : 'bg-transparent'}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{m.subject}</span>
                    <span className="text-xs text-plum/55">
                      {m.name} · {ago(m.date)}
                    </span>
                  </span>
                  <Badge tone={kindMeta[m.kind].tone}>{kindMeta[m.kind].label}</Badge>
                </Link>
              </li>
            ))}
            {!db.messages.length && <li className="py-6 text-center text-plum/50">Nothing yet.</li>}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="display text-3xl">By type</h2>
          <ul className="mt-4 space-y-3">
            {Object.entries(kindMeta).map(([kind, meta]) => {
              const count = db.messages.filter((m) => m.kind === kind).length;
              const max = Math.max(1, ...Object.keys(kindMeta).map((k) => db.messages.filter((m) => m.kind === k).length));
              return (
                <li key={kind}>
                  <Link href={`/admin/inbox?kind=${kind}`} className="block">
                    <span className="flex justify-between text-sm font-semibold">
                      {meta.label}
                      <span className="tabular-nums text-plum/60">{count}</span>
                    </span>
                    <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-plum/10">
                      <span className="block h-full rounded-full bg-plum" style={{ width: `${(count / max) * 100}%` }} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
