import Image from 'next/image';
import {
  ArrowUpRight01Icon,
  Clock01Icon,
  Dress01Icon,
  HourglassIcon,
  Location01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { festival } from '@/content/festival';
import { Icon } from '../Icon';
import { Reveal } from '../Reveal';

type Ticket = (typeof festival.tickets)[number];

/** The black starburst from the ticket artwork. */
function Starburst({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <path
        d="M100 0 L118 72 L196 48 L132 104 L200 150 L120 132 L104 200 L84 134 L8 170 L66 106 L0 58 L80 76 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function daysLeft(endsAt?: string) {
  if (!endsAt) return null;
  return Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86_400_000);
}

/** A ticket stub in the style of the campaign artwork: grape body, black price end, perforation. */
function Stub({ ticket, index }: { ticket: Ticket; index: number }) {
  const left = daysLeft(ticket.endsAt);
  const ended = left !== null && left <= 0;
  return (
    <Reveal delay={index * 0.06} rotate={index % 2 ? 3 : -3}>
      <article
        className={`group relative flex h-full min-h-36 overflow-hidden rounded-2xl shadow-[8px_10px_0_rgb(0_0_0/0.45)] transition-transform duration-500 ease-[var(--ease-spring)] hover:-translate-y-1.5 hover:rotate-0 ${
          index % 2 ? 'rotate-1' : '-rotate-1'
        } ${ended ? 'opacity-50 grayscale' : ''}`}
        style={{
          // Notches where the stub tears off.
          mask: 'radial-gradient(circle 12px at 68% 0, #0000 98%, #000) top / 100% 51% no-repeat, radial-gradient(circle 12px at 68% 100%, #0000 98%, #000) bottom / 100% 51% no-repeat',
        }}
      >
        {/* Body */}
        <div className="relative flex w-[68%] flex-col justify-between overflow-hidden bg-grape p-5">
          <Starburst className="absolute -bottom-10 -left-8 w-32 text-black/80 transition-transform duration-700 group-hover:rotate-12" />
          <span aria-hidden className="absolute inset-y-0 left-0 w-2 bg-lime [mask:radial-gradient(circle_3px_at_8px_6px,#0000_95%,#000)_0_0/8px_12px]" />
          <h3 className="display relative text-3xl leading-none text-lime">{ticket.name}</h3>
          <p className="relative mt-4 text-sm font-semibold text-cream/80">
            {ended ? 'Ended' : left !== null ? `${left} day${left === 1 ? '' : 's'} left` : ticket.note}
          </p>
        </div>
        {/* Perforation */}
        <span aria-hidden className="w-0 border-l-2 border-dashed border-cream/35" />
        {/* Price end */}
        <div className="flex flex-1 flex-col items-center justify-center bg-black px-2 text-center">
          {ticket.price === null ? (
            <span className="display text-4xl text-ticket-cream">TBC</span>
          ) : (
            <>
              <span className="display text-lg leading-none text-ticket-red">{festival.currency}</span>
              <span className="display text-5xl leading-none text-ticket-cream">{ticket.price}</span>
            </>
          )}
        </div>
      </article>
    </Reveal>
  );
}

export function Tickets() {
  const featured = festival.tickets.find((t) => t.featured);
  const left = daysLeft(featured?.endsAt);
  const earlyBirdOn = featured && left !== null && left > 0;
  const rest = festival.tickets.filter((t) => t !== featured || !earlyBirdOn);

  return (
    <section id="tickets" aria-labelledby="tickets-title" className="relative overflow-hidden bg-grape py-28">
      {/* Painted texture + starbursts, like the poster. */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_10%,rgb(255_255_255/0.08),transparent),radial-gradient(50%_60%_at_90%_90%,rgb(0_0_0/0.35),transparent)]" />
      <Starburst className="absolute -right-24 -top-16 w-[28rem] rotate-12 text-black/85" />
      <Starburst className="absolute -bottom-24 -left-28 w-96 -rotate-6 text-black/70" />
      <Starburst className="absolute left-[46%] top-20 hidden w-14 text-black/70 lg:block" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <p className="eyebrow text-lime">Tickets</p>
            <h2 id="tickets-title" className="display mt-4 text-[clamp(3.5rem,9vw,6.5rem)] leading-[0.9] text-lime">
              {earlyBirdOn ? 'Available now!' : 'Grab your ticket'}
            </h2>
            {earlyBirdOn && (
              <p className="display mt-3 text-2xl text-cream">Early bird till November 25</p>
            )}
            <ul className="mt-8 flex flex-wrap gap-2 text-sm font-semibold">
              {[
                { icon: Clock01Icon, text: `${festival.shortDate} · ${festival.hours}` },
                { icon: Location01Icon, text: 'Beda’s, Old Ashongman', href: '#venue' },
                { icon: Dress01Icon, text: `Dress code: ${festival.dressCode}` },
              ].map((item) => (
                <li key={item.text}>
                  {item.href ? (
                    <a href={item.href} className="flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-cream transition-colors hover:bg-black/60">
                      <Icon icon={item.icon} size={16} className="text-lime" /> {item.text}
                    </a>
                  ) : (
                    <span className="flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-cream">
                      <Icon icon={item.icon} size={16} className="text-lime" /> {item.text}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>

          {earlyBirdOn && featured && (
            <Reveal delay={0.1} rotate={-8}>
              <div className="relative">
                <Image
                  src="/images/tickets/early-bird.webp"
                  alt={`Early Bird ticket, ${festival.currency} ${featured.price}`}
                  width={1400}
                  height={467}
                  sizes="(min-width: 1024px) 34rem, 92vw"
                  className="w-full -rotate-6 drop-shadow-[14px_18px_0_rgb(0_0_0/0.45)] transition-transform duration-700 ease-[var(--ease-spring)] hover:-rotate-2 hover:scale-[1.03]"
                />
                <span className="absolute -bottom-4 right-6 flex rotate-3 items-center gap-2 rounded-full bg-lime px-4 py-2 text-sm font-bold text-black shadow-[4px_5px_0_rgb(0_0_0/0.5)]">
                  <Icon icon={HourglassIcon} size={16} />
                  {left} day{left === 1 ? '' : 's'} left
                </span>
              </div>
            </Reveal>
          )}
        </div>

        <ul className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((ticket, i) => (
            <li key={ticket.id}>
              <Stub ticket={ticket} index={i} />
            </li>
          ))}
        </ul>

        <Reveal className="mt-12 flex flex-col items-start justify-between gap-6 rounded-[2rem] border-2 border-dashed border-lime/50 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-lime text-black">
              <Icon icon={UserGroupIcon} size={26} />
            </span>
            <div>
              <p className="display text-3xl text-cream">
                Rolling {festival.groupDeal.minimum}+ deep?
              </p>
              <p className="text-cream/75">
                Groups of {festival.groupDeal.minimum} or more get {festival.groupDeal.discount}% off.
              </p>
            </div>
          </div>
          {festival.ticketUrl ? (
            <a href={festival.ticketUrl} target="_blank" rel="noopener noreferrer" className="btn bg-lime text-black shadow-[4px_5px_0_#000]">
              Get tickets <Icon icon={ArrowUpRight01Icon} size={18} />
            </a>
          ) : (
            <a href="#letter" className="btn bg-lime text-black shadow-[4px_5px_0_#000]">
              Ask about group tickets <Icon icon={ArrowUpRight01Icon} size={18} />
            </a>
          )}
        </Reveal>
      </div>
    </section>
  );
}
