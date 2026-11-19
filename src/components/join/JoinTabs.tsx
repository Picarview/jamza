'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { CheckmarkCircle02Icon, Money03Icon, Store01Icon } from '@hugeicons/core-free-icons';
import { salesTeam, vendors } from '@/content/join';
import { brand } from '../Brand';
import { FormCard } from '../FormCard';
import { Icon } from '../Icon';

const tabs = [
  { id: 'sales-team', label: 'Ticket Sales Team', icon: Money03Icon },
  { id: 'vendors', label: 'Vendors', icon: Store01Icon },
] as const;

type Tab = (typeof tabs)[number]['id'];

export function JoinTabs() {
  const [tab, setTab] = useState<Tab>('sales-team');

  // Deep links: /join#vendors opens the vendor tab.
  useEffect(() => {
    const fromHash = () => {
      const h = location.hash.slice(1);
      if (h === 'vendors' || h === 'sales-team') setTab(h);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  const vendorsClosed = Date.now() > new Date(vendors.deadline).getTime();
  const info =
    tab === 'sales-team'
      ? { title: `Earn ${salesTeam.commission}% on every ticket`, pitch: salesTeam.pitch, points: salesTeam.points }
      : { title: 'Sell at the marketplace', pitch: vendors.pitch, points: [`Apply by ${vendors.deadlineLabel}.`, ...vendors.points] };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div role="tablist" aria-label="Ways to get involved" className="glass mx-auto flex w-fit rounded-full p-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => {
              setTab(t.id);
              history.replaceState(null, '', `#${t.id}`);
            }}
            className={`relative flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-colors sm:text-base ${tab === t.id ? 'text-plum' : 'text-cream/80 hover:text-cream'}`}
          >
            {tab === t.id && <motion.span layoutId="join-tab" className="droplet absolute inset-0 -z-10 rounded-full" transition={{ type: 'spring', stiffness: 500, damping: 34 }} />}
            <Icon icon={t.icon} size={18} /> {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="mt-14 grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr]"
        >
          <div>
            <h2 className="display text-5xl leading-[0.92] sm:text-6xl">{info.title}</h2>
            <p className="mt-5 text-lg text-cream/80">{brand(info.pitch)}</p>
            <ul className="mt-8 space-y-4">
              {info.points.map((p) => (
                <li key={p} className="flex gap-3">
                  <Icon icon={CheckmarkCircle02Icon} size={22} className="mt-0.5 shrink-0 text-lime" />
                  <span className="text-cream/90">{p}</span>
                </li>
              ))}
            </ul>
          </div>
          {tab === 'sales-team' ? (
            <FormCard kind="sales-team" submitLabel="Apply to join" note="We’ll email you your sales code and next steps." />
          ) : (
            <FormCard
              kind="vendor"
              submitLabel="Send application"
              note={`Applications close ${vendors.deadlineLabel}.`}
              disabled={
                vendorsClosed ? (
                  <>
                    <p className="display text-4xl">Applications are closed</p>
                    <p className="mt-3 max-w-sm text-plum/70">Vendor registration closed on {vendors.deadlineLabel}. Selected vendors will hear from us by email.</p>
                  </>
                ) : undefined
              }
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
