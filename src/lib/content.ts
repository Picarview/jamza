import 'server-only';
import { cache } from 'react';
import { ShoppingBag01Icon } from '@hugeicons/core-free-icons';
import type { SupabaseClient } from '@supabase/supabase-js';
import { festival } from '@/content/festival';
import { vendors } from '@/content/join';
import { lineup as staticLineup, type LineupArtist, type Photo } from '@/content/lineup';
import { starterPartners } from '@/content/partners';
import { shop, shopProducts as staticProducts, type Product } from '@/content/shop';
import { shuttle } from '@/content/visit';
import type { PartnerTag } from '@/components/home/Partners';
import { getPublicClient } from './supabase';
import type { Post, Settings } from './types';

/**
 * Public site content.
 *
 * For now the site is mostly static: lineup, partners and festival details come
 * from src/content/*. Always live: announcements (jamza_posts) and the JAMZA! shop and festival
 * merch (jamza_products), which are managed from the admin panel.
 *
 * Set LIVE_CONTENT to true to read everything from Supabase instead (the tables are already
 * seeded). Each source then loads independently and falls back to the content files when its
 * table is empty, missing or unreachable.
 */
const LIVE_CONTENT = false;

const PAGE_SIZE = 500;
type Row = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v : '');

async function listAll(client: SupabaseClient, table: string, order: string, filter?: (q: any) => any) {
  const rows: Row[] = [];
  for (let start = 0; ; start += PAGE_SIZE) {
    let query = client.from(table).select('*').order(order, { ascending: order === 'sort' }).order('id').range(start, start + PAGE_SIZE - 1);
    if (filter) query = filter(query);
    const { data, error } = await query;
    if (error) throw error;
    rows.push(...(data as Row[]));
    if (data.length < PAGE_SIZE) return rows;
  }
}

async function attempt<T>(label: string, load: () => Promise<T>, fallback: T): Promise<{ value: T; live: boolean }> {
  try {
    return { value: await load(), live: true };
  } catch (error) {
    console.warn(`Supabase ${label}: ${(error as Error).message} — using built-in content.`);
    return { value: fallback, live: false };
  }
}

/* ---------- Settings ---------- */

export const defaultSettings: Settings = {
  id: 'site',
  title: 'jamza',
  email: festival.email,
  instagram: festival.instagram.url,
  linkedin: '',
  ticketUrl: festival.ticketUrl,
  communityPrice: null,
  shopDeadline: shop.deadline,
  shuttleDeparture: shuttle.departure,
  shuttleReturn: shuttle.return,
  vendorDeadline: vendors.deadline,
};

const placeholderEmails = ['hello@picarview.com', 'hello@jamza.com', 'example@jamza.com'];

function toSettings(row: Row): Settings {
  const email = str(row.email).trim();
  const price = Number(str(row.community_price).replace(/[^\d.]/g, ''));
  return {
    id: 'site',
    title: str(row.title).trim().toLowerCase() === 'picarview' ? 'jamza' : str(row.title) || 'jamza',
    email: !email || placeholderEmails.includes(email.toLowerCase()) ? festival.email : email,
    instagram: str(row.instagram) || festival.instagram.url,
    linkedin: str(row.linkedin),
    ticketUrl: str(row.ticket_url) || festival.ticketUrl,
    communityPrice: str(row.community_price) && price > 0 ? price : null,
    shopDeadline: str(row.shop_deadline) || shop.deadline,
    shuttleDeparture: str(row.shuttle_departure) || shuttle.departure,
    shuttleReturn: str(row.shuttle_return) || shuttle.return,
    vendorDeadline: str(row.vendor_deadline) ? `${str(row.vendor_deadline)}T23:59:59Z` : vendors.deadline,
  };
}

/* ---------- Lineup ---------- */

const accents = ['tomato', 'pine', 'plum', 'ember'] as const;

function toArtist(row: Row, i: number): LineupArtist {
  const slug = str(row.slug) || str(row.id);
  const known = staticLineup.find((a) => a.slug === slug);
  const image = str(row.image);
  // Keep known photo sizes and galleries for artists that came from the content file.
  const photos: Photo[] =
    known && known.image === image ? known.photos : image ? [{ src: image, width: 1200, height: 1500 }] : [];
  const handle = str(row.handle).replace(/^@/, '');
  return {
    id: str(row.id),
    slug,
    name: str(row.name),
    role: str(row.role),
    tier: row.tier === 'guest' ? 'guest' : 'main',
    handle,
    image,
    url: handle ? `https://www.instagram.com/${handle}/` : '',
    bio: str(row.bio).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    photos,
    accent: accents[i % accents.length],
  };
}

/* ---------- Partners & products ---------- */

const toPartner = (row: Row): PartnerTag => ({
  id: str(row.id),
  name: str(row.name),
  url: str(row.url),
  image: str(row.image),
  tagline: str(row.tagline),
});

function toProduct(row: Row): Product {
  const id = str(row.id);
  const known = staticProducts.find((p) => p.id === id);
  const section = row.section === 'merch' ? 'merch' : 'shop';
  const sizes = str(row.sizes).split(',').map((s) => s.trim()).filter(Boolean);
  const price = row.price === null || row.price === undefined ? null : Number(row.price);
  return {
    id,
    name: str(row.name),
    blurb: str(row.blurb),
    price: price !== null && Number.isFinite(price) ? price : null,
    group: section,
    image: str(row.image) || undefined,
    icon: known?.icon ?? ShoppingBag01Icon,
    color: known?.color ?? (section === 'merch' ? 'bg-tomato' : 'bg-plum'),
    sizes: sizes.length ? sizes : undefined,
  };
}

/* ---------- Public content ---------- */

export type PublicContent = {
  posts: Post[];
  lineup: LineupArtist[];
  partners: PartnerTag[];
  products: Product[];
  settings: Settings;
  live: { lineup: boolean; partners: boolean; products: boolean; settings: boolean };
};

const staticPartners: PartnerTag[] = starterPartners.map((p) => ({ id: p.id, name: p.name, url: p.url, image: p.image ?? '', tagline: p.tagline }));

export const getPublicContent = cache(async (): Promise<PublicContent> => {
  const client = getPublicClient();
  if (!client || !LIVE_CONTENT) {
    // Announcements were already managed in Supabase before the 2026 rebuild; keep reading them.
    const [posts, shopItems] = client
      ? await Promise.all([
          attempt(
            'posts',
            async () => (await listAll(client, 'jamza_posts', 'created_at', (q) => q.eq('status', 'Published'))) as unknown as Post[],
            [] as Post[],
          ),
          // Shop and merch are managed in the admin. An empty result is real (nothing on sale right
          // now); only an unreachable database falls back to the content file.
          attempt('products', async () => (await listAll(client, 'jamza_products', 'sort')).map(toProduct), staticProducts),
        ])
      : [{ value: [] as Post[] }, { value: staticProducts, live: false }];
    return {
      posts: posts.value.sort((a, b) => b.date.localeCompare(a.date)),
      lineup: staticLineup,
      partners: staticPartners,
      products: shopItems.value,
      settings: defaultSettings,
      live: { lineup: false, partners: false, products: Boolean(shopItems.live), settings: false },
    };
  }
  const [settings, artists, partners, products, posts] = await Promise.all([
    attempt('settings', async () => {
      const { data, error } = await client.from('jamza_settings').select('*').eq('id', 'site').single();
      if (error) throw error;
      return toSettings(data as Row);
    }, defaultSettings),
    attempt('artists', async () => (await listAll(client, 'jamza_artists', 'sort')).map(toArtist), staticLineup),
    attempt('partners', async () => (await listAll(client, 'jamza_partners', 'sort')).map(toPartner), staticPartners),
    attempt('products', async () => (await listAll(client, 'jamza_products', 'sort')).map(toProduct), staticProducts),
    attempt(
      'posts',
      async () => (await listAll(client, 'jamza_posts', 'created_at', (q) => q.eq('status', 'Published'))) as unknown as Post[],
      [] as Post[],
    ),
  ]);
  // An empty table means "not set up yet", not "show nothing".
  const pick = <T,>(r: { value: T[]; live: boolean }, fallback: T[]) => (r.value.length ? r.value : fallback);
  return {
    posts: posts.value.sort((a, b) => b.date.localeCompare(a.date)),
    lineup: pick(artists, staticLineup),
    partners: pick(partners, staticPartners),
    products: pick(products, staticProducts),
    settings: settings.value,
    live: {
      lineup: artists.live && artists.value.length > 0,
      partners: partners.live && partners.value.length > 0,
      products: products.live && products.value.length > 0,
      settings: settings.live,
    },
  };
});

export const getArtist = async (slug: string) => (await getPublicContent()).lineup.find((a) => a.slug === slug);
