'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { seed } from './seed';
import { refreshShop } from '@/app/actions';
import { adminClient, explain, fromMessage, fromProduct, fromVoucher, toMessage, toProduct, toVoucher } from './supabase';
import type { CollectionKey, Db, Message, Product, Row, Settings, Voucher } from './types';

/**
 * Admin data store.
 *
 * - Supabase mode (env configured): sign-in required; Inbox, Vouchers and the JAMZA! shop read and
 *   write the live jamza_messages / jamza_vouchers / jamza_products tables. Lineup, Partners,
 *   festival merch and Settings stay on the site's content files while the rest of the public site
 *   is static, so they're not editable here yet.
 * - Demo mode (no env): everything is sample data saved in this browser.
 */
const DEMO_KEY = 'jamza.admin.demo.v1';
export const LIVE_COLLECTIONS: CollectionKey[] = ['messages', 'vouchers', 'products'];

export const newId = () => crypto.randomUUID();

type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out'; error?: string }
  | { status: 'not-admin'; email: string }
  | { status: 'ready'; email: string };

type Admin = {
  db: Db;
  ready: boolean;
  mode: 'demo' | 'supabase';
  auth: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  save: <K extends CollectionKey>(key: K, row: Row<K>) => Promise<void>;
  remove: (key: CollectionKey, id: string) => Promise<void>;
  saveSettings: (settings: Settings) => Promise<void>;
  reset: () => Promise<void>;
};

const Ctx = createContext<Admin | null>(null);

const PAGE = 500;
async function loadAll(table: string, order: string, ascending = false, filter?: [string, string]) {
  const supabase = adminClient()!;
  const rows: Record<string, unknown>[] = [];
  for (let from = 0; ; from += PAGE) {
    let query = supabase.from(table).select('*');
    if (filter) query = query.eq(filter[0], filter[1]);
    const { data, error } = await query.order(order, { ascending }).order('id').range(from, from + PAGE - 1);
    if (error) throw new Error(explain(error));
    rows.push(...data);
    if (data.length < PAGE) return rows;
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const supabase = adminClient();
  const mode: Admin['mode'] = supabase ? 'supabase' : 'demo';
  const [db, setDb] = useState<Db>(() => (supabase ? { ...seed(), messages: [], vouchers: [], products: [] } : seed()));
  const [ready, setReady] = useState(false);
  const [auth, setAuth] = useState<AuthState>(supabase ? { status: 'loading' } : { status: 'ready', email: 'demo' });
  const loadedFor = useRef<string | null>(null);

  /* ----- Demo mode ----- */
  useEffect(() => {
    if (mode !== 'demo') return;
    try {
      const raw = localStorage.getItem(DEMO_KEY);
      if (raw) setDb({ ...seed(), ...JSON.parse(raw) });
    } catch {
      /* private mode: keep seed */
    }
    setReady(true);
  }, [mode]);

  const persistDemo = (next: Db) => {
    try {
      localStorage.setItem(DEMO_KEY, JSON.stringify(next));
    } catch {}
  };

  /* ----- Supabase mode: session → allowlist → data ----- */
  const load = useCallback(async () => {
    const [messages, vouchers, products] = await Promise.all([
      loadAll('jamza_messages', 'date'),
      loadAll('jamza_vouchers', 'created_at'),
      loadAll('jamza_products', 'sort', true, ['section', 'shop']),
    ]);
    setDb((d) => ({ ...d, messages: messages.map(toMessage), vouchers: vouchers.map(toVoucher), products: products.map(toProduct) }));
    setReady(true);
  }, []);

  const checkSession = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) {
      loadedFor.current = null;
      setReady(false);
      setAuth({ status: 'signed-out' });
      return;
    }
    const { data: isAdmin, error } = await supabase.rpc('jamza_is_admin');
    if (error || !isAdmin) {
      setAuth(error ? { status: 'signed-out', error: explain(error) } : { status: 'not-admin', email: user.email ?? '' });
      return;
    }
    setAuth({ status: 'ready', email: user.email ?? '' });
    if (loadedFor.current !== user.id) {
      loadedFor.current = user.id;
      try {
        await load();
      } catch (e) {
        setAuth({ status: 'signed-out', error: (e as Error).message });
      }
    }
  }, [supabase, load]);

  useEffect(() => {
    if (!supabase) return;
    void checkSession();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') void checkSession();
    });
    return () => data.subscription.unsubscribe();
  }, [supabase, checkSession]);

  // Keep the inbox fresh: reload when the tab regains focus and every two minutes.
  useEffect(() => {
    if (mode !== 'supabase' || auth.status !== 'ready') return;
    const reload = () => document.visibilityState === 'visible' && load().catch(() => {});
    window.addEventListener('focus', reload);
    const id = setInterval(reload, 120_000);
    return () => {
      window.removeEventListener('focus', reload);
      clearInterval(id);
    };
  }, [mode, auth.status, load]);

  const value = useMemo<Admin>(() => {
    // Tell the site to rebuild /shop now rather than on its next one-minute refresh.
    const publishShop = async () => {
      const { data } = await supabase!.auth.getSession();
      if (data.session) await refreshShop(data.session.access_token).catch(() => false);
    };

    const local = <K extends CollectionKey>(key: K, row: Row<K>) =>
      setDb((d) => {
        const list = d[key] as Row<K>[];
        const next = { ...d, [key]: list.some((r) => r.id === row.id) ? list.map((r) => (r.id === row.id ? row : r)) : [row, ...list] };
        if (mode === 'demo') persistDemo(next);
        return next;
      });

    return {
      db,
      ready,
      mode,
      auth,
      async signIn(email, password) {
        if (!supabase) return;
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) setAuth({ status: 'signed-out', error: error.message.includes('Invalid login') ? 'Wrong email or password.' : explain(error) });
      },
      async signOut() {
        await supabase?.auth.signOut();
      },
      async refresh() {
        if (mode === 'supabase') await load();
      },
      async save(key, row) {
        if (mode === 'demo') return local(key, row);
        if (key === 'messages') {
          const m = row as Message;
          const { error } = await supabase!.from('jamza_messages').update(fromMessage(m)).eq('id', m.id);
          if (error) throw new Error(explain(error));
          return local(key, row);
        }
        if (key === 'vouchers') {
          const { data, error } = await supabase!.from('jamza_vouchers').upsert(fromVoucher(row as Voucher)).select().single();
          if (error) throw new Error(explain(error));
          return local(key, toVoucher(data) as Row<typeof key>);
        }
        if (key === 'products') {
          const { data, error } = await supabase!.from('jamza_products').upsert(fromProduct(row as Product)).select().single();
          if (error) throw new Error(explain(error));
          void publishShop();
          return local(key, toProduct(data) as Row<typeof key>);
        }
        throw new Error('This section isn’t connected yet — it still comes from the site’s content files.');
      },
      async remove(key, id) {
        if (mode === 'supabase') {
          const tables: Partial<Record<CollectionKey, string>> = { messages: 'jamza_messages', vouchers: 'jamza_vouchers', products: 'jamza_products' };
          const table = tables[key];
          if (!table) throw new Error('This section isn’t connected yet.');
          const { error } = await supabase!.from(table).delete().eq('id', id);
          if (error) throw new Error(explain(error));
          if (key === 'products') void publishShop();
        }
        setDb((d) => {
          const next = { ...d, [key]: (d[key] as { id: string }[]).filter((r) => r.id !== id) };
          if (mode === 'demo') persistDemo(next);
          return next;
        });
      },
      async saveSettings(settings) {
        if (mode === 'supabase') throw new Error('Settings aren’t connected yet.');
        setDb((d) => {
          const next = { ...d, settings };
          persistDemo(next);
          return next;
        });
      },
      async reset() {
        if (mode !== 'demo') return;
        try {
          localStorage.removeItem(DEMO_KEY);
        } catch {}
        setDb(seed());
      },
    };
  }, [db, ready, mode, auth, supabase, load]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAdmin must be used inside <AdminProvider>');
  return ctx;
}
