import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowDown01Icon, ArrowUpRight01Icon, Download04Icon, Ticket01Icon } from '@hugeicons/core-free-icons';
import { brand } from '@/components/Brand';
import { HalfMoons } from '@/components/HalfMoons';
import { Icon } from '@/components/Icon';
import { Reveal } from '@/components/Reveal';
import { ReportReader } from '@/components/report/ReportReader';
import { festival } from '@/content/festival';
import { report2025 as report } from '@/content/report2025';
import { baseOpenGraph } from '@/lib/site';
import { reportArticle } from '@/lib/structured-data';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: { absolute: 'JAMZA! 2025 — Event Report' },
  description: `${report.summary} About 102 people, 14 female performers and Beda’s House Band.`,
  alternates: { canonical: '/2025' },
  openGraph: {
    ...baseOpenGraph,
    type: 'article',
    url: '/2025',
    title: 'JAMZA! 2025 — Event Report',
    description: report.summary,
  },
  twitter: { card: 'summary_large_image', title: 'JAMZA! 2025 — Event Report', description: report.summary },
};

export default function Report2025() {
  return (
    <>
      <JsonLd data={reportArticle()} />
      {/* Header */}
      <section className="relative overflow-hidden bg-[radial-gradient(70%_60%_at_80%_20%,#580e79_0%,#1f0530_55%,#12031c_100%)] pb-20 pt-32 sm:pt-40">
        <HalfMoons className="absolute -left-12 bottom-0 w-56 opacity-70 sm:w-72" flip />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal>
            <p className="eyebrow text-gold">Last time at {brand('JAMZA!')} · Event report</p>
            <h1 className="display mt-4 text-[clamp(4rem,12vw,8.5rem)] leading-[0.88]">
              JAMZA<span className="text-tomato">!</span> 2025
            </h1>
            <p className="mt-6 max-w-xl text-lg text-cream/80">{brand(report.summary)}</p>
            <p className="mt-3 text-sm text-cream/55">Written by {report.author}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#report" className="btn btn-cream">
                Start reading <Icon icon={ArrowDown01Icon} size={18} />
              </a>
              <a href={report.pdf} download className="btn btn-ghost">
                <Icon icon={Download04Icon} size={18} /> PDF · {report.pdfSize}
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.1} rotate={6} className="mx-auto w-[min(70vw,20rem)]">
            <a href="#report" aria-label="Start reading the report" className="block rotate-3 overflow-hidden rounded-2xl border-[6px] border-peach shadow-[14px_18px_0_rgb(0_0_0/0.4)] transition-transform duration-500 ease-[var(--ease-spring)] hover:rotate-0 hover:scale-[1.02]">
              <Image src={report.pages[0].src} alt="Cover of the JAMZA! 2025 Event Report" width={report.pageSize.width} height={report.pageSize.height} priority sizes="20rem" className="h-auto w-full" />
            </a>
          </Reveal>
        </div>

        {/* The numbers */}
        <dl className="relative mx-auto mt-20 grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-4 sm:px-6 md:grid-cols-5">
          {report.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="border-t border-cream/15 pt-5">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="headline block text-5xl text-gold sm:text-6xl">{s.value}</span>
                <span className="mt-2 block text-sm text-cream/70">{s.label}</span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* The report itself */}
      <section id="report" aria-label="The report" className="scroll-mt-20 bg-night py-16 sm:py-24">
        <ReportReader pages={report.pages} size={report.pageSize} pdf={report.pdf} pdfSize={report.pdfSize} />

        <div className="mx-auto mt-16 max-w-3xl px-4 sm:px-6">
          <details className="group rounded-[1.75rem] border border-cream/15 p-6 open:bg-cream/[0.03] sm:p-8">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              Read the report as text
              <Icon icon={ArrowDown01Icon} size={20} className="transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-6 space-y-8">
              {report.text.map((section) => (
                <section key={section.heading}>
                  <h2 className="headline text-2xl">{brand(section.heading)}</h2>
                  {section.body.map((p) => (
                    <p key={p} className="mt-3 leading-relaxed text-cream/80">
                      {brand(p)}
                    </p>
                  ))}
                </section>
              ))}
            </div>
          </details>
        </div>
      </section>

      {/* Bridge to this year */}
      <section className="relative overflow-hidden bg-grape py-24 text-center">
        <Reveal className="relative mx-auto max-w-3xl px-4">
          <p className="eyebrow text-lime">That was the first one</p>
          <h2 className="display mt-4 text-6xl text-lime sm:text-7xl">This year it’s bigger.</h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-cream/85">
            Three acts, one night: {festival.dateLabel}, {festival.hours}, {festival.venue}.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="/#tickets" className="btn bg-lime text-black shadow-[4px_5px_0_#000]">
              <Icon icon={Ticket01Icon} size={18} /> Get tickets
            </a>
            <a href="/#the-night" className="btn btn-ghost">
              See the night <Icon icon={ArrowUpRight01Icon} size={18} />
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
