import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { ShopFront } from '@/components/shop/ShopFront';
import { shop } from '@/content/shop';
import { baseOpenGraph } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Official JAMZA! tees in the festival colours. Pre-order now, collect on festival day.',
  alternates: { canonical: '/shop' },
  openGraph: { ...baseOpenGraph, url: '/shop', title: 'JAMZA! shop — official tees', images: ['/images/shop/tee-purple.webp'] },
};

const steps = [
  ['Pick', 'Choose your items and sizes.'],
  ['Send', 'Send your pre-order — no payment yet.'],
  ['Pay', 'We email you the total and how to pay.'],
  ['Collect', 'Pick it up at the shop stand on 19 December.'],
];

export default function ShopPage() {
  return (
    <>
      <PageHeader tone="tomato" eyebrow="JAMZA! shop" title="Shop the night" intro="Official JAMZA! tees in the festival colours. Pre-order now and skip the queue on festival day.">
        <ol className="mt-10 grid max-w-4xl gap-3 sm:grid-cols-4">
          {steps.map(([title, text], i) => (
            <li key={title} className="glass rounded-[1.5rem] p-4">
              <span className="headline grid size-9 place-items-center rounded-full bg-cream text-plum">{i + 1}</span>
              <span className="display mt-3 block text-2xl">{title}</span>
              <span className="text-sm text-cream/75">{text}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-cream/60">
          {shop.deadline ? `Pre-orders close ${shop.deadline}.` : 'The pre-order deadline will be announced soon.'}
        </p>
      </PageHeader>
      <ShopFront group="shop" note="No payment now — we’ll email you the total and payment details." />
    </>
  );
}
