'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { festival } from '@/content/festival';
import { readPublicConfig } from '@/lib/env';
import { getPublicClient } from '@/lib/supabase';
import { forms, VOUCHER_PATTERN, type FormKind } from '@/lib/forms';
import { getPublicContent } from '@/lib/content';

export type LetterState = { status: 'idle' | 'sent' | 'error'; message: string };

const limits = { name: 100, email: 200, subject: 160, message: 5000 } as const;

/** Send a contact message through the existing rate-limited Supabase function. */
export async function sendLetter(_: LetterState, form: FormData): Promise<LetterState> {
  if (String(form.get('website') ?? '').trim()) return { status: 'sent', message: 'Sent!' }; // honeypot
  const values = {} as Record<keyof typeof limits, string>;
  for (const [key, max] of Object.entries(limits) as [keyof typeof limits, number][]) {
    const value = String(form.get(key) ?? '').trim();
    if (!value || value.length > max) {
      return { status: 'error', message: `Please fill in your ${key === 'subject' ? 'reason for writing' : key}.` };
    }
    values[key] = value;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    return { status: 'error', message: 'That email address doesn’t look quite right.' };
  }
  const client = getPublicClient();
  if (!client) return { status: 'error', message: 'Letters can’t be sent right now. Please email us instead.' };
  const { error } = await client.rpc('jamza_submit_message', {
    p_name: values.name,
    p_email: values.email,
    p_subject: values.subject,
    p_message: values.message,
  });
  if (error) {
    return {
      status: 'error',
      message: error.message.includes('Too many')
        ? 'You’ve sent a few letters already — give us 15 minutes to catch up.'
        : 'Your letter couldn’t be sent. Please try again or email us directly.',
    };
  }
  return { status: 'sent', message: 'Your letter is on its way to the JAMZA! team.' };
}

/** Shop, shuttle, vendor and sales-team forms → admin inbox. */
export async function submitForm(kind: FormKind, _: LetterState, form: FormData): Promise<LetterState> {
  const config = forms[kind];
  if (!config) return { status: 'error', message: 'Unknown form.' };
  if (String(form.get('website') ?? '').trim()) return { status: 'sent', message: 'Sent!' }; // honeypot

  const values: Record<string, string> = {};
  for (const field of config.fields) {
    let value = String(form.get(field.name) ?? '').trim();
    if (field.type === 'checkbox') value = value ? 'Yes' : '';
    if (field.name === 'code') {
      value = value.toUpperCase().replace(/\s+/g, '');
      if (value && !VOUCHER_PATTERN.test(value)) return { status: 'error', message: 'That code doesn’t look right — check it and try again.' };
    }
    if (field.required && !value) return { status: 'error', message: `Please fill in “${field.label.replace(/[.:].*$/, '')}”.` };
    if (value.length > (field.maxLength ?? 500)) return { status: 'error', message: `“${field.label}” is too long.` };
    if (field.type === 'select' && value && !field.options?.includes(value)) return { status: 'error', message: 'Please choose an option.' };
    if (field.type === 'number' && value) {
      const n = Number(value);
      if (!Number.isInteger(n) || n < (field.min ?? 0) || n > (field.max ?? 99)) {
        return { status: 'error', message: `“${field.label}” must be between ${field.min} and ${field.max}.` };
      }
    }
    values[field.name] = value;
  }

  // Shop: quantities per product, sent as qty-<id>.
  let items = '';
  if (kind === 'shop' || kind === 'merch') {
    const { products } = await getPublicContent();
    const picked = products
      .filter((p) => p.group === kind)
      .map((p) => ({ p, qty: Number(form.get(`qty-${p.id}`) ?? 0) }))
      .filter(({ qty }) => Number.isInteger(qty) && qty > 0 && qty <= 50);
    if (!picked.length) return { status: 'error', message: 'Add at least one item to your pre-order.' };
    const lines = picked.map(({ p, qty }) => {
      const size = String(form.get(`size-${p.id}`) ?? '');
      const cost = p.price !== null ? ` — ${festival.currency} ${qty * p.price}` : '';
      return `• ${qty} × ${p.name}${p.sizes?.includes(size) ? ` (${size})` : ''}${cost}`;
    });
    // Prices come from the server's copy of the products, never from the form.
    const total = picked.every(({ p }) => p.price !== null) ? picked.reduce((sum, { p, qty }) => sum + qty * (p.price ?? 0), 0) : null;
    items = `Items:\n${lines.join('\n')}\n${total !== null ? `Total: ${festival.currency} ${total}\n` : ''}\n`;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email ?? '')) {
    return { status: 'error', message: 'That email address doesn’t look quite right.' };
  }

  const name = values.name || values.business;
  const body =
    items +
    config.fields
      .filter((f) => values[f.name] && f.name !== 'email')
      .map((f) => `${f.label.replace(/:.*$/, '')}: ${values[f.name]}`)
      .join('\n');

  const client = getPublicClient();
  if (!client) return { status: 'error', message: 'This form can’t be sent right now. Please email us instead.' };
  const busy = (message: string) =>
    message.includes('Too many')
      ? 'You’ve sent a few already — give us 15 minutes to catch up.'
      : 'That didn’t go through. Please try again or email us directly.';
  // PGRST202 = function not found (database not migrated yet): fall back to the original inbox function.
  const missing = (code?: string) => code === 'PGRST202' || code === '42883';

  if (kind === 'voucher') {
    const { data, error } = await client.rpc('jamza_redeem_voucher', {
      p_code: values.code,
      p_name: values.name,
      p_email: values.email,
      p_phone: values.phone,
    });
    if (!error) {
      const outcomes: Record<string, LetterState> = {
        ok: { status: 'sent', message: 'Code accepted! We’ll email your free ticket shortly.' },
        invalid: { status: 'error', message: 'That code isn’t valid. Check it and try again.' },
        expired: { status: 'error', message: 'That code has expired.' },
        used: { status: 'error', message: 'That code has already been used.' },
        already: { status: 'error', message: 'You’ve already claimed this code — check your email.' },
      };
      return outcomes[String(data)] ?? { status: 'error', message: busy('') };
    }
    if (!missing(error.code)) return { status: 'error', message: busy(error.message) };
  }

  const message = {
    p_name: name.slice(0, 100),
    p_email: values.email,
    p_subject: config.subject(values).slice(0, 160),
    p_message: `[${config.title}]\n\n${body}`.slice(0, 5000),
  };
  let { error } = kind === 'voucher' ? { error: { code: 'PGRST202', message: '' } } : await client.rpc('jamza_submit', { p_kind: kind, ...message });
  if (error && missing(error.code)) ({ error } = await client.rpc('jamza_submit_message', message));
  if (error) return { status: 'error', message: busy(error.message) };
  return { status: 'sent', message: config.sent ?? 'We’ve got it — the JAMZA! team will be in touch by email.' };
}

/**
 * Refresh the shop and merch pages after an admin edits products, so changes show straight away instead of
 * within a minute. Only a signed-in admin can trigger it: the access token is checked against
 * jamza_is_admin() in the database.
 */
export async function refreshShop(accessToken: string): Promise<boolean> {
  if (typeof accessToken !== 'string' || accessToken.length > 4096) return false;
  try {
    const { url, key } = readPublicConfig();
    const asUser = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    const { data: isAdmin, error } = await asUser.rpc('jamza_is_admin');
    if (error || isAdmin !== true) return false;
    revalidatePath('/shop');
    revalidatePath('/merch');
    return true;
  } catch {
    return false;
  }
}
