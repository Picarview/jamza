'use client';

import { VOUCHER_PATTERN } from '@/lib/forms';
import { newId, useAdmin } from '../store';
import { uploadImage } from '../supabase';
import type { Artist, Partner, Product, Voucher } from '../types';
import { Badge, CollectionTable, NotLiveYet, PageTitle, randomCode, type FieldDef } from '../ui';

const visibleField: FieldDef = { name: 'visible', label: 'Visible on the site', type: 'checkbox', placeholder: 'Show it' };
const thumb = (src: string, round = false) =>
  src ? <img src={src} alt="" className={`size-10 shrink-0 bg-white object-cover ${round ? 'rounded-full' : 'rounded-lg'}`} /> : <span className={`size-10 shrink-0 bg-plum/10 ${round ? 'rounded-full' : 'rounded-lg'}`} />;
const money = /^\d{1,7}(\.\d{1,2})?$/;
const shown = (v: boolean) => (v ? <Badge tone="green">Live</Badge> : <Badge tone="grey">Hidden</Badge>);

/* ---------- Vouchers ---------- */

export function Vouchers() {
  const { db, save, remove } = useAdmin();
  return (
    <>
      <PageTitle
        title="Vouchers"
        intro="Codes visitors redeem in the Tickets section: free tickets, or discounted ones when you set a price (like the Break Time community code). Claims land in the inbox."
      />
      <CollectionTable<Voucher>
        rows={db.vouchers}
        noun="voucher"
        search={(v) => `${v.code} ${v.note}`}
        blank={() => ({ id: newId(), code: randomCode(), note: '', maxUses: 1, uses: 0, active: true, expiresAt: '2026-12-18', price: '', createdAt: new Date().toISOString() })}
        validate={(v, rows) => {
          v.price = v.price.trim().replace(/^(GHC|GHS|GH₵|₵)\s*/i, '');
          return !VOUCHER_PATTERN.test(v.code)
            ? 'Codes are 4–24 letters, numbers or dashes.'
            : rows.some((r) => r.code === v.code && r.id !== v.id)
              ? 'That code already exists.'
              : v.uses > v.maxUses
                ? 'Uses can’t be more than the limit.'
                : v.price && !money.test(v.price)
                  ? 'Ticket price must be a number, e.g. 75.'
                  : null;
        }}
        columns={[
          { label: 'Code', cell: (v) => <span className="font-black tracking-[0.12em]">{v.code}</span> },
          { label: 'For', wrap: true, cell: (v) => <span className="text-plum/70">{v.note || '—'}</span> },
          { label: 'Ticket', cell: (v) => (v.price ? <Badge tone="gold">GHC {v.price}</Badge> : <Badge tone="plum">Free</Badge>) },
          {
            label: 'Used',
            cell: (v) => (
              <span className="flex min-w-32 items-center gap-2">
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
            pin: true,
            cell: (v) =>
              !v.active ? <Badge tone="grey">Off</Badge> : v.uses >= v.maxUses ? <Badge tone="gold">Used up</Badge> : <Badge tone="green">Active</Badge>,
          },
        ]}
        fields={[
          { name: 'code', label: 'Code', type: 'code', required: true, help: 'Tap the arrows to generate one. Letters, numbers and dashes.' },
          { name: 'note', label: 'Who is it for?', placeholder: 'e.g. Giveaway winner, Press, Artist guests' },
          { name: 'price', label: 'Ticket price (GHC)', half: true, placeholder: 'Empty = free ticket', help: 'Set a price for discount codes, e.g. 75.' },
          { name: 'maxUses', label: 'Number of tickets', type: 'number', half: true, help: 'One per person.' },
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

const productScreens = {
  shop: {
    title: 'Shop',
    noun: 'item',
    intro: 'Items in the JAMZA! shop. Changes show on the site straight away; pre-orders arrive in the inbox with a total.',
  },
  merch: {
    title: 'Merch',
    noun: 'merch item',
    intro: 'Festival merch for the night itself. Changes show on the site straight away; pre-orders arrive in the inbox with a total.',
  },
};

function Products({ group }: { group: Product['group'] }) {
  const { db, save, remove, mode } = useAdmin();
  const screen = productScreens[group];
  const rows = db.products.filter((p) => p.group === group);
  return (
    <>
      <PageTitle title={screen.title} intro={screen.intro} />
      <CollectionTable<Product>
        rows={rows}
        noun={screen.noun}
        search={(p) => `${p.name} ${p.blurb}`}
        blank={() => ({
          id: newId(),
          name: '',
          group,
          price: '',
          image: '',
          sizes: '',
          blurb: '',
          visible: true,
          sort: Math.max(0, ...rows.map((r) => r.sort)) + 1,
        })}
        validate={(p) => {
          p.price = p.price.trim().replace(/^(GHC|GHS|GH₵|₵)\s*/i, '');
          if (p.price && !money.test(p.price)) return 'Price must be a number, e.g. 80 or 12.50.';
          if (p.sort < 1) p.sort = 1;
          return null;
        }}
        columns={[
          { label: 'Item', cell: (p) => <span className="flex items-center gap-3">{thumb(p.image)}{p.name}</span> },
          { label: 'Price', cell: (p) => (p.price ? `GHC ${p.price}` : <span className="text-plum/50">Price soon</span>) },
          { label: 'Sizes', from: 'xl', cell: (p) => <span className="text-plum/70">{p.sizes || '—'}</span> },
          { label: 'Order', from: 'xl', cell: (p) => <span className="tabular-nums text-plum/60">{p.sort}</span> },
          { label: 'Status', pin: true, cell: (p) => shown(p.visible) },
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
            help: 'Moves the item between Shop and Merch.',
          },
          { name: 'price', label: 'Price (GHC)', half: true, placeholder: 'Leave empty for “Price soon”' },
          { name: 'sort', label: 'Position', type: 'number', half: true, help: '1 shows first.' },
          {
            name: 'image',
            label: 'Photo',
            type: 'image',
            upload: mode === 'supabase' ? (file) => uploadImage('shop-images', file) : undefined,
            help: 'JPG, PNG or WebP. It’s resized automatically.',
          },
          { name: 'blurb', label: 'Description', type: 'textarea', placeholder: 'One or two short lines.' },
          { name: 'sizes', label: 'Sizes', placeholder: 'e.g. S, M, L', help: 'Optional. Comma separated; leave empty if it has no sizes.' },
          visibleField,
        ]}
        onSave={(p) => save('products', p)}
        onDelete={(id) => remove('products', id)}
      />
    </>
  );
}

export const Shop = () => <Products group="shop" />;
export const Merch = () => <Products group="merch" />;

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
          { label: 'Role', wrap: true, cell: (a) => <span className="text-plum/70">{a.role}</span> },
          { label: 'Instagram', from: 'xl', cell: (a) => <span className="text-plum/70">@{a.handle}</span> },
          { label: 'Page', from: 'xl', cell: (a) => <span className="whitespace-nowrap text-plum/50">/{a.slug}</span> },
          { label: 'Status', pin: true, cell: (a) => shown(a.visible) },
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
          { label: 'Tagline', wrap: true, cell: (p) => <span className="text-plum/70">{p.tagline || '—'}</span> },
          { label: 'Website', from: 'xl', cell: (p) => <span className="text-plum/70">{p.url ? p.url.replace(/^https?:\/\/(www\.)?/, '') : '—'}</span> },
          { label: 'Status', pin: true, cell: (p) => shown(p.visible) },
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
