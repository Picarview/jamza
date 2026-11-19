import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { ShopFront } from '@/components/shop/ShopFront';
import { shop } from '@/content/shop';
import { getPublicContent } from '@/lib/content';
import { baseOpenGraph } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Caxixi shakers, glow sticks and more from the JAMZA! shop. Pre-order now, collect on festival day.',
  alternates: { canonical: '/shop' },
  openGraph: { ...baseOpenGraph, url: '/shop', title: 'JAMZA! shop', images: ['/images/shop/caxixi.webp'] },
};

// Shop items are managed in the admin; saving there refreshes this page straight away, and this
// is the safety net.
export const revalidate = 60;

const steps = [
  ['Pick', 'Choose your items.'],
  ['Send', 'Send your pre-order — no payment yet.'],
  ['Pay', 'We email you the total and how to pay.'],
  ['Collect', 'Pick it up at the shop stand on 19 December.'],
];

export default async function ShopPage() {
  const { products, settings } = await getPublicContent();
  return (
    <>
      <PageHeader tone="tomato" eyebrow="JAMZA! shop" title="Shop the night" intro="Shakers, glow sticks and more for the night. Pre-order now and skip the queue on festival day.">
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
          {settings.shopDeadline ? `Pre-orders close ${settings.shopDeadline}.` : 'The pre-order deadline will be announced soon.'}
        </p>
      </PageHeader>
      <ShopFront group="shop" products={products} note="No payment now — we’ll email you the total and payment details." />
    </>
  );
}
