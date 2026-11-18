'use server';

import { getPublicClient } from '@/lib/supabase';

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
