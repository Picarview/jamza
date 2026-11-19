'use client';

import { VOUCHER_PATTERN } from '@/lib/forms';
import { newId, useAdmin } from '../store';
import type { Artist, Partner, Product, Voucher } from '../types';
import { Badge, CollectionTable, NotLiveYet, PageTitle, randomCode, type FieldDef } from '../ui';

const visibleField: FieldDef = { name: 'visible', label: 'Visible on the site', type: 'checkbox', placeholder: 'Show it' };
const thumb = (src: string, round = false) =>
  src ? <img src={src} alt="" className={`size-10 shrink-0 bg-white object-cover ${round ? 'rounded-full' : 'rounded-lg'}`} /> : <span className={`size-10 shrink-0 bg-plum/10 ${round ? 'rounded-full' : 'rounded-lg'}`} />;
const shown = (v: boolean) => (v ? <Badge tone="green">Live</Badge> : <Badge tone="grey">Hidden</Badge>);

/* ---------- Vouchers ---------- */

export function Vouchers() {
  const { db, save, remove } = useAdmin();
  return (
    <>
      <PageTitle title="Vouchers" intro="Codes that unlock a free ticket. Visitors enter them in the Tickets section; you approve them from the inbox." />
      <CollectionTable<Voucher>
        rows={db.vouchers}
        noun="voucher"
        search={(v) => `${v.code} ${v.note}`}
        blank={() => ({ id: newId(), code: randomCode(), note: '', maxUses: 1, uses: 0, active: true, expiresAt: '2026-12-18', createdAt: new Date().toISOString() })}
        validate={(v, rows) =>
          !VOUCHER_PATTERN.test(v.code)
            ? 'Codes are 4–24 letters, numbers or dashes.'
            : rows.some((r) => r.code === v.code && r.id !== v.id)
              ? 'That code already exists.'
              : v.uses > v.maxUses
                ? 'Uses can’t be more than the limit.'
                : null
        }
        columns={[
          { label: 'Code', cell: (v) => <span className="font-black tracking-[0.12em]">{v.code}</span> },
          { label: 'For', cell: (v) => <span className="text-plum/70">{v.note || '—'}</span> },
          {
            label: 'Used',
            cell: (v) => (
              <span className="flex min-w-28 items-center gap-2">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-plum/10">
                  <span className="block h-full rounded-full bg-pine" style={{ width: `${Math.min(100, (v.uses / Math.max(1, v.maxUses)) * 100)}%` }} />
                </span>
                <span className="tabular-nums text-plum/60">
                  {v.uses}/{v.maxUses}
                </span>
              </span>
            ),
          },
          { label: 'Expires', cell: (v) => <span className="whitespace-nowrap text-plum/70">{v.expiresAt || 'Never'}</span> },
          {
            label: 'Status',
            cell: (v) =>
              !v.active ? <Badge tone="grey">Off</Badge> : v.uses >= v.maxUses ? <Badge tone="gold">Used up</Badge> : <Badge tone="green">Active</Badge>,
          },
        ]}
        fields={[
          { name: 'code', label: 'Code', type: 'code', required: true, help: 'Tap the arrows to generate one. Letters, numbers and dashes.' },
          { name: 'note', label: 'Who is it for?', placeholder: 'e.g. Giveaway winner, Press, Artist guests' },
          { name: 'maxUses', label: 'Number of free tickets', type: 'number', half: true },
          { name: 'uses', label: 'Already used', type: 'number', half: true },
          { name: 'expiresAt', label: 'Expires on', type: 'date', half: true, help: 'Leave empty for no expiry.' },
          { name: 'active', label: 'Status', type: 'checkbox', placeholder: 'Code can be redeemed', half: true },
        ]}
        onSave={(v) => save('vouchers', v)}
        onDelete={(id) => remove('vouchers', id)}
      />
    </>
  );
}

/* ---------- Shop ---------- */

export function Shop() {
  const { db, save, remove, mode } = useAdmin();
  if (mode === 'supabase') return <NotLiveYet title="Shop" what="Products" />;
  return (
    <>
      <PageTitle title="Shop" intro="JAMZA! shop items and festival merch. Pre-orders arrive in the inbox." />
      <CollectionTable<Product>
        rows={db.products}
        noun="product"
        search={(p) => `${p.name} ${p.group}`}
        blank={() => ({ id: newId(), name: '', group: 'shop', price: '', image: '', sizes: '', blurb: '', visible: true })}
        columns={[
          { label: 'Product', cell: (p) => <span className="flex items-center gap-3">{thumb(p.image)}{p.name}</span> },
          { label: 'Section', cell: (p) => <Badge tone={p.group === 'shop' ? 'plum' : 'red'}>{p.group === 'shop' ? 'JAMZA! shop' : 'Festival merch'}</Badge> },
          { label: 'Price', cell: (p) => (p.price ? `GHC ${p.price}` : <span className="text-plum/50">Price soon</span>) },
          { label: 'Sizes', cell: (p) => <span className="text-plum/70">{p.sizes || '—'}</span> },
          { label: 'Status', cell: (p) => shown(p.visible) },
        ]}
        fields={[
          { name: 'name', label: 'Name', required: true },
          {
            name: 'group',
            label: 'Section',
            type: 'select',
            half: true,
            options: [
              { value: 'shop', label: 'JAMZA! shop' },
              { value: 'merch', label: 'Festival merch' },
            ],
          },
          { name: 'price', label: 'Price (GHC)', half: true, placeholder: 'Leave empty for “Price soon”' },
          { name: 'image', label: 'Photo', type: 'image' },
          { name: 'sizes', label: 'Sizes', placeholder: 'S, M, L, XL, XXL', help: 'Comma separated. Leave empty if it has no sizes.' },
          { name: 'blurb', label: 'Description', type: 'textarea' },
          visibleField,
        ]}
        onSave={(p) => save('products', p)}
        onDelete={(id) => remove('products', id)}
      />
    </>
  );
}

/* ---------- Lineup ---------- */

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function Lineup() {
  const { db, save, remove, mode } = useAdmin();
  if (mode === 'supabase') return <NotLiveYet title="Lineup" what="Artists" />;
  return (
    <>
      <PageTitle title="Lineup" intro="Every artist gets their own page at jamzafestival.com/their-name." />
      <CollectionTable<Artist>
        rows={db.artists}
        noun="artist"
        search={(a) => `${a.name} ${a.role} ${a.handle}`}
        blank={() => ({ id: newId(), slug: '', name: '', role: '', tier: 'main', handle: '', image: '', bio: '', visible: true })}
        validate={(a, rows) => {
          a.slug = a.slug ? slugify(a.slug) : slugify(a.name);
          if (['admin', 'shop', 'visit', 'join', 'partners', '2025'].includes(a.slug)) return 'That page address is taken — change the slug.';
          return rows.some((r) => r.slug === a.slug && r.id !== a.id) ? 'Another artist already uses that page address.' : null;
        }}
        columns={[
          { label: 'Artist', cell: (a) => <span className="flex items-center gap-3">{thumb(a.image, true)}{a.name}</span> },
          { label: 'Billing', cell: (a) => <Badge tone={a.tier === 'main' ? 'plum' : 'gold'}>{a.tier === 'main' ? 'Main' : 'Special guest'}</Badge> },
          { label: 'Role', cell: (a) => <span className="text-plum/70">{a.role}</span> },
          { label: 'Instagram', cell: (a) => <span className="text-plum/70">@{a.handle}</span> },
          { label: 'Page', cell: (a) => <span className="whitespace-nowrap text-plum/50">/{a.slug}</span> },
          { label: 'Status', cell: (a) => shown(a.visible) },
        ]}
        fields={[
          { name: 'name', label: 'Name', required: true, half: true },
          {
            name: 'tier',
            label: 'Billing',
            type: 'select',
            half: true,
            options: [
              { value: 'main', label: 'Main artist' },
              { value: 'guest', label: 'Special guest' },
            ],
          },
          { name: 'role', label: 'Role', placeholder: 'e.g. Neo Afro-soul vocalist' },
          { name: 'handle', label: 'Instagram handle', half: true, placeholder: 'without the @' },
          { name: 'slug', label: 'Page address', half: true, placeholder: 'made from the name', help: 'jamzafestival.com/…' },
          { name: 'image', label: 'Photo', type: 'image' },
          { name: 'bio', label: 'Bio', type: 'textarea', help: 'Leave a blank line between paragraphs.' },
          visibleField,
        ]}
        onSave={(a) => save('artists', a)}
        onDelete={(id) => remove('artists', id)}
      />
    </>
  );
}

/* ---------- Partners ---------- */

export function Partners() {
  const { db, save, remove, mode } = useAdmin();
  if (mode === 'supabase') return <NotLiveYet title="Partners" what="Partners" />;
  return (
    <>
      <PageTitle title="Partners" intro="Shown on the partners page and in the footer of every page." />
      <CollectionTable<Partner>
        rows={db.partners}
        noun="partner"
        search={(p) => `${p.name} ${p.tagline}`}
        blank={() => ({ id: newId(), name: '', image: '', url: '', tagline: '', visible: true })}
        validate={(p) => (p.url && !/^https?:\/\//.test(p.url) ? 'Website links must start with https://' : null)}
        columns={[
          { label: 'Partner', cell: (p) => <span className="flex items-center gap-3">{p.image ? <img src={p.image} alt="" className="h-10 w-16 shrink-0 rounded-lg bg-white object-contain p-1" /> : <span className="h-10 w-16 shrink-0 rounded-lg bg-plum/10" />}{p.name}</span> },
          { label: 'Tagline', cell: (p) => <span className="text-plum/70">{p.tagline || '—'}</span> },
          { label: 'Website', cell: (p) => <span className="text-plum/70">{p.url ? p.url.replace(/^https?:\/\/(www\.)?/, '') : '—'}</span> },
          { label: 'Status', cell: (p) => shown(p.visible) },
        ]}
        fields={[
          { name: 'name', label: 'Name', required: true },
          { name: 'image', label: 'Logo', type: 'image' },
          { name: 'tagline', label: 'Tagline', half: true, placeholder: 'e.g. Our venue' },
          { name: 'url', label: 'Website', half: true, placeholder: 'https://' },
          visibleField,
        ]}
        onSave={(p) => save('partners', p)}
        onDelete={(id) => remove('partners', id)}
      />
    </>
  );
}
