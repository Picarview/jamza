'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useActionState, type ReactNode } from 'react';
import { SentIcon } from '@hugeicons/core-free-icons';
import { submitForm, type LetterState } from '@/app/actions';
import { forms, type FormKind } from '@/lib/forms';
import { brand } from './Brand';
import { Icon } from './Icon';

const input =
  'mt-2 w-full rounded-2xl border-2 border-plum/15 bg-white px-4 py-3 text-base text-plum placeholder:text-plum/35 transition-colors focus:border-plum focus:outline-none';

/** Cream card form in the letter style. `before` renders above the fields (e.g. the shop basket). */
export function FormCard({
  kind,
  submitLabel,
  before,
  note,
  disabled,
}: {
  kind: FormKind;
  submitLabel: string;
  before?: ReactNode;
  note?: ReactNode;
  disabled?: ReactNode;
}) {
  const [state, action, pending] = useActionState<LetterState, FormData>(submitForm.bind(null, kind), {
    status: 'idle',
    message: '',
  });
  const config = forms[kind];

  return (
    <div className="relative rounded-[2rem] bg-cream p-6 text-plum shadow-[14px_18px_0_rgb(0_0_0/0.3)] sm:p-9">
      <AnimatePresence mode="wait">
        {state.status === 'sent' ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-[22rem] flex-col items-center justify-center text-center"
            role="status"
          >
            <motion.span
              animate={{ x: [0, -10, 240], y: [0, 6, -160], rotate: [0, -8, 25], opacity: [1, 1, 0] }}
              transition={{ duration: 1.4, times: [0, 0.25, 1], ease: 'easeIn' }}
              className="text-tomato"
            >
              <Icon icon={SentIcon} size={60} />
            </motion.span>
            <p className="display mt-6 text-5xl">Sent!</p>
            <p className="mt-3 max-w-sm text-plum/75">{brand(state.message)}</p>
          </motion.div>
        ) : disabled ? (
          <div className="flex min-h-[16rem] flex-col items-center justify-center text-center">{disabled}</div>
        ) : (
          <motion.form key="form" action={action} exit={{ opacity: 0, y: -16 }}>
            <label className="hidden" aria-hidden>
              Website <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            {before}
            <div className="grid gap-5 sm:grid-cols-2">
              {config.fields.map((f) => {
                const span = f.half ? '' : 'sm:col-span-2';
                if (f.type === 'checkbox') {
                  return (
                    <label key={f.name} className={`flex items-start gap-3 text-sm text-plum/80 ${span}`}>
                      <input type="checkbox" name={f.name} required={f.required} className="mt-0.5 size-5 shrink-0 accent-plum" />
                      {f.label}
                    </label>
                  );
                }
                const label = (
                  <span className="text-sm font-bold">
                    {f.label}
                    {f.required && <span className="text-tomato"> *</span>}
                  </span>
                );
                return (
                  <label key={f.name} className={`block ${span}`}>
                    {label}
                    {f.type === 'textarea' ? (
                      <textarea name={f.name} required={f.required} maxLength={f.maxLength} placeholder={f.placeholder} rows={3} className={`${input} resize-y`} />
                    ) : f.type === 'select' ? (
                      <select name={f.name} required={f.required} defaultValue="" className={input}>
                        <option value="" disabled>
                          Choose one
                        </option>
                        {f.options?.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name={f.name}
                        type={f.type ?? 'text'}
                        required={f.required}
                        maxLength={f.maxLength}
                        min={f.min}
                        max={f.max}
                        defaultValue={f.type === 'number' ? f.min : undefined}
                        placeholder={f.placeholder}
                        autoComplete={f.autoComplete}
                        className={input}
                      />
                    )}
                  </label>
                );
              })}
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
              {note && <p className="max-w-xs text-sm text-plum/65">{note}</p>}
              <button type="submit" disabled={pending} className="btn ml-auto bg-plum text-cream shadow-[4px_5px_0_var(--color-tomato)] disabled:opacity-60">
                {pending ? 'Sending…' : submitLabel} <Icon icon={SentIcon} size={18} />
              </button>
            </div>
            <p role="status" aria-live="polite" className="mt-3 text-sm font-semibold text-tomato">
              {state.status === 'error' ? state.message : ''}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
