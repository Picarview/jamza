import { defaults } from '../config/defaults.js';
import { normalizeBrandSettings, normalizeSamplePost } from '../config/brand.js';
import { requireClient } from '../lib/supabase.js';

const PAGE_SIZE = 500;

/** Fetch every page instead of silently stopping at Supabase's default row cap. */
async function listRecords(client, entity, { publishedOnly = false } = {}) {
  const records = [];
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
    records.push(...data);
    if (data.length < PAGE_SIZE) return records;
  }
}

async function loadContent(client, { admin = false } = {}) {
  requireClient(client);
  const keys = admin
    ? ['artists', 'posts', 'partners', 'messages']
    : ['artists', 'posts', 'partners'];
  const [rows, settings] = await Promise.all([
    Promise.all(
      keys.map((key) => listRecords(client, key, { publishedOnly: key === 'posts' && !admin })),
    ),
    client.from('picarview_settings').select('*').eq('id', 'site').single(),
  ]);
  if (settings.error) throw settings.error;
  const collections = Object.fromEntries(keys.map((key, index) => [key, rows[index]]));
  return {
    ...structuredClone(defaults),
    ...collections,
    posts: collections.posts.map(normalizeSamplePost),
    settings: normalizeBrandSettings(settings.data),
  };
}

export const getPublicContent = (client) => loadContent(client);
export const getAdminContent = (client) => loadContent(client, { admin: true });
