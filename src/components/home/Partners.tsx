import { ArrowUpRight01Icon, GiftIcon } from '@hugeicons/core-free-icons';
import { safeUrl } from '@/lib/safe-url';
import { brand } from '../Brand';
import { Icon } from '../Icon';
import { Reveal } from '../Reveal';

export type PartnerTag = { id: string; name: string; url: string; image: string; tagline?: string };

const tilt = [-4, 3, -2, 4, -3, 2, -1, 3];

/** Local logos ("/images/…") or CMS uploads (https). */
export const partnerLogo = (image: string) => (image.startsWith('/') ? image : safeUrl(image));

/** Sponsors & partners as gift tags hanging from a string — the /partners page. */
export function Partners({ partners }: { partners: PartnerTag[] }) {
  return (
    <section
      aria-labelledby="partners-title"
      className="relative overflow-hidden bg-[linear-gradient(170deg,#00843d_0%,#0b5a33_55%,#052e1b_100%)] pb-28 pt-36 sm:pt-40"
    >
      <div className="absolute -left-24 top-10 size-[26rem] rounded-full bg-gold/15 blur-[120px]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center">
          <p className="eyebrow text-gold">{brand('JAMZA!')} FESTIVAL 2026 · Sponsors & partners</p>
          <h1 id="partners-title" className="display mt-4 text-6xl sm:text-8xl">
            Wrapped with love by
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-cream/80">
            The people and brands making {brand('JAMZA!')} happen this year.
          </p>
        </Reveal>

        <div className="relative mt-16">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="absolute inset-x-0 -top-2 hidden h-10 w-full text-cream/40 sm:block" aria-hidden>
            <path d="M0 8 Q300 52 600 18 T1200 12" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
          </svg>

          <ul className="relative grid grid-cols-2 gap-x-5 gap-y-10 pt-6 sm:grid-cols-3 lg:grid-cols-4">
            {partners.map((p, i) => {
              const url = safeUrl(p.url);
              const logo = partnerLogo(p.image);
              const tag = (
                <span
                  className="group relative flex aspect-[3/4] flex-col items-center justify-center rounded-[1.5rem] bg-cream px-5 pb-6 pt-12 text-center text-plum shadow-[8px_12px_0_rgb(0_0_0/0.25)] transition-transform duration-500 ease-[var(--ease-spring)] hover:-translate-y-2 hover:rotate-0"
                  style={{ rotate: `${tilt[i % tilt.length]}deg`, clipPath: 'polygon(18% 0, 82% 0, 100% 12%, 100% 100%, 0 100%, 0 12%)' }}
                >
                  <span aria-hidden className="absolute left-1/2 top-3 size-4 -translate-x-1/2 rounded-full border-4 border-tomato/70 bg-[#0b5a33]" />
                  {logo ? (
                    <img src={logo} alt={`${p.name} logo`} loading="lazy" className="max-h-28 w-auto max-w-full rounded-lg object-contain" />
                  ) : (
                    <span className="headline break-words text-3xl leading-[0.95]">{brand(p.name)}</span>
                  )}
                  {p.tagline && <span className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-plum/55">{p.tagline}</span>}
                  {url && (
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-tomato opacity-0 transition-opacity group-hover:opacity-100">
                      Visit <Icon icon={ArrowUpRight01Icon} size={12} />
                    </span>
                  )}
                </span>
              );
              return (
                <li key={p.id} className="origin-top">
                  <Reveal delay={i * 0.06} y={-30}>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} (opens their website)`}>
                        {tag}
                      </a>
                    ) : (
                      tag
                    )}
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>

        <Reveal className="mx-auto mt-20 flex max-w-3xl flex-col items-center justify-between gap-6 rounded-[2rem] border-2 border-dashed border-cream/35 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
          <div className="flex items-center gap-4">
            <span className="hidden size-14 shrink-0 place-items-center rounded-full bg-tomato text-cream sm:grid">
              <Icon icon={GiftIcon} size={26} />
            </span>
            <div>
              <p className="display text-3xl">Want your name under the tree?</p>
              <p className="text-cream/75">Sponsor or partner with {brand('JAMZA!')} 2026.</p>
            </div>
          </div>
          <a href="/#letter" className="btn btn-cream shrink-0">
            Partner with us <Icon icon={ArrowUpRight01Icon} size={18} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
