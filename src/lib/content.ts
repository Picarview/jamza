import 'server-only';
import { cache } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { festival } from '@/content/festival';
import { getPublicClient } from './supabase';
import type { Artist, Partner, Post, Settings, SiteContent } from './types';

const PAGE_SIZE = 500;

export const defaultSettings: Settings = {
  id: 'site',
  title: 'jamza',
  email: festival.email,
  instagram: '',
  linkedin: '',
};

/** Fetch every page instead of silently stopping at Supabase's default row cap. */
async function listRecords<T>(client: SupabaseClient, entity: string, publishedOnly = false) {
  const records: T[] = [];
  for (let start = 0; ; start += PAGE_SIZE) {
    let query = client
      .from(`picarview_${entity}`)
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(start, start + PAGE_SIZE - 1);
    if (publishedOnly) query = query.eq('status', 'Published');
    const { data, error } = await query;
    if (error) throw error;
    records.push(...(data as T[]));
    if (data.length < PAGE_SIZE) return records;
  }
}

/** Old databases may still carry the pre-rebrand demo values. */
function normalizeSettings(settings: Settings): Settings {
  const title = settings.title?.trim().toLowerCase() === 'picarview' ? 'jamza' : settings.title;
  const placeholder = ['hello@picarview.com', 'hello@jamza.com', 'example@jamza.com'];
  const email =
    !settings.email?.trim() || placeholder.includes(settings.email.trim().toLowerCase())
      ? festival.email
      : settings.email;
  return { ...settings, title, email };
}

export type ContentResult = SiteContent & { ok: boolean };

export const getPublicContent = cache(async (): Promise<ContentResult> => {
  const empty = { artists: [], posts: [], partners: [], settings: defaultSettings };
  const client = getPublicClient();
  if (!client) return { ...empty, ok: false };
  try {
    const [artists, posts, partners, settings] = await Promise.all([
      listRecords<Artist>(client, 'artists'),
      listRecords<Post>(client, 'posts', true),
      listRecords<Partner>(client, 'partners'),
      client.from('picarview_settings').select('*').eq('id', 'site').single(),
    ]);
    if (settings.error) throw settings.error;
    return {
      artists,
      posts: posts.sort((a, b) => b.date.localeCompare(a.date)),
      partners,
      settings: normalizeSettings(settings.data as Settings),
      ok: true,
    };
  } catch (error) {
    console.warn('Public content load failed:', (error as Error).message);
    return { ...empty, ok: false };
  }
});
