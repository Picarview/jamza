import {
  ArrowUpRight01Icon,
  Calendar03Icon,
  Clock01Icon,
  Dress01Icon,
  Location01Icon,
  Navigation03Icon,
} from '@hugeicons/core-free-icons';
import { festival } from '@/content/festival';
import { Icon } from '../Icon';
import { Reveal } from '../Reveal';

/** Where the night happens: venue, address and a map tinted to sit in the night palette. */
export function Venue() {
  return (
    <section id="venue" aria-labelledby="venue-title" className="relative overflow-hidden bg-night py-28">
      <div className="absolute -right-40 top-0 size-[32rem] rounded-full bg-pine/25 blur-[140px]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow text-gold">Where the night happens</p>
          <h2 id="venue-title" className="display mt-4 text-6xl leading-[0.9] sm:text-7xl">
            {festival.venue}
          </h2>
          <ul className="mt-8 space-y-3 text-lg text-cream/85">
            <li className="flex items-center gap-3">
              <Icon icon={Location01Icon} size={20} className="shrink-0 text-tomato" />
              {festival.city}
            </li>
            <li className="flex items-center gap-3">
              <Icon icon={Calendar03Icon} size={20} className="shrink-0 text-tomato" />
              {festival.dateLabel}
            </li>
            <li className="flex items-center gap-3">
              <Icon icon={Clock01Icon} size={20} className="shrink-0 text-tomato" />
              {festival.hours}
            </li>
            <li className="flex items-center gap-3">
              <Icon icon={Dress01Icon} size={20} className="shrink-0 text-tomato" />
              Dress code: {festival.dressCode}
            </li>
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={festival.map.directions} target="_blank" rel="noopener noreferrer" className="btn btn-cream">
              <Icon icon={Navigation03Icon} size={18} /> Get directions
            </a>
            <a href={festival.map.link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Open in Google Maps <Icon icon={ArrowUpRight01Icon} size={18} />
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.1} rotate={3}>
          <div className="relative -rotate-1 overflow-hidden rounded-[2rem] border-[6px] border-peach bg-plum-900 shadow-[14px_18px_0_rgb(0_0_0/0.35)]">
            <iframe
              src={festival.map.embed}
              title={`Map showing ${festival.venue}, ${festival.city}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="block aspect-[4/3] w-full border-0"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
