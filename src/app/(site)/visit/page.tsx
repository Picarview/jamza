import type { Metadata } from 'next';
import { ArrowDown01Icon, ArrowUpRight01Icon, Bus01Icon, Hotel01Icon, Mail01Icon } from '@hugeicons/core-free-icons';
import { brand } from '@/components/Brand';
import { FormCard } from '@/components/FormCard';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { Reveal } from '@/components/Reveal';
import { Venue } from '@/components/home/Venue';
import { festival } from '@/content/festival';
import { bedasHotel, faqs, shuttle } from '@/content/visit';
import { baseOpenGraph } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Plan your visit',
  description:
    'Getting to JAMZA! FESTIVAL 2026: venue and map, the GHS 30 Accra Mall shuttle, Beda’s Hotel, the dress code and FAQs.',
  alternates: { canonical: '/visit' },
  openGraph: { ...baseOpenGraph, url: '/visit', title: 'Plan your visit — JAMZA! FESTIVAL 2026' },
};

const jump = [
  ['Venue', '#venue'],
  ['Shuttle', '#shuttle'],
  ['Stay', '#stay'],
  ['Dress code', '#dress-code'],
  ['FAQs', '#faqs'],
];

export default function VisitPage() {
  return (
    <>
      <PageHeader
        tone="pine"
        eyebrow={`${festival.name} · ${festival.dateLabel}`}
        title="Plan your visit"
        intro="Everything you need for the day: how to get there, where to stay, what to wear."
      >
        <nav aria-label="On this page" className="mt-10 flex flex-wrap gap-2">
          {jump.map(([label, href]) => (
            <a key={href} href={href} className="glass flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5">
              {label} <Icon icon={ArrowDown01Icon} size={14} />
            </a>
          ))}
        </nav>
      </PageHeader>

      <Venue />

      {/* Shuttle */}
      <section id="shuttle" aria-labelledby="shuttle-title" className="scroll-mt-24 bg-[linear-gradient(170deg,#580e79,#1f0530)] py-24">
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="eyebrow text-gold">Getting there</p>
            <h2 id="shuttle-title" className="display mt-4 text-6xl leading-[0.9]">
              Ride the {brand('JAMZA!')} shuttle
            </h2>
            <div className="mt-8 flex items-end gap-3">
              <span className="headline text-7xl text-gold">{festival.currency} {shuttle.fare}</span>
              <span className="pb-2 text-cream/70">round trip</span>
            </div>
            <ol className="mt-8 space-y-4">
              {[
                ['Pick-up', shuttle.pickup, shuttle.departure],
                ['Drop-off', 'Beda’s Events Center, Old Ashongman', null],
                ['Back to', shuttle.pickup, shuttle.return],
              ].map(([label, place, time]) => (
                <li key={label} className="flex items-center gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cream text-plum">
                    <Icon icon={Bus01Icon} size={20} />
                  </span>
                  <span>
                    <span className="eyebrow block text-cream/55">{label}</span>
                    <span className="font-semibold">
                      {place}
                      {time ? ` · ${time}` : ''}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-sm text-cream/60">
              {shuttle.departure ? '' : 'Departure and return times will be announced soon. '}
              Book now to hold your seats.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <FormCard kind="shuttle" submitLabel="Book my seats" note="We’ll email you how to pay and confirm your seats." />
          </Reveal>
        </div>
      </section>

      {/* Stay */}
      <section id="stay" aria-labelledby="stay-title" className="scroll-mt-24 bg-cream py-24 text-plum">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="eyebrow text-tomato">Staying over</p>
            <h2 id="stay-title" className="display mt-4 text-6xl">Where to stay</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Reveal className="flex flex-col justify-between gap-8 rounded-[2rem] bg-plum p-8 text-cream shadow-[10px_12px_0_var(--color-tomato)]">
              <div>
                <span className="grid size-14 place-items-center rounded-full bg-cream text-plum">
                  <Icon icon={Hotel01Icon} size={26} />
                </span>
                <h3 className="display mt-6 text-4xl">{bedasHotel.name}</h3>
                <p className="mt-3 text-cream/80">{bedasHotel.blurb}</p>
              </div>
              <a href={bedasHotel.url} target="_blank" rel="noopener noreferrer" className="btn btn-cream w-fit">
                Book on bedasassociation.com <Icon icon={ArrowUpRight01Icon} size={18} />
              </a>
            </Reveal>
            <Reveal delay={0.08} className="flex flex-col justify-between gap-8 rounded-[2rem] border-2 border-dashed border-plum/25 p-8">
              <div>
                <span className="grid size-14 place-items-center rounded-full bg-plum/10 text-plum">
                  <Icon icon={Mail01Icon} size={26} />
                </span>
                <h3 className="display mt-6 text-4xl">Somewhere else nearby?</h3>
                <p className="mt-3 text-plum/75">
                  We’re lining up recommended hotels around Old Ashongman. Tell us your dates and we’ll help you book.
                </p>
              </div>
              <a href="/#letter" className="btn w-fit bg-plum text-cream shadow-[4px_5px_0_var(--color-tomato)]">
                Ask about hotels <Icon icon={ArrowUpRight01Icon} size={18} />
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Dress code */}
      <section id="dress-code" aria-labelledby="dress-title" className="scroll-mt-24 overflow-hidden bg-night py-24">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <Reveal>
            <p className="eyebrow text-gold">Dress code</p>
            <h2 id="dress-title" className="display mt-4 text-6xl sm:text-7xl">Wear the colours</h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-cream/80">
              Purple, cream, red or green. Wear one, wear them all, or bring them together in African print.
            </p>
          </Reveal>
          <ul className="mt-14 flex flex-wrap justify-center gap-6 sm:gap-10">
            {festival.dressColours.map((c, i) => (
              <li key={c.name}>
                <Reveal delay={i * 0.08} rotate={i % 2 ? 8 : -8}>
                  <span
                    className="block size-28 rounded-full border-[6px] border-peach shadow-[8px_10px_0_rgb(0_0_0/0.4)] sm:size-36"
                    style={{ background: c.hex }}
                  />
                  <span className="display mt-4 block text-3xl">{c.name}</span>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" aria-labelledby="faq-title" className="scroll-mt-24 bg-peach py-24 text-plum">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <p className="eyebrow text-tomato">Good to know</p>
            <h2 id="faq-title" className="display mt-4 text-6xl">FAQs</h2>
          </Reveal>
          <div className="mt-10 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl bg-cream p-5 shadow-[4px_5px_0_rgb(31_5_48/0.12)] open:shadow-[6px_8px_0_rgb(31_5_48/0.18)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold">
                  {brand(f.q)}
                  <Icon icon={ArrowDown01Icon} size={20} className="shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-plum/80">{brand(f.a)}</p>
              </details>
            ))}
          </div>
          <p className="mt-10 text-plum/70">
            Something else? <a href="/#letter" className="font-bold text-plum underline underline-offset-4">Write to us</a>.
          </p>
        </div>
      </section>
    </>
  );
}
