import { CakeIcon, DiamondIcon, FlashIcon, NecklaceIcon } from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';

/**
 * Everything is a pre-order collected on festival day. Prices, photos and the pre-order
 * deadline are still to be confirmed; fill them in here and the page updates.
 */
export const shop = {
  deadline: null as string | null, // TODO: pre-order deadline, e.g. 'Sunday 14 December'
  collection: 'Collect your order at the JAMZA! shop stand on festival day, 19 December.',
};

export type Product = {
  id: string;
  name: string;
  blurb: string;
  price: number | null; // GHS; null = price coming soon
  group: 'shop' | 'merch';
  image?: string; // photo (shop items)
  icon?: IconSvgElement; // fallback tile (festival merch without photos yet)
  color: string; // tile / accent colour
  sizes?: string[];
};

const teeSizes = ['S', 'M', 'L', 'XL', 'XXL'];

export const shopProducts: Product[] = [
  // The JAMZA! shop: apparel you keep wearing after the night.
  {
    id: 'tee-purple',
    name: 'JAMZA! tee — Purple',
    blurb: 'Deep purple with the cream JAMZA! mark and half-moon hem.',
    price: null,
    group: 'shop',
    image: '/images/shop/tee-purple.webp',
    color: 'bg-plum',
    sizes: teeSizes,
  },
  {
    id: 'tee-cream',
    name: 'JAMZA! tee — Cream',
    blurb: 'Soft cream fading to lilac, with the purple JAMZA! mark.',
    price: null,
    group: 'shop',
    image: '/images/shop/tee-cream.webp',
    color: 'bg-peach',
    sizes: teeSizes,
  },
  // Festival merch: for the day itself.
  { id: 'cake', name: 'JAMZA! cake', blurb: 'A festive treat, baked for the night.', price: null, group: 'merch', icon: CakeIcon, color: 'bg-tomato' },
  { id: 'bracelet', name: 'JAMZA! bracelet', blurb: 'Wear the festival on your wrist.', price: null, group: 'merch', icon: DiamondIcon, color: 'bg-pine' },
  { id: 'necklace', name: 'JAMZA! necklace', blurb: 'A keepsake from the night.', price: null, group: 'merch', icon: NecklaceIcon, color: 'bg-plum' },
  { id: 'glow-stick', name: 'JAMZA! glow sticks', blurb: 'For the After Party, obviously.', price: null, group: 'merch', icon: FlashIcon, color: 'bg-ember' },
];
