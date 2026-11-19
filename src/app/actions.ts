'use server';

import { getPublicClient } from '@/lib/supabase';
import { forms, type FormKind } from '@/lib/forms';
import { shopProducts } from '@/content/shop';

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
  const { error } = await client.rpc('picarview_submit_message', {
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
  if (kind === 'shop') {
    const lines = shopProducts
      .map((p) => ({ p, qty: Number(form.get(`qty-${p.id}`) ?? 0) }))
      .filter(({ qty }) => Number.isInteger(qty) && qty > 0 && qty <= 50)
      .map(({ p, qty }) => `• ${qty} × ${p.name}`);
    if (!lines.length) return { status: 'error', message: 'Add at least one item to your pre-order.' };
    items = `Items:\n${lines.join('\n')}\n\n`;
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
  const { error } = await client.rpc('picarview_submit_message', {
    p_name: name.slice(0, 100),
    p_email: values.email,
    p_subject: config.subject(values).slice(0, 160),
    p_message: `[${config.title}]\n\n${body}`.slice(0, 5000),
  });
  if (error) {
    return {
      status: 'error',
      message: error.message.includes('Too many')
        ? 'You’ve sent a few already — give us 15 minutes to catch up.'
        : 'That didn’t go through. Please try again or email us directly.',
    };
  }
  return { status: 'sent', message: 'We’ve got it — the JAMZA! team will be in touch by email.' };
}
