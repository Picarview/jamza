import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readPublicConfig } from './env';

let client: SupabaseClient | null | undefined;

/** Anonymous, session-less client. Row Level Security is the authority on what it can read. */
export function getPublicClient(): SupabaseClient | null {
  if (client !== undefined) return client;
  try {
    const { url, key } = readPublicConfig();
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  } catch (error) {
    console.warn('Supabase configuration:', (error as Error).message);
    client = null;
  }
  return client;
}
