import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { report2025 as report } from '@/content/report2025';
import { brand } from '../Brand';
import { HalfMoons } from '../HalfMoons';
import { Icon } from '../Icon';
import { Reveal } from '../Reveal';

const fan = [
  { page: 3, cls: 'left-[2%] top-[8%] -rotate-[10deg] group-hover:-rotate-[16deg] group-hover:-translate-x-6' },
  { page: 11, cls: 'right-[2%] top-[8%] rotate-[9deg] group-hover:rotate-[15deg] group-hover:translate-x-6' },
  { page: 0, cls: 'left-1/2 top-0 -translate-x-1/2 -rotate-1 group-hover:-translate-y-3' },
];

/** Proof from the first edition, linking to the full report page. */
export function LastTime() {
  return (
    <section aria-labelledby="last-time-title" className="relative overflow-hidden bg-peach py-28 text-plum">
      <HalfMoons className="absolute -right-12 bottom-0 w-60 sm:w-80" flip />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow text-tomato">Last time at {brand('JAMZA!')}</p>
          <h2 id="last-time-title" className="display mt-4 text-6xl leading-[0.9] sm:text-7xl">
            2025 was the first one.
          </h2>
          <p className="mt-5 max-w-md text-lg text-plum/80">
            Fourteen women on one stage, a live house band, and a room full of people singing along.
            Read the full event report.
          </p>
          <dl className="mt-10 grid grid-cols-3 gap-6">
            {report.stats.slice(0, 3).map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="headline block text-4xl sm:text-5xl">{s.value}</span>
                  <span className="mt-1 block text-sm text-plum/70">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
          <Link href="/2025" className="btn mt-10 bg-plum text-cream shadow-[4px_5px_0_var(--color-tomato)]">
            Read the 2025 report <Icon icon={ArrowUpRight01Icon} size={18} />
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <Link href="/2025" aria-label="Open the JAMZA! 2025 event report" className="group relative mx-auto block aspect-[1.15] w-full max-w-lg">
            {fan.map(({ page, cls }) => (
              <span
                key={page}
                className={`absolute w-[52%] overflow-hidden rounded-xl border-4 border-cream shadow-[10px_14px_0_rgb(31_5_48/0.25)] transition-transform duration-700 ease-[var(--ease-spring)] ${cls}`}
              >
                <Image
                  src={report.pages[page].src}
                  alt=""
                  width={report.pageSize.width}
                  height={report.pageSize.height}
                  sizes="(min-width: 1024px) 16rem, 50vw"
                  className="h-auto w-full"
                />
              </span>
            ))}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
