import Image from 'next/image';
import { Coffee01Icon, Mic01Icon, PartyIcon } from '@hugeicons/core-free-icons';
import { festival, type Act } from '@/content/festival';
import { Icon } from '../Icon';
import { Reveal } from '../Reveal';
import { brand } from '../Brand';

const themes = {
  orange: {
    bg: 'bg-[linear-gradient(160deg,#f06a1f_0%,#d8461e_55%,#8e1f4f_100%)]',
    chip: 'bg-cream text-tomato',
    accent: 'text-peach',
    icon: Coffee01Icon,
  },
  green: {
    bg: 'bg-[linear-gradient(160deg,#00843d_0%,#0b5a33_60%,#052e1b_100%)]',
    chip: 'bg-cream text-pine',
    accent: 'text-gold',
    icon: Mic01Icon,
  },
  purple: {
    bg: 'bg-[linear-gradient(160deg,#7a1aa3_0%,#430a5e_55%,#12031c_100%)]',
    chip: 'bg-cream text-plum',
    accent: 'text-lavender',
    icon: PartyIcon,
  },
} as const;

function ActPanel({ act, index }: { act: Act; index: number }) {
  const t = themes[act.theme];
  const flip = index % 2 === 1;
  return (
    <article
      id={act.id}
      aria-labelledby={`${act.id}-title`}
      className={`torn-top relative -mt-7 overflow-hidden pb-28 pt-24 sm:pt-32 ${t.bg}`}
    >

      <div className={`relative mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div>
          <Reveal>
            <p className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold">
              <Icon icon={t.icon} size={18} /> Act {act.numeral}
            </p>
            <h3 id={`${act.id}-title`} className="display mt-6 text-[clamp(3.5rem,9vw,7rem)]">
              {act.title}
            </h3>
            <p className={`headline mt-3 text-2xl sm:text-3xl ${t.accent}`}>{act.kicker}</p>
          </Reveal>
          <Reveal delay={0.1} className="mt-8 space-y-4 text-lg text-cream/90">
            {act.body.map((p) => (
              <p key={p}>{brand(p)}</p>
            ))}
          </Reveal>
          <Reveal delay={0.2}>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label={`What happens during ${act.title}`}>
              {act.tags.map((tag, i) => (
                <li
                  key={tag}
                  className={`rounded-full px-4 py-2 text-sm font-bold shadow-[3px_4px_0_rgb(0_0_0/0.25)] ${t.chip}`}
                  style={{ rotate: `${(i % 3) - 1}deg` }}
                >
                  {tag}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-lg">
          {act.images.map((img, i) => (
            <Reveal
              key={img.src}
              delay={0.1 + i * 0.15}
              rotate={i ? 10 : -10}
              className={`absolute ${i === 0 ? 'left-0 top-0 w-[78%]' : 'bottom-0 right-0 w-[62%]'}`}
            >
              <div
                className={`overflow-hidden rounded-[2rem] border-[6px] border-peach shadow-[12px_16px_0_rgb(0_0_0/0.3)] transition-transform duration-500 ease-[var(--ease-spring)] hover:rotate-0 hover:scale-[1.03] ${
                  i === 0 ? '-rotate-3' : 'rotate-6'
                }`}
              >
              <Image
                src={img.src}
                alt={img.alt}
                width={960}
                height={680}
                sizes="(min-width: 1024px) 32rem, 80vw"
                className="aspect-[4/3] h-auto w-full object-cover"
              />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </article>
  );
}

export function TheNight() {
  return (
    <section id="the-night" aria-labelledby="the-night-title" className="relative bg-night">
      <div className="relative bg-night pb-20 pt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="eyebrow text-gold">The night, in three acts</p>
            <h2 id="the-night-title" className="headline mt-4 text-[clamp(3rem,9vw,7.5rem)] uppercase">
              Afternoon <span className="display normal-case text-ember">to</span> early hours.
            </h2>
          </Reveal>
          <ol className="mt-10 grid gap-3 sm:grid-cols-3">
            {festival.acts.map((act, i) => (
              <li key={act.id}>
                <Reveal delay={i * 0.08}>
                  <a
                    href={`#${act.id}`}
                    className="glass group flex items-center justify-between rounded-full px-5 py-4 transition-transform duration-300 ease-[var(--ease-spring)] hover:-translate-y-1"
                  >
                    <span className="display text-2xl">
                      <span className="mr-2 font-sans text-sm font-bold text-gold">{act.numeral}</span>
                      {act.title}
                    </span>
                    <Icon icon={themes[act.theme].icon} size={22} className="transition-transform group-hover:rotate-12" />
                  </a>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
      {festival.acts.map((act, i) => (
        <ActPanel key={act.id} act={act} index={i} />
      ))}
    </section>
  );
}
