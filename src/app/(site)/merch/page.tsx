import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { ShopFront } from '@/components/shop/ShopFront';
import { shop } from '@/content/shop';
import { getPublicContent } from '@/lib/content';
import { baseOpenGraph } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Festival merch',
  description: 'Pre-order JAMZA! cakes, bracelets, necklaces and glow sticks, and collect them on festival day.',
  alternates: { canonical: '/merch' },
  openGraph: { ...baseOpenGraph, url: '/merch', title: 'JAMZA! festival merch — pre-order now' },
};

export default async function MerchPage() {
  const { products, settings } = await getPublicContent();
  return (
    <>
      <PageHeader
        tone="pine"
        eyebrow="JAMZA! FESTIVAL 2026 · Merch"
        title="Festival merch"
        intro="Cakes, bracelets, necklaces and glow sticks for the night. Pre-order now and pick them up on 19 December."
      >
        <ul className="mt-10 flex flex-wrap gap-3">
          {products
            .filter((p) => p.group === 'merch')
            .map((p) => (
              <li key={p.id} className="glass flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 font-semibold">
                <span className={`grid size-9 place-items-center rounded-full text-cream ${p.color}`}>{p.icon && <Icon icon={p.icon} size={18} />}</span>
                {p.name.replace('JAMZA! ', '').replace(/^./, (c) => c.toUpperCase())}
              </li>
            ))}
        </ul>
        <p className="mt-6 text-sm text-cream/60">
          {settings.shopDeadline ? `Pre-orders close ${settings.shopDeadline}. ` : 'The pre-order deadline will be announced soon. '}
          {shop.collection}
        </p>
      </PageHeader>
      <ShopFront group="merch" products={products} note="No payment now — we’ll email you the total and payment details." />
    </>
  );
}
