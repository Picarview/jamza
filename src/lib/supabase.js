import { createClient } from '@supabase/supabase-js';
import { readPublicConfig } from '../config/env.js';

/** Public pages never restore an administrator's session. RLS is the authority. */
export function createAppClient({ admin = false } = {}) {
  try {
    const { url, key } = readPublicConfig();
    return createClient(url, key, {
      auth: {
        storageKey: 'picarview.auth',
        persistSession: admin,
        autoRefreshToken: admin,
        detectSessionInUrl: false,
      },
    });
  } catch (error) {
    console.warn('Supabase configuration:', error.message);
    return null;
  }
}

export function requireClient(client) {
  if (!client)
    throw new Error('Supabase is not configured. Check .env.local and restart the dev server.');
  return client;
}
