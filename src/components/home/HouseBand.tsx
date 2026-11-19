import Image from 'next/image';
import { MusicNote03Icon } from '@hugeicons/core-free-icons';
import { brand } from '../Brand';
import { Icon } from '../Icon';
import { Reveal } from '../Reveal';

/** Members as credited in the JAMZA! 2025 event report. */
const members = [
  { name: 'Beda E.', role: 'Bass' },
  { name: 'Isack T.', role: 'Keys' },
  { name: 'Daniel S.', role: 'Guitar' },
  { name: 'Evan E.', role: 'Drums' },
];

/** JAMZA!'s backing band, right after the lineup. */
export function HouseBand() {
  return (
    <section id="house-band" aria-labelledby="house-band-title" className="relative overflow-hidden bg-cream py-24 text-plum sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <Reveal rotate={-4}>
          <div className="relative">
            <div className="-rotate-2 overflow-hidden rounded-[2rem] border-[7px] border-peach shadow-[14px_18px_0_rgb(31_5_48/0.2)]">
              <Image
                src="/images/artists/house-band.webp"
                alt="The members of Beda’s House Band"
                width={1600}
                height={1066}
                sizes="(min-width: 1024px) 36rem, 92vw"
                className="h-auto w-full"
              />
            </div>
            <span className="absolute -right-2 -top-4 rotate-6 rounded-full bg-plum px-4 py-2 text-sm font-bold text-cream shadow-[4px_5px_0_var(--color-tomato)] sm:-right-4">
              The Concert · 6–9:30pm
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="eyebrow text-tomato">{brand('JAMZA!')}’s backing band</p>
          <h2 id="house-band-title" className="display mt-4 text-6xl leading-[0.9] sm:text-7xl">
            Beda’s House Band
          </h2>
          <p className="mt-6 text-lg text-plum/80">
            The live foundation under every performance. Beda’s House Band backs the {brand('JAMZA!')} artists through the
            Concert, bringing depth, energy and musical cohesion to each set.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-3">
            {members.map((m) => (
              <li key={m.name} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[4px_5px_0_rgb(31_5_48/0.08)]">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-plum text-cream">
                  <Icon icon={MusicNote03Icon} size={18} />
                </span>
                <span>
                  <span className="block font-bold leading-tight">{m.name}</span>
                  <span className="text-sm text-plum/60">{m.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
