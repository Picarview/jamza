import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight01Icon,
  InstagramIcon,
  Linkedin01Icon,
  Mail01Icon,
} from '@hugeicons/core-free-icons';
import { festival } from '@/content/festival';
import { safeUrl } from '@/lib/safe-url';
import type { Settings } from '@/lib/types';
import { HalfMoons } from './HalfMoons';
import { Icon } from './Icon';
import { brand } from './Brand';

export function Footer({ settings }: { settings: Settings }) {
  const socials = [
    { label: 'Instagram', url: safeUrl(settings.instagram) || festival.instagram.url, icon: InstagramIcon },
    { label: 'LinkedIn', url: safeUrl(settings.linkedin), icon: Linkedin01Icon },
  ].filter((s) => s.url);

  return (
    <footer className="relative overflow-hidden bg-cream text-plum">
      <HalfMoons className="absolute -right-10 top-0 w-72 opacity-90 sm:w-96" />
      <HalfMoons className="absolute -left-16 bottom-0 w-64 opacity-90 sm:w-80" flip />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6">
        <p className="eyebrow text-tomato">See you on the dancefloor</p>
        <Link href="/#tickets" className="group mt-4 block w-fit">
          <span className="display block text-[clamp(3.5rem,13vw,11rem)] uppercase transition-colors group-hover:text-pine">
            {festival.shortDate}
          </span>
          <span className="headline mt-2 flex items-center gap-2 text-xl sm:text-2xl">
            {brand(festival.name)} {festival.edition}
            <Icon
              icon={ArrowUpRight01Icon}
              size={28}
              className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
            />
          </span>
        </Link>

        <div className="mt-20 flex flex-col gap-10 border-t-2 border-plum/15 pt-10 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-5">
            <Image
              src="/images/logo-main.png"
              alt="JAMZA!"
              width={994}
              height={780}
              className="h-24 w-auto -rotate-6 transition-transform duration-500 hover:rotate-3 hover:scale-110"
            />
            <p className="max-w-xs text-sm text-plum/75">
              © {new Date().getFullYear()} {brand(settings.title)}. A different perspective.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/2025"
              className="flex items-center gap-2 rounded-full border-2 border-plum/20 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-plum hover:text-cream"
            >
              {brand('JAMZA!')} 2025 report
            </Link>
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-2 rounded-full border-2 border-plum/20 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-plum hover:text-cream"
            >
              <Icon icon={Mail01Icon} size={18} />
              {settings.email}
            </a>
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid size-11 place-items-center rounded-full border-2 border-plum/20 transition-colors hover:bg-plum hover:text-cream"
              >
                <Icon icon={s.icon} size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
