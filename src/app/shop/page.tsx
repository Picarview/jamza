import type { Metadata } from 'next';
import { FormCard } from '@/components/FormCard';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { Reveal } from '@/components/Reveal';
import { Basket } from '@/components/shop/Basket';
import { shop, shopProducts } from '@/content/shop';
import { baseOpenGraph } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Pre-order JAMZA! cakes, bracelets, necklaces and glow sticks, and collect them on festival day.',
  alternates: { canonical: '/shop' },
  openGraph: { ...baseOpenGraph, url: '/shop', title: 'JAMZA! shop — pre-order your merch' },
};

const steps = [
  ['Pick', 'Choose your merch and how many.'],
  ['Send', 'Pop in your details and send your pre-order.'],
  ['Pay', 'We email you the total and how to pay.'],
  ['Collect', shop.collection],
];

export default function ShopPage() {
  return (
    <>
      <PageHeader
        tone="tomato"
        eyebrow="JAMZA! shop"
        title="Shop the night"
        intro="Pre-order JAMZA! merch now and skip the queue on festival day."
      >
        <ul className="mt-10 flex flex-wrap gap-3">
          {shopProducts.map((p) => (
            <li key={p.id} className="glass flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 font-semibold">
              <span className={`grid size-9 place-items-center rounded-full text-cream ${p.color}`}>
                <Icon icon={p.icon} size={18} />
              </span>
              {p.name.replace('JAMZA! ', '').replace(/^./, (c) => c.toUpperCase())}
            </li>
          ))}
        </ul>
      </PageHeader>

      <section className="bg-night py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr]">
          <Reveal className="lg:sticky lg:top-28">
            <h2 className="display text-5xl">How it works</h2>
            <ol className="mt-8 space-y-6">
              {steps.map(([title, text], i) => (
                <li key={title} className="flex gap-4">
                  <span className="headline grid size-11 shrink-0 place-items-center rounded-full bg-cream text-lg text-plum">{i + 1}</span>
                  <span>
                    <span className="display block text-2xl">{title}</span>
                    <span className="text-cream/75">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-sm text-cream/55">
              {shop.deadline ? `Pre-orders close ${shop.deadline}.` : 'The pre-order deadline will be announced soon.'}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <FormCard kind="shop" submitLabel="Send pre-order" before={<Basket />} note="No payment now — we’ll email you the total and payment details." />
          </Reveal>
        </div>
      </section>
    </>
  );
}
