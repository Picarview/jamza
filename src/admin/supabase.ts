'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { InboxKind, InboxStatus, Message, Product, Voucher } from './types';

/**
 * Browser client for the admin. Uses the public anon key; what a signed-in user can read or
 * change is decided by row-level security (jamza_is_admin), not by this code.
 */
let client: SupabaseClient | null | undefined;

export function adminClient(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && key ? createClient(url, key, { auth: { storageKey: 'jamza.admin.auth', persistSession: true, autoRefreshToken: true } }) : null;
  return client;
}

type Row = Record<string, unknown>;
const kinds: InboxKind[] = ['letter', 'shop', 'merch', 'shuttle', 'vendor', 'sales-team', 'voucher'];

/* ---------- Messages ---------- */

export const toMessage = (r: Row): Message => ({
  id: String(r.id),
  kind: kinds.includes(r.kind as InboxKind) ? (r.kind as InboxKind) : 'letter',
  name: String(r.name ?? ''),
  email: String(r.email ?? ''),
  subject: String(r.subject ?? ''),
  body: String(r.message ?? ''),
  date: String(r.date ?? r.created_at),
  status: (['new', 'read', 'done'] as InboxStatus[]).includes(r.status as InboxStatus) ? (r.status as InboxStatus) : r.read ? 'read' : 'new',
});

// Only the workflow fields are ever written back; message content is never edited.
export const fromMessage = (m: Message) => ({ status: m.status, read: m.status !== 'new' });

/* ---------- Vouchers ---------- */

export const toVoucher = (r: Row): Voucher => ({
  id: String(r.id),
  code: String(r.code),
  note: String(r.note ?? ''),
  maxUses: Number(r.max_uses ?? 1),
  uses: Number(r.uses ?? 0),
  active: Boolean(r.active),
  expiresAt: r.expires_at ? String(r.expires_at) : '',
  createdAt: String(r.created_at ?? ''),
});

export const fromVoucher = (v: Voucher) => ({
  id: v.id,
  code: v.code,
  note: v.note,
  max_uses: v.maxUses,
  uses: v.uses,
  active: v.active,
  expires_at: v.expiresAt || null,
});

/* ---------- Shop products ---------- */

export const toProduct = (r: Row): Product => ({
  id: String(r.id),
  name: String(r.name ?? ''),
  group: r.section === 'merch' ? 'merch' : 'shop',
  price: r.price === null || r.price === undefined ? '' : String(Number(r.price)),
  image: String(r.image ?? ''),
  sizes: String(r.sizes ?? ''),
  blurb: String(r.blurb ?? ''),
  visible: Boolean(r.visible),
  sort: Number(r.sort ?? 1000),
});

export const fromProduct = (p: Product) => ({
  id: p.id,
  name: p.name.trim(),
  section: p.group,
  price: p.price.trim() === '' ? null : Number(p.price),
  image: p.image.trim(),
  sizes: p.sizes
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .join(', '),
  blurb: p.blurb.trim(),
  visible: p.visible,
  sort: p.sort,
});

/* ---------- Image uploads ---------- */

/**
 * Shrink a photo in the browser (max 1600px, WebP) and upload it to a public bucket. Phone photos
 * are often 5–10 MB; this keeps them well under the bucket limit and fast on the site.
 */
export async function uploadImage(bucket: string, file: File): Promise<string> {
  const supabase = adminClient();
  if (!supabase) throw new Error('Uploads need the database connection.');
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) throw new Error('Use a JPG, PNG or WebP photo.');

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/webp', 0.85));
  if (!blob) throw new Error('Couldn’t read that photo.');

  const path = `${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000' });
  if (error) throw new Error(/bucket/i.test(error.message) ? 'Photo storage isn’t set up yet — run the shop migration.' : explain(error));
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/** Friendly wording for the errors an admin can actually hit. */
export function explain(error: { message?: string; code?: string } | null): string {
  if (!error) return 'Something went wrong.';
  if (error.code === '23505') return 'That code already exists.';
  if (error.code === '23514') return 'One of the values isn’t allowed — check the fields and try again.';
  if (error.code === '42501' || /row-level security|permission/i.test(error.message ?? '')) return 'Your account isn’t allowed to do that.';
  if (/fetch|network/i.test(error.message ?? '')) return 'Can’t reach the database. Check your connection.';
  return error.message ?? 'Something went wrong.';
}
