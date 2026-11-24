'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useActionState, useState } from 'react';
import { CheckmarkCircle02Icon, Ticket02Icon } from '@hugeicons/core-free-icons';
import { submitForm, type LetterState } from '@/app/actions';
import { VOUCHER_PATTERN } from '@/lib/forms';
import { Icon } from '../Icon';

const field =
  'w-full rounded-2xl border-2 border-cream/15 bg-black/30 px-4 py-3 text-cream placeholder:text-cream/40 transition-colors focus:border-lime focus:outline-none';

/** "Got a code?" — voucher (free ticket) or community (discounted) code, then contact details. */
export function VoucherBox() {
  const [state, action, pending] = useActionState<LetterState, FormData>(submitForm.bind(null, 'voucher'), {
    status: 'idle',
    message: '',
  });
  const [code, setCode] = useState('');
  const ready = VOUCHER_PATTERN.test(code);

  return (
    <div className="rounded-[2rem] border-2 border-dashed border-lime/50 p-6 sm:p-8">
      <AnimatePresence mode="wait">
        {state.status === 'sent' ? (
          <motion.div key="sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4" role="status">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-lime text-black">
              <Icon icon={CheckmarkCircle02Icon} size={28} />
            </span>
            <div>
              <p className="display text-3xl text-cream">Code accepted</p>
              <p className="text-cream/75">{state.message}</p>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" action={action} exit={{ opacity: 0 }}>
            <label className="hidden" aria-hidden>
              Website <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4 sm:w-[19rem] sm:shrink-0">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-lime text-black">
                  <Icon icon={Ticket02Icon} size={26} />
                </span>
                <div>
                  <p className="display text-3xl text-cream">Got a code?</p>
                  <p className="text-cream/75">Redeem a voucher or community code.</p>
                </div>
              </div>
              <label className="flex-1">
                <span className="sr-only">Voucher code</span>
                <input
                  name="code"
                  required
                  maxLength={24}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="ENTER CODE"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  className="w-full rounded-full border-2 border-lime/60 bg-black/40 px-6 py-4 text-center text-xl font-black tracking-[0.3em] text-lime placeholder:tracking-[0.2em] placeholder:text-lime/40 focus:border-lime focus:outline-none sm:text-left"
                />
              </label>
            </div>

            <AnimatePresence initial={false}>
              {ready && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="mt-6 text-sm font-semibold text-cream/70">Where should we send your ticket?</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <input name="name" required maxLength={100} autoComplete="name" placeholder="Full name" aria-label="Full name" className={field} />
                    <input name="phone" type="tel" required maxLength={30} autoComplete="tel" placeholder="Phone / WhatsApp" aria-label="Phone or WhatsApp" className={field} />
                    <input name="email" type="email" required maxLength={200} autoComplete="email" placeholder="Email" aria-label="Email" className={field} />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-cream/55">One ticket per person. We’ll check your code and email you.</p>
                    <button type="submit" disabled={pending} className="btn bg-lime text-black shadow-[4px_5px_0_#000] disabled:opacity-60">
                      {pending ? 'Checking…' : 'Redeem'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <p role="status" aria-live="polite" className="mt-3 text-sm font-semibold text-lime">
              {state.status === 'error' ? state.message : ''}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
