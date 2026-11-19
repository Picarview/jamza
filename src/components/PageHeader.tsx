import type { ReactNode } from 'react';
import { brand } from './Brand';
import { HalfMoons } from './HalfMoons';
import { Reveal } from './Reveal';

const tones = {
  plum: 'bg-[radial-gradient(70%_60%_at_80%_10%,#7a1aa3_0%,#430a5e_45%,#12031c_100%)]',
  pine: 'bg-[radial-gradient(70%_60%_at_80%_10%,#00843d_0%,#0b5a33_45%,#12031c_100%)]',
  tomato: 'bg-[radial-gradient(70%_60%_at_80%_10%,#f06a1f_0%,#8e1f4f_45%,#12031c_100%)]',
} as const;

/** Opening block for inner pages: eyebrow, big Swung Note title, short intro. */
export function PageHeader({
  eyebrow,
  title,
  intro,
  tone = 'plum',
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  tone?: keyof typeof tones;
  children?: ReactNode;
}) {
  return (
    <header className={`relative overflow-hidden pb-16 pt-36 sm:pb-20 sm:pt-44 ${tones[tone]}`}>
      <HalfMoons className="absolute -right-10 bottom-0 hidden w-64 opacity-70 sm:block" flip />
      <Reveal className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <p className="eyebrow text-gold">{brand(eyebrow)}</p>
        <h1 className="display mt-4 max-w-4xl text-[clamp(3.5rem,10vw,7.5rem)] leading-[0.88]">{title}</h1>
        {intro && <p className="mt-6 max-w-xl text-lg text-cream/80">{intro}</p>}
        {children}
      </Reveal>
    </header>
  );
}
