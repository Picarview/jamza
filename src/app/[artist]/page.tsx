import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  InstagramIcon,
  Location01Icon,
  Ticket01Icon,
} from '@hugeicons/core-free-icons';
import { brand } from '@/components/Brand';
import { Icon } from '@/components/Icon';
import { JsonLd } from '@/components/JsonLd';
import { Reveal } from '@/components/Reveal';
import { festival } from '@/content/festival';
import { artistBySlug, lineup, type LineupArtist } from '@/content/lineup';
import { baseOpenGraph, siteUrl } from '@/lib/site';

// One page per artist, all generated at build; anything else is a 404.
export const dynamicParams = false;
export const generateStaticParams = () => lineup.map((a) => ({ artist: a.slug }));

type Props = { params: Promise<{ artist: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artist = artistBySlug((await params).artist);
  if (!artist) return {};
  const description = artist.bio[0]
    ? `${artist.bio[0].slice(0, 150)}${artist.bio[0].length > 150 ? '…' : ''}`
    : `${artist.name} performs at JAMZA! FESTIVAL 2026 — Saturday 19 December, Beda’s, Old Ashongman, Accra.`;
  return {
    title: { absolute: `${artist.name} · JAMZA! FESTIVAL 2026` },
    description,
    alternates: { canonical: `/${artist.slug}` },
    openGraph: { ...baseOpenGraph, type: 'profile', url: `/${artist.slug}`, title: `${artist.name} · JAMZA! FESTIVAL 2026`, description },
    twitter: { card: 'summary_large_image', title: `${artist.name} · JAMZA! FESTIVAL 2026`, description },
  };
}

const backgrounds: Record<LineupArtist['accent'], string> = {
  tomato: 'bg-[linear-gradient(160deg,#d8461e_0%,#8e1f4f_45%,#12031c_100%)]',
  pine: 'bg-[linear-gradient(160deg,#00843d_0%,#0b5a33_45%,#12031c_100%)]',
  plum: 'bg-[linear-gradient(160deg,#7a1aa3_0%,#430a5e_45%,#12031c_100%)]',
  ember: 'bg-[linear-gradient(160deg,#f06a1f_0%,#c4391a_40%,#12031c_100%)]',
};

const badge: Record<LineupArtist['accent'], string> = {
  tomato: 'bg-gold text-plum-900',
  pine: 'bg-tomato text-cream',
  plum: 'bg-lime text-black',
  ember: 'bg-plum text-cream',
};

export default async function ArtistPage({ params }: Props) {
  const artist = artistBySlug((await params).artist);
  if (!artist) notFound();

  const index = lineup.indexOf(artist);
  const prev = lineup[(index - 1 + lineup.length) % lineup.length];
  const next = lineup[(index + 1) % lineup.length];
  const [cover, ...gallery] = artist.photos;
  const tierLabel = artist.tier === 'main' ? 'Main artist' : 'Special guest';

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': artist.name.includes('Band') ? 'MusicGroup' : 'Person',
          name: artist.name,
          description: artist.bio[0] ?? artist.role,
          url: `${siteUrl}/${artist.slug}`,
          ...(cover ? { image: `${siteUrl}${cover.src}` } : {}),
          sameAs: [artist.url],
          performerIn: { '@id': `${siteUrl}/#event` },
        }}
      />

      <section className={`relative overflow-x-clip pb-24 pt-32 sm:pt-40 ${backgrounds[artist.accent]}`}>
        <div className="relative mx-auto grid max-w-6xl items-start gap-14 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* Portrait */}
          <Reveal rotate={-6} className="mx-auto w-full max-w-md lg:sticky lg:top-28">
            <div className="relative">
              {cover ? (
                <div className="-rotate-2 overflow-hidden rounded-[2rem] border-[7px] border-peach shadow-[14px_18px_0_rgb(0_0_0/0.4)]">
                  <Image
                    src={cover.src}
                    alt={`${artist.name}`}
                    width={cover.width}
                    height={cover.height}
                    priority
                    sizes="(min-width: 1024px) 28rem, 90vw"
                    className="aspect-[4/5] h-auto w-full object-cover"
                  />
                </div>
              ) : (
                <div className="grid aspect-[4/5] -rotate-2 place-items-center rounded-[2rem] border-[7px] border-peach bg-plum-900 shadow-[14px_18px_0_rgb(0_0_0/0.4)]">
                  <Image src="/images/logo-main.png" alt="" width={994} height={780} className="w-1/2 animate-wobble" />
                </div>
              )}
              <span className={`absolute -top-4 right-2 rotate-6 sm:-right-3 rounded-full px-4 py-2 text-sm font-bold shadow-[4px_5px_0_rgb(0_0_0/0.35)] ${badge[artist.accent]}`}>
                {tierLabel}
              </span>
            </div>
          </Reveal>

          {/* Story */}
          <div>
            <Reveal>
              <Link href="/#lineup" className="eyebrow inline-flex items-center gap-2 text-cream/70 transition-colors hover:text-cream">
                <Icon icon={ArrowLeft01Icon} size={14} /> {brand('JAMZA!')} FESTIVAL 2026 · The lineup
              </Link>
              <h1 className="display mt-6 text-[clamp(3.5rem,10vw,8rem)] leading-[0.88]">{brand(artist.name)}</h1>
              <p className="headline mt-4 text-2xl text-gold sm:text-3xl">{brand(artist.role)}</p>
            </Reveal>

            <Reveal delay={0.1} className="mt-8 flex flex-wrap gap-3">
              <a href={artist.url} target="_blank" rel="noopener noreferrer" className="btn btn-cream">
                <Icon icon={InstagramIcon} size={18} /> @{artist.handle}
              </a>
              <Link href="/#tickets" className="btn btn-ghost">
                <Icon icon={Ticket01Icon} size={18} /> Get tickets
              </Link>
            </Reveal>

            <Reveal delay={0.15} className="mt-10 space-y-5 text-lg leading-relaxed text-cream/85">
              {artist.bio.length ? (
                artist.bio.map((p) => <p key={p}>{brand(p)}</p>)
              ) : (
                <p>
                  Catch {brand(artist.name)} live at {brand('JAMZA!')} FESTIVAL 2026. Follow along on
                  Instagram for more before the night.
                </p>
              )}
            </Reveal>

            <Reveal delay={0.2}>
              <ul className="mt-10 flex flex-wrap gap-2 text-sm font-semibold">
                <li className="glass flex items-center gap-2 rounded-full px-4 py-2">
                  <Icon icon={Calendar03Icon} size={16} /> {festival.shortDate} · {festival.hours}
                </li>
                <li>
                  <Link href="/#venue" className="glass flex items-center gap-2 rounded-full px-4 py-2">
                    <Icon icon={Location01Icon} size={16} /> Beda’s, Old Ashongman
                  </Link>
                </li>
              </ul>
            </Reveal>

            {gallery.length > 0 && (
              <div className="mt-14 grid grid-cols-2 gap-4">
                {gallery.map((p, i) => (
                  <Reveal key={p.src} delay={0.1 + i * 0.08} rotate={i % 2 ? 4 : -4}>
                    <div className={`overflow-hidden rounded-[1.5rem] border-[5px] border-peach shadow-[8px_10px_0_rgb(0_0_0/0.35)] ${i % 2 ? 'rotate-2' : '-rotate-2'}`}>
                      <Image src={p.src} alt={`${artist.name}`} width={p.width} height={p.height} sizes="(min-width: 1024px) 18rem, 45vw" className="aspect-[4/3] h-auto w-full object-cover" />
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Keep exploring */}
      <nav aria-label="More artists" className="bg-night py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { a: prev, label: 'Previous', icon: ArrowLeft01Icon, align: 'text-left' },
              { a: next, label: 'Next', icon: ArrowRight01Icon, align: 'sm:text-right' },
            ].map(({ a, label, icon, align }) => (
              <Link
                key={label}
                href={`/${a.slug}`}
                className={`glass group flex items-center gap-4 rounded-[1.75rem] p-4 transition-transform duration-300 hover:-translate-y-1 ${label === 'Next' ? 'sm:flex-row-reverse' : ''}`}
              >
                {a.image ? (
                  <Image src={a.image} alt="" width={96} height={96} className="size-16 shrink-0 rounded-full border-4 border-peach object-cover" />
                ) : (
                  <span className="size-16 shrink-0 rounded-full border-4 border-peach bg-plum" />
                )}
                <span className={`flex-1 ${align}`}>
                  <span className="eyebrow flex items-center gap-1 text-cream/55 sm:inline-flex">
                    {label === 'Previous' && <Icon icon={icon} size={14} />} {label} {label === 'Next' && <Icon icon={icon} size={14} />}
                  </span>
                  <span className="display block text-3xl">{brand(a.name)}</span>
                </span>
              </Link>
            ))}
          </div>

          <p className="eyebrow mt-14 text-gold">More on the lineup</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {lineup
              .filter((a) => a !== artist)
              .map((a) => (
                <li key={a.slug}>
                  <Link href={`/${a.slug}`} className="flex items-center gap-2 rounded-full border border-cream/20 py-1.5 pl-1.5 pr-4 text-sm font-semibold transition-colors hover:bg-cream hover:text-plum">
                    {a.image ? (
                      <Image src={a.image} alt="" width={64} height={64} className="size-8 rounded-full object-cover" />
                    ) : (
                      <span className="size-8 rounded-full bg-plum" />
                    )}
                    {brand(a.name)}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
