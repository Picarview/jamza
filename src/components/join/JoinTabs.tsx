'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ArrowUpRight01Icon, Call02Icon, CheckmarkCircle02Icon, Money03Icon, Store01Icon, WhatsappIcon } from '@hugeicons/core-free-icons';
import { salesTeam, vendors } from '@/content/join';
import { brand } from '../Brand';
import { FormCard } from '../FormCard';
import { Icon } from '../Icon';

const tabs = [
  { id: 'sales-team', label: 'Ticket Sales Team', icon: Money03Icon },
  { id: 'vendors', label: 'Vendors', icon: Store01Icon },
] as const;

type Tab = (typeof tabs)[number]['id'];

export function JoinTabs({ vendorDeadline }: { vendorDeadline: string }) {
  const deadlineLabel = new Date(vendorDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
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

  const vendorsClosed = Date.now() > new Date(vendorDeadline).getTime();
  const info =
    tab === 'sales-team'
      ? { title: `Earn ${salesTeam.commission}% on every ticket`, pitch: salesTeam.pitch, points: salesTeam.points }
      : { title: 'Calling all vendors', pitch: vendors.pitch, points: [`Sign-up closes ${deadlineLabel}.`, ...vendors.points] };

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
            <div className="relative rounded-[2rem] bg-cream p-6 text-plum shadow-[14px_18px_0_rgb(0_0_0/0.3)] sm:p-9">
              {vendorsClosed ? (
                <div className="flex min-h-[16rem] flex-col items-center justify-center text-center">
                  <p className="display text-4xl">Sign-up is closed</p>
                  <p className="mt-3 max-w-sm text-plum/70">Vendor sign-up closed on {deadlineLabel}. Selected vendors will hear from us.</p>
                </div>
              ) : (
                <div className="flex min-h-[16rem] flex-col items-start justify-center">
                  <span className="grid size-14 place-items-center rounded-full bg-plum text-cream">
                    <Icon icon={Store01Icon} size={26} />
                  </span>
                  <p className="display mt-6 text-4xl sm:text-5xl">Sign up to vend</p>
                  <p className="mt-3 max-w-md text-plum/75">
                    Fill in the vendor sign-up form. It takes a few minutes, and sign-up closes {deadlineLabel}.
                  </p>
                  <a
                    href={vendors.form}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn mt-7 bg-plum text-cream shadow-[4px_5px_0_var(--color-tomato)]"
                  >
                    Open the sign-up form <Icon icon={ArrowUpRight01Icon} size={18} />
                  </a>
                  <div className="mt-8 w-full border-t-2 border-dashed border-plum/15 pt-6">
                    <p className="text-sm font-bold">Questions? Reach out</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={`tel:${vendors.phone.tel}`} className="inline-flex items-center gap-2 rounded-full border-2 border-plum/15 px-4 py-2 text-sm font-bold transition-colors hover:border-plum/40">
                        <Icon icon={Call02Icon} size={16} /> {vendors.phone.label}
                      </a>
                      <a href={vendors.phone.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border-2 border-plum/15 px-4 py-2 text-sm font-bold transition-colors hover:border-plum/40">
                        <Icon icon={WhatsappIcon} size={16} /> WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
