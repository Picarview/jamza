'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useActionState, useState } from 'react';
import { Mail01Icon, SentIcon } from '@hugeicons/core-free-icons';
import { sendLetter, type LetterState } from '@/app/actions';
import { HalfMoons } from '../HalfMoons';
import { Icon } from '../Icon';
import { Reveal } from '../Reveal';
import { brand } from '../Brand';

const reasons = ['Tickets & groups', 'I want to perform', 'Let’s partner up', 'Just saying hi'];

const blank =
  'mx-1 inline-block min-w-0 border-0 border-b-[3px] border-dashed border-plum/30 bg-transparent px-1 pb-0.5 font-bold text-tomato placeholder:font-normal placeholder:text-plum/35 focus:border-tomato focus:outline-none';

/** Contact, written as a letter. */
export function Letter({ email }: { email: string }) {
  const [state, action, pending] = useActionState<LetterState, FormData>(sendLetter, { status: 'idle', message: '' });
  const [reason, setReason] = useState(reasons[0]);
  const [name, setName] = useState('');

  return (
    <section id="letter" aria-labelledby="letter-title" className="relative overflow-hidden bg-[linear-gradient(170deg,#580e79,#1f0530)] py-28">
      <HalfMoons className="absolute -left-10 bottom-0 w-56 opacity-80 sm:w-72" palette="festive" flip />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <p className="eyebrow text-gold">Performers, partners, curious souls</p>
          <h2 id="letter-title" className="display mt-4 text-6xl sm:text-7xl">
            Write us a letter
          </h2>
          <p className="mt-5 max-w-sm text-lg text-lavender">
            Want to perform, partner, or just say hello? Fill in the blanks, it goes straight to the
            team.
          </p>
          <a href={`mailto:${email}`} className="glass mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold">
            <Icon icon={Mail01Icon} size={18} /> {email}
          </a>
        </Reveal>

        <Reveal delay={0.1} rotate={-3}>
          <div className="relative rotate-1 rounded-[2rem] bg-cream p-6 text-plum shadow-[14px_18px_0_rgb(0_0_0/0.3)] sm:p-10">
            {/* Postage stamp */}
            <div aria-hidden className="absolute -right-3 -top-5 rotate-6 rounded-md border-4 border-dashed border-cream bg-tomato p-2 shadow-lg sm:-right-5">
              <img src="/images/logo-main.png" alt="" className="h-12 w-auto" />
            </div>

            <AnimatePresence mode="wait">
              {state.status === 'sent' ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex min-h-[24rem] flex-col items-center justify-center text-center"
                  role="status"
                >
                  <motion.span
                    initial={{ x: 0, y: 0, rotate: 0 }}
                    animate={{ x: [0, -10, 260], y: [0, 6, -180], rotate: [0, -8, 25], opacity: [1, 1, 0] }}
                    transition={{ duration: 1.4, times: [0, 0.25, 1], ease: 'easeIn' }}
                    className="text-tomato"
                  >
                    <Icon icon={SentIcon} size={64} />
                  </motion.span>
                  <p className="display mt-6 text-5xl">Sealed & sent!</p>
                  <p className="mt-3 max-w-sm text-plum/75">{brand(state.message)}</p>
                </motion.div>
              ) : (
                <motion.form key="form" action={action} exit={{ opacity: 0, y: -20 }} className="text-lg leading-[2.6rem] sm:text-xl">
                  <label className="hidden" aria-hidden>
                    Website <input name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                  <input type="hidden" name="subject" value={reason} />

                  <p className="display text-4xl leading-none">Dear JAMZA!,</p>
                  <p className="mt-6">
                    My name is
                    <input
                      name="name"
                      required
                      maxLength={100}
                      autoComplete="name"
                      placeholder="your name"
                      aria-label="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`${blank} w-[11ch] sm:w-[14ch]`}
                    />
                    and you can write back to me at
                    <input
                      name="email"
                      type="email"
                      required
                      maxLength={200}
                      autoComplete="email"
                      placeholder="you@email.com"
                      aria-label="Your email address"
                      className={`${blank} w-[15ch] sm:w-[20ch]`}
                    />
                    .
                  </p>

                  <fieldset className="mt-4">
                    <legend>I’m writing because…</legend>
                    <div className="mt-3 flex flex-wrap gap-2 leading-normal">
                      {reasons.map((r) => (
                        <label
                          key={r}
                          className={`cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-bold transition-all has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-gold ${
                            reason === r ? 'border-plum bg-plum text-cream' : 'border-plum/20 hover:border-plum/50'
                          }`}
                        >
                          <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="sr-only" />
                          {r}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <textarea
                    name="message"
                    required
                    maxLength={5000}
                    rows={4}
                    placeholder="Tell us everything…"
                    aria-label="Your message"
                    className="mt-6 w-full resize-y rounded-2xl border-0 bg-[repeating-linear-gradient(transparent,transparent_2.55rem,rgb(88_14_121/0.15)_2.55rem,rgb(88_14_121/0.15)_2.6rem)] bg-transparent px-1 leading-[2.6rem] placeholder:text-plum/35 focus:outline-none"
                  />

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <p className="font-sans italic text-plum/70">
                      With love, <span className="display not-italic text-2xl text-plum">{name || '…'}</span>
                    </p>
                    <button type="submit" disabled={pending} className="btn bg-plum text-cream shadow-[4px_5px_0_var(--color-tomato)] disabled:opacity-60">
                      {pending ? 'Sealing…' : 'Seal & send'} <Icon icon={SentIcon} size={18} />
                    </button>
                  </div>
                  <p role="status" aria-live="polite" className="mt-3 text-base font-semibold text-tomato">
                    {state.status === 'error' ? state.message : ''}
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
