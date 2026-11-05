/** Read public build-time configuration without exposing key values in errors. */
export function readPublicConfig(env = import.meta.env ?? {}) {
  const url = String(env.VITE_SUPABASE_URL ?? '').trim();
  const key = String(env.VITE_SUPABASE_ANON_KEY ?? '').trim();
  if (!url || !key) {
    throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.');
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('VITE_SUPABASE_URL must be a valid project URL.');
  }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
  if (parsed.protocol !== 'https:' && !(local && parsed.protocol === 'http:')) {
    throw new Error('Use an HTTPS Supabase URL, or HTTP for a local Supabase instance.');
  }
  if (
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    parsed.pathname !== '/'
  ) {
    throw new Error(
      'Use the Supabase project origin without paths, credentials, or query strings.',
    );
  }
  if (!key.startsWith('sb_publishable_')) {
    try {
      const payload = JSON.parse(atob(key.split('.')[1].replaceAll('-', '+').replaceAll('_', '/')));
      if (payload.role !== 'anon') throw new Error('Invalid role');
    } catch {
      throw new Error('Use a public anon or publishable key, never a secret or service-role key.');
    }
  }
  return { url: parsed.origin, key };
}
