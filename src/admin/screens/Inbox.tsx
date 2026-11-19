'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CheckmarkCircle02Icon, Delete02Icon, MailReply01Icon, Ticket02Icon } from '@hugeicons/core-free-icons';
import { Icon } from '@/components/Icon';
import { ago, kindMeta } from '../kinds';
import { useAdmin } from '../store';
import type { InboxKind, InboxStatus, Message } from '../types';
import { Badge, Button, Card, Drawer, PageTitle } from '../ui';

const statuses: { id: InboxStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'read', label: 'Read' },
  { id: 'done', label: 'Done' },
];

/** Run an admin action and surface any failure. */
const run = (action: () => Promise<unknown>) => action().catch((e: Error) => alert(e.message));

function Detail({ m }: { m: Message }) {
  const { db, save, remove } = useAdmin();
  const autoClaimed = m.body.includes('Claimed automatically');
  const code = m.kind === 'voucher' ? m.body.match(/Voucher code: ([A-Z0-9-]+)/)?.[1] : undefined;
  const voucher = code ? db.vouchers.find((v) => v.code === code) : undefined;
  const expired = voucher?.expiresAt ? new Date(`${voucher.expiresAt}T23:59:59`) < new Date() : false;
  const usable = voucher && voucher.active && !expired && voucher.uses < voucher.maxUses;

  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={kindMeta[m.kind].tone}>{kindMeta[m.kind].label}</Badge>
        <Badge tone={m.status === 'new' ? 'red' : m.status === 'done' ? 'green' : 'grey'}>{m.status}</Badge>
        <span className="text-xs text-plum/50">{new Date(m.date).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
      </div>
      <h2 className="headline mt-4 text-2xl leading-tight">{m.subject}</h2>
      <p className="mt-1 text-sm text-plum/60">
        {m.name} · <a href={`mailto:${m.email}`} className="underline underline-offset-2">{m.email}</a>
      </p>

      {code && (
        <div className={`mt-5 rounded-2xl p-4 ${usable ? 'bg-pine/10' : 'bg-tomato/10'}`}>
          <p className="flex items-center gap-2 font-bold">
            <Icon icon={Ticket02Icon} size={18} /> {code}
          </p>
          <p className="mt-1 text-sm">
            {autoClaimed
              ? `Checked and claimed on the site${voucher ? ` — ${voucher.uses} of ${voucher.maxUses} used` : ''}. Send their free ticket, then mark it sent.`
              : !voucher
              ? 'This code doesn’t exist.'
              : !voucher.active
                ? 'This code is switched off.'
                : expired
                  ? `This code expired on ${voucher.expiresAt}.`
                  : voucher.uses >= voucher.maxUses
                    ? `All ${voucher.maxUses} uses are taken.`
                    : `Valid — ${voucher.uses} of ${voucher.maxUses} used. ${voucher.note}`}
          </p>
          {m.status !== 'done' && (autoClaimed || usable) && (
            <div className="mt-3">
              <Button
                onClick={() =>
                  run(async () => {
                    if (!autoClaimed && voucher) await save('vouchers', { ...voucher, uses: voucher.uses + 1 });
                    await save('messages', { ...m, status: 'done' });
                  })
                }
              >
                <Icon icon={CheckmarkCircle02Icon} size={16} /> {autoClaimed ? 'Mark ticket sent' : 'Approve & use code'}
              </Button>
            </div>
          )}
        </div>
      )}

      <pre className="mt-5 whitespace-pre-wrap break-words rounded-2xl bg-white p-4 font-sans text-[0.95rem] leading-relaxed">{m.body}</pre>

      <div className="mt-5 flex flex-wrap gap-2">
        <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`} className="inline-flex items-center gap-2 rounded-full bg-plum px-4 py-2.5 text-sm font-bold text-cream shadow-[3px_4px_0_var(--color-tomato)]">
          <Icon icon={MailReply01Icon} size={16} /> Reply
        </a>
        <Button variant="ghost" onClick={() => run(() => save('messages', { ...m, status: m.status === 'done' ? 'read' : 'done' }))}>
          <Icon icon={CheckmarkCircle02Icon} size={16} /> {m.status === 'done' ? 'Reopen' : 'Mark done'}
        </Button>
        <Button variant="danger" onClick={() => confirm('Delete this message?') && run(() => remove('messages', m.id))}>
          <Icon icon={Delete02Icon} size={16} /> Delete
        </Button>
      </div>
    </article>
  );
}

export function Inbox() {
  const { db, save } = useAdmin();
  const params = useSearchParams();
  const router = useRouter();
  const [kind, setKind] = useState<InboxKind | 'all'>((params.get('kind') as InboxKind) || 'all');
  const [status, setStatus] = useState<InboxStatus | 'all'>('all');
  const [selected, setSelected] = useState<string | null>(params.get('id'));
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = matchMedia('(max-width: 1023px)');
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const list = useMemo(
    () => db.messages.filter((m) => (kind === 'all' || m.kind === kind) && (status === 'all' || m.status === status)),
    [db.messages, kind, status],
  );
  const current = db.messages.find((m) => m.id === selected) ?? null;

  const open = (m: Message) => {
    setSelected(m.id);
    router.replace(`/admin/inbox?id=${m.id}${kind !== 'all' ? `&kind=${kind}` : ''}`, { scroll: false });
    if (m.status === 'new') void run(() => save('messages', { ...m, status: 'read' }));
  };

  const chip = (active: boolean) =>
    `rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${active ? 'droplet text-plum' : 'glass text-cream/80 hover:text-cream'}`;

  return (
    <>
      <PageTitle title="Inbox" intro="Letters, pre-orders, bookings, applications and voucher codes from the site." />

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
        {(['all', ...Object.keys(kindMeta)] as (InboxKind | 'all')[]).map((k) => (
          <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={chip(kind === k)}>
            {k === 'all' ? 'Everything' : kindMeta[k].label}
            <span className="ml-1.5 opacity-60">{k === 'all' ? db.messages.length : db.messages.filter((m) => m.kind === k).length}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="overflow-hidden">
          <div className="flex gap-1 border-b border-plum/10 p-2" role="tablist" aria-label="Status">
            {statuses.map((s) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={status === s.id}
                onClick={() => setStatus(s.id)}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-bold ${status === s.id ? 'bg-plum text-cream' : 'text-plum/60 hover:bg-plum/5'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <ul className="max-h-[65svh] divide-y divide-plum/10 overflow-y-auto">
            {list.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => open(m)} className={`flex w-full gap-3 px-4 py-3.5 text-left transition-colors ${m.id === selected ? 'bg-plum/[0.07]' : 'hover:bg-plum/[0.04]'}`}>
                  <span className={`mt-2 size-2 shrink-0 rounded-full ${m.status === 'new' ? 'bg-tomato' : 'bg-transparent'}`} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate ${m.status === 'new' ? 'font-black' : 'font-semibold'}`}>{m.name}</span>
                      <span className="shrink-0 text-xs text-plum/50">{ago(m.date)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-plum/70">{m.subject}</span>
                    <span className="mt-1.5 block">
                      <Badge tone={kindMeta[m.kind].tone}>{kindMeta[m.kind].label}</Badge>
                    </span>
                  </span>
                </button>
              </li>
            ))}
            {!list.length && <li className="p-10 text-center text-plum/50">Nothing here.</li>}
          </ul>
        </Card>

        {!narrow && (
          <Card className="p-6">
            {current ? <Detail m={current} /> : <p className="grid min-h-60 place-items-center text-plum/50">Pick a message to read it.</p>}
          </Card>
        )}
      </div>

      {narrow && (
        <Drawer open={Boolean(current)} title="Message" onClose={() => setSelected(null)}>
          {current && <Detail m={current} />}
        </Drawer>
      )}
    </>
  );
}
