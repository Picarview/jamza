'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { InboxKind, InboxStatus, Message, Voucher } from './types';

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

/** Friendly wording for the errors an admin can actually hit. */
export function explain(error: { message?: string; code?: string } | null): string {
  if (!error) return 'Something went wrong.';
  if (error.code === '23505') return 'That code already exists.';
  if (error.code === '23514') return 'One of the values isn’t allowed — check the fields and try again.';
  if (error.code === '42501' || /row-level security|permission/i.test(error.message ?? '')) return 'Your account isn’t allowed to do that.';
  if (/fetch|network/i.test(error.message ?? '')) return 'Can’t reach the database. Check your connection.';
  return error.message ?? 'Something went wrong.';
}
