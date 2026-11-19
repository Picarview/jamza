'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { seed } from './seed';
import type { CollectionKey, Db, Row, Settings } from './types';

/**
 * Admin data store.
 *
 * Backend today: DEMO — seeded from the site's content files and saved in this browser only.
 * To connect Supabase, replace the four functions in `backend` with table reads/writes;
 * every screen talks to `useAdmin()` and stays the same.
 */
const KEY = 'jamza.admin.demo.v1';

const backend = {
  async load(): Promise<Db> {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...seed(), ...JSON.parse(raw) };
    } catch {
      /* private mode or corrupt data: fall back to seed */
    }
    return seed();
  },
  async persist(db: Db) {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      /* storage unavailable: changes last for this session only */
    }
  },
  async reset(): Promise<Db> {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    return seed();
  },
};

export const newId = () => Math.random().toString(36).slice(2, 10);

type Admin = {
  db: Db;
  ready: boolean;
  mode: 'demo' | 'supabase';
  save: <K extends CollectionKey>(key: K, row: Row<K>) => Promise<void>;
  remove: (key: CollectionKey, id: string) => Promise<void>;
  saveSettings: (settings: Settings) => Promise<void>;
  reset: () => Promise<void>;
};

const Ctx = createContext<Admin | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Db>(seed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    backend.load().then((loaded) => {
      setDb(loaded);
      setReady(true);
    });
  }, []);

  const commit = useCallback((next: (db: Db) => Db) => {
    setDb((current) => {
      const updated = next(current);
      void backend.persist(updated);
      return updated;
    });
  }, []);

  const value = useMemo<Admin>(
    () => ({
      db,
      ready,
      mode: 'demo',
      async save(key, row) {
        commit((d) => {
          const list = d[key] as Row<typeof key>[];
          const exists = list.some((r) => r.id === row.id);
          return { ...d, [key]: exists ? list.map((r) => (r.id === row.id ? row : r)) : [row, ...list] };
        });
      },
      async remove(key, id) {
        commit((d) => ({ ...d, [key]: (d[key] as { id: string }[]).filter((r) => r.id !== id) }));
      },
      async saveSettings(settings) {
        commit((d) => ({ ...d, settings }));
      },
      async reset() {
        setDb(await backend.reset());
      },
    }),
    [db, ready, commit],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAdmin must be used inside <AdminProvider>');
  return ctx;
}
