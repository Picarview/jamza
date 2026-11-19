'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Add01Icon, Cancel01Icon, Delete02Icon, ImageUpload01Icon, RefreshIcon, Search01Icon } from '@hugeicons/core-free-icons';
import { Icon } from '@/components/Icon';

/* ---------- Layout bits ---------- */

export function PageTitle({ title, intro, actions }: { title: string; intro?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display text-5xl sm:text-6xl">{title}</h1>
        {intro && <p className="mt-2 max-w-xl text-cream/70">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[1.75rem] bg-cream text-plum shadow-[8px_10px_0_rgb(0_0_0/0.3)] ${className}`}>{children}</div>;
}

const tones = {
  plum: 'bg-plum/10 text-plum',
  green: 'bg-pine/15 text-pine-700',
  red: 'bg-tomato/15 text-tomato',
  gold: 'bg-gold/30 text-plum-900',
  grey: 'bg-plum/5 text-plum/50',
} as const;

export function Badge({ children, tone = 'plum' }: { children: ReactNode; tone?: keyof typeof tones }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'cream' | 'ghost' | 'danger';
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const styles = {
    primary: 'bg-plum text-cream shadow-[3px_4px_0_var(--color-tomato)]',
    cream: 'droplet text-plum',
    ghost: 'border-2 border-plum/15 text-plum hover:border-plum/40',
    danger: 'text-tomato hover:bg-tomato/10',
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-transform hover:-translate-y-0.5 disabled:opacity-50 ${styles}`}>
      {children}
    </button>
  );
}

export function NotLiveYet({ title, what }: { title: string; what: string }) {
  return (
    <>
      <PageTitle title={title} />
      <Card className="mt-8 p-8">
        <p className="display text-3xl">Coming from the site for now</p>
        <p className="mt-3 max-w-xl text-plum/70">
          {what} still come from the site’s content files while the public site is static. They’re already in Supabase, so
          this section can be switched on whenever the site starts reading them.
        </p>
      </Card>
    </>
  );
}

/* ---------- Schema-driven editor ---------- */

export type FieldDef = {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'date' | 'image' | 'code';
  options?: { value: string; label: string }[];
  placeholder?: string;
  help?: string;
  required?: boolean;
  half?: boolean;
  /** Image fields: upload a file and return its public URL. Without it, the field takes a URL. */
  upload?: (file: File) => Promise<string>;
};

const input =
  'mt-1.5 w-full rounded-2xl border-2 border-plum/15 bg-white px-4 py-2.5 text-plum placeholder:text-plum/35 focus:border-plum focus:outline-none';

export function randomCode(prefix = 'JAMZA') {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
  const part = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  return `${prefix}-${part}`;
}

function ImageUpload({ value, set, upload }: { value: string; set: (v: unknown) => void; upload: (file: File) => Promise<string> }) {
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pick = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    setError('');
    try {
      set(await upload(f));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (file.current) file.current.value = '';
    }
  };
  return (
    <span className="mt-1.5 block">
      <span className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="" className="size-20 shrink-0 rounded-xl border-2 border-plum/10 object-cover" />
        ) : (
          <span className="grid size-20 shrink-0 place-items-center rounded-xl bg-plum/5 text-plum/30">
            <Icon icon={ImageUpload01Icon} size={26} />
          </span>
        )}
        <span className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => file.current?.click()}
            className="inline-flex items-center gap-2 rounded-full bg-plum px-4 py-2.5 text-sm font-bold text-cream disabled:opacity-60"
          >
            <Icon icon={ImageUpload01Icon} size={16} /> {busy ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}
          </button>
          {value && !busy && (
            <button type="button" onClick={() => set('')} className="rounded-full border-2 border-plum/15 px-4 py-2 text-sm font-bold hover:border-plum/40">
              Remove
            </button>
          )}
        </span>
      </span>
      <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} onChange={(e) => pick(e.target.files?.[0])} />
      {error && <span className="mt-2 block text-sm font-semibold text-tomato">{error}</span>}
    </span>
  );
}

function FieldInput({ def, value, set }: { def: FieldDef; value: unknown; set: (v: unknown) => void }) {
  const v = value as string;
  switch (def.type) {
    case 'textarea':
      return <textarea value={v ?? ''} onChange={(e) => set(e.target.value)} rows={6} placeholder={def.placeholder} className={`${input} resize-y`} />;
    case 'select':
      return (
        <select value={v ?? ''} onChange={(e) => set(e.target.value)} className={input}>
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case 'checkbox':
      return (
        <span className="mt-2 flex items-center gap-3">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => set(e.target.checked)} className="size-5 accent-plum" />
          <span className="text-sm text-plum/70">{def.placeholder ?? 'On'}</span>
        </span>
      );
    case 'number':
      return <input type="number" min={0} value={v ?? 0} onChange={(e) => set(Number(e.target.value))} className={input} />;
    case 'date':
      return <input type="date" value={v ?? ''} onChange={(e) => set(e.target.value)} className={input} />;
    case 'code':
      return (
        <span className="mt-1.5 flex gap-2">
          <input value={v ?? ''} onChange={(e) => set(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))} maxLength={24} className={`${input} mt-0 font-black tracking-[0.15em]`} />
          <button type="button" onClick={() => set(randomCode())} className="shrink-0 rounded-2xl border-2 border-plum/15 px-3 text-sm font-bold hover:border-plum/40" title="Generate a code">
            <Icon icon={RefreshIcon} size={18} />
          </button>
        </span>
      );
    case 'image':
      return def.upload ? (
        <ImageUpload value={v ?? ''} set={set} upload={def.upload} />
      ) : (
        <span className="mt-1.5 flex items-center gap-3">
          {v ? <img src={v} alt="" className="size-14 shrink-0 rounded-xl border-2 border-plum/10 object-cover" /> : <span className="size-14 shrink-0 rounded-xl bg-plum/5" />}
          <input value={v ?? ''} onChange={(e) => set(e.target.value)} placeholder={def.placeholder ?? '/images/… or https://'} className={`${input} mt-0`} />
        </span>
      );
    default:
      return <input value={v ?? ''} onChange={(e) => set(e.target.value)} placeholder={def.placeholder} className={input} />;
  }
}

export function Fields<T extends Record<string, unknown>>({ defs, value, onChange }: { defs: FieldDef[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {defs.map((def) => (
        <label key={def.name} className={`block ${def.half ? '' : 'sm:col-span-2'}`}>
          <span className="text-sm font-bold">
            {def.label}
            {def.required && <span className="text-tomato"> *</span>}
          </span>
          <FieldInput def={def} value={value[def.name]} set={(v) => onChange({ ...value, [def.name]: v })} />
          {def.help && <span className="mt-1 block text-xs text-plum/55">{def.help}</span>}
        </label>
      ))}
    </div>
  );
}

export function Drawer({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[90] bg-night/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-y-0 right-0 z-[95] flex w-full max-w-xl flex-col bg-cream text-plum shadow-2xl sm:rounded-l-[2rem]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          >
            <header className="flex items-center justify-between gap-4 border-b border-plum/10 px-6 py-5">
              <h2 className="display text-3xl">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-full hover:bg-plum/10">
                <Icon icon={Cancel01Icon} size={20} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
            {footer && <footer className="flex items-center justify-between gap-3 border-t border-plum/10 px-6 py-4">{footer}</footer>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- Generic collection screen ---------- */

/**
 * A table column. Cells stay on one line unless `wrap` is set (for longer text like a role or a
 * note), which gives the column a sensible width and lets it wrap instead of stretching the table.
 */
export type Column<T> = {
  label: string;
  cell: (row: T) => ReactNode;
  className?: string;
  wrap?: boolean;
  /** Phones: show beside the row's title instead of in the details grid (e.g. a status badge). */
  pin?: boolean;
  /** Tables: only show from this width up, to keep the table inside the card on smaller screens. */
  from?: 'xl';
};

export function CollectionTable<T extends { id: string }>({
  rows,
  columns,
  fields,
  blank,
  search,
  noun,
  onSave,
  onDelete,
  validate,
}: {
  rows: T[];
  columns: Column<T>[];
  fields: FieldDef[];
  blank: () => T;
  search: (row: T) => string;
  noun: string;
  onSave: (row: T) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  validate?: (row: T, rows: T[]) => string | null;
}) {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<T | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => search(r).toLowerCase().includes(q)) : rows;
  }, [rows, query, search]);

  const open = (row: T, fresh = false) => {
    setEditing(row);
    setIsNew(fresh);
    setError('');
  };

  const save = async () => {
    if (!editing) return;
    for (const f of fields) {
      if (f.required && !String(editing[f.name as keyof T] ?? '').trim()) return setError(`“${f.label}” is required.`);
    }
    const problem = validate?.(editing, rows);
    if (problem) return setError(problem);
    try {
      await onSave(editing);
      setEditing(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <>
      <Card className="mt-8 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-plum/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative flex-1 sm:max-w-sm">
            <span className="sr-only">Search {noun}s</span>
            <Icon icon={Search01Icon} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-plum/40" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${noun}s…`} className="w-full rounded-full border-2 border-plum/10 bg-white py-2.5 pl-11 pr-4 focus:border-plum focus:outline-none" />
          </label>
          <Button onClick={() => open(blank(), true)}>
            <Icon icon={Add01Icon} size={18} /> New {noun}
          </Button>
        </div>
        {/* Phones: each row is a card. */}
        <ul className="divide-y divide-plum/5 md:hidden">
          {filtered.map((row) => {
            const [first, ...rest] = columns;
            const pinned = rest.filter((c) => c.pin);
            return (
              <li key={row.id}>
                <button type="button" onClick={() => open(row)} className="block w-full px-4 py-4 text-left transition-colors hover:bg-plum/[0.04] focus-visible:bg-plum/[0.04] focus-visible:outline-none">
                  <span className="flex items-start justify-between gap-3">
                    <span className="block min-w-0 font-bold">{first.cell(row)}</span>
                    {pinned.length > 0 && (
                      <span className="flex shrink-0 items-center gap-1.5 pt-0.5">
                        {pinned.map((c) => (
                          <span key={c.label}>{c.cell(row)}</span>
                        ))}
                      </span>
                    )}
                  </span>
                  <span className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                    {rest.filter((c) => !c.pin).map((c) => (
                      <span key={c.label} className={`min-w-0 ${c.wrap ? 'col-span-2' : ''}`}>
                        <span className="block text-[0.65rem] font-bold uppercase tracking-[0.12em] text-plum/45">{c.label}</span>
                        <span className="mt-0.5 block min-w-0 break-words">{c.cell(row)}</span>
                      </span>
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Tablets and up: a table that scrolls inside the card if it ever runs out of room. */}
        <div className="hidden overflow-x-auto overscroll-x-contain md:block">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.12em] text-plum/50">
              <tr>
                {columns.map((c, i) => (
                  <th key={c.label} className={`whitespace-nowrap py-3 font-bold ${i === 0 ? 'pl-5 pr-4' : 'px-4'} ${i === columns.length - 1 ? 'pr-5' : ''} ${c.from ? 'hidden xl:table-cell' : ''} ${c.className ?? ''}`}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} onClick={() => open(row)} className="cursor-pointer border-t border-plum/5 transition-colors hover:bg-plum/[0.04]">
                  {columns.map((c, i) => (
                    <td
                      key={c.label}
                      className={`py-3 align-middle ${i === 0 ? 'pl-5 pr-4' : 'px-4'} ${i === columns.length - 1 ? 'pr-5' : ''} ${
                        c.wrap ? 'min-w-44 max-w-72' : 'whitespace-nowrap'
                      } ${c.from ? 'hidden xl:table-cell' : ''} ${c.className ?? ''}`}
                    >
                      {i === 0 ? (
                        <button type="button" className="text-left font-bold focus-visible:underline" onClick={(e) => (e.stopPropagation(), open(row))}>
                          {c.cell(row)}
                        </button>
                      ) : (
                        c.cell(row)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <p className="p-10 text-center text-plum/50">{query ? 'No matches.' : `No ${noun}s yet.`}</p>}
        <p className="border-t border-plum/10 px-4 py-3 text-xs text-plum/50">
          {filtered.length} of {rows.length} {noun}
          {rows.length === 1 ? '' : 's'}
        </p>
      </Card>

      <Drawer
        open={Boolean(editing)}
        title={isNew ? `New ${noun}` : `Edit ${noun}`}
        onClose={() => setEditing(null)}
        footer={
          <>
            {!isNew && editing ? (
              <Button
                variant="danger"
                onClick={async () => {
                  if (confirm(`Delete this ${noun}? This can’t be undone.`)) {
                    try {
                      await onDelete(editing.id);
                      setEditing(null);
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }
                }}
              >
                <Icon icon={Delete02Icon} size={16} /> Delete
              </Button>
            ) : (
              <span />
            )}
            <span className="flex items-center gap-3">
              {error && <span className="text-sm font-semibold text-tomato">{error}</span>}
              <Button onClick={save}>Save</Button>
            </span>
          </>
        }
      >
        {editing && <Fields defs={fields} value={editing as unknown as Record<string, unknown>} onChange={(v) => setEditing(v as unknown as T)} />}
      </Drawer>
    </>
  );
}
