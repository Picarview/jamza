'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import {
  ArrowUpRight01Icon,
  DashboardSquare01Icon,
  HandshakeIcon,
  InboxIcon,
  Mic01Icon,
  RefreshIcon,
  Settings01Icon,
  ShoppingBag01Icon,
  Ticket02Icon,
} from '@hugeicons/core-free-icons';
import { Icon } from '@/components/Icon';
import { AdminProvider, useAdmin } from './store';

const nav = [
  { href: '/admin', label: 'Overview', icon: DashboardSquare01Icon },
  { href: '/admin/inbox', label: 'Inbox', icon: InboxIcon },
  { href: '/admin/vouchers', label: 'Vouchers', icon: Ticket02Icon },
  { href: '/admin/shop', label: 'Shop', icon: ShoppingBag01Icon },
  { href: '/admin/lineup', label: 'Lineup', icon: Mic01Icon },
  { href: '/admin/partners', label: 'Partners', icon: HandshakeIcon },
  { href: '/admin/settings', label: 'Settings', icon: Settings01Icon },
];

function Frame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { db, mode, reset } = useAdmin();
  const unread = db.messages.filter((m) => m.status === 'new').length;
  const isActive = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href));

  const links = (where: 'side' | 'top') => nav.map((item) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={`relative isolate flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${active ? 'text-plum' : 'text-cream/80 hover:text-cream'}`}
      >
        {active && <motion.span layoutId={`admin-pill-${where}`} className="droplet absolute inset-0 -z-10 rounded-full" transition={{ type: 'spring', stiffness: 500, damping: 34 }} />}
        <Icon icon={item.icon} size={18} />
        {item.label}
        {item.href === '/admin/inbox' && unread > 0 && (
          <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${active ? 'bg-plum text-cream' : 'bg-tomato text-cream'}`}>{unread}</span>
        )}
      </Link>
    );
  });

  return (
    <div className="min-h-svh bg-[radial-gradient(60%_50%_at_90%_0%,#430a5e_0%,#12031c_60%)] text-cream lg:grid lg:grid-cols-[16.5rem_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="hidden p-4 lg:block">
        <div className="glass glass-tint-plum sticky top-4 flex h-[calc(100svh-2rem)] flex-col rounded-[2rem] p-4">
          <Link href="/admin" className="flex items-center gap-3 px-2 py-1">
            <Image src="/images/logo-main.png" alt="JAMZA!" width={994} height={780} className="h-11 w-auto" />
            <span className="display text-2xl">Admin</span>
          </Link>
          <nav aria-label="Admin" className="mt-8 flex flex-col gap-1">
            {links('side')}
          </nav>
          <div className="mt-auto space-y-2 px-2 text-sm">
            {mode === 'demo' && (
              <div className="rounded-2xl bg-black/25 p-3">
                <p className="flex items-center gap-2 font-bold text-gold">
                  <span className="size-2 rounded-full bg-gold" /> Demo data
                </p>
                <p className="mt-1 text-xs text-cream/60">Saved in this browser only. Supabase connects next.</p>
                <button type="button" onClick={() => confirm('Reset all demo data?') && reset()} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-cream/70 hover:text-cream">
                  <Icon icon={RefreshIcon} size={14} /> Reset demo data
                </button>
              </div>
            )}
            <Link href="/" target="_blank" className="flex items-center gap-2 px-1 py-2 font-semibold text-cream/70 hover:text-cream">
              View site <Icon icon={ArrowUpRight01Icon} size={16} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="sticky top-0 z-40 border-b border-cream/10 bg-night/85 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between px-4 pt-3">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/images/logo-main.png" alt="JAMZA!" width={994} height={780} className="h-9 w-auto" />
            <span className="display text-xl">Admin</span>
          </Link>
          {mode === 'demo' && <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold">Demo data</span>}
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 py-3 [scrollbar-width:none]">
          {links('top')}
        </nav>
      </header>

      <main id="main" className="min-w-0 px-4 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <Frame>{children}</Frame>
    </AdminProvider>
  );
}
