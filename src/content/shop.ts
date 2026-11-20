import { CakeIcon, DiamondIcon, FlashIcon, NecklaceIcon } from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';

/**
 * Everything is a pre-order collected on festival day. The pre-order deadline is still to be
 * confirmed; set it here (or in Settings once those go live) and the page updates.
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

// T-shirts are on hold (not in the 2026 merch plan). Uncomment to bring them back.
// const teeSizes = ['S', 'M', 'L', 'XL', 'XXL'];

/**
 * Shop and merch items are managed in the admin panel (jamza_products); this list is only the
 * fallback if the database can't be reached. Icons here are used for merch items without a photo.
 */
export const shopProducts: Product[] = [
  // The JAMZA! shop
  {
    id: 'caxixi',
    name: 'Caxixi',
    blurb: 'A woven basket shaker. Bring your own rhythm to the Concert.',
    price: 80,
    group: 'shop',
    image: '/images/shop/caxixi.webp',
    color: 'bg-ember',
  },
  {
    id: 'glow-stick',
    name: 'JAMZA! glow sticks',
    blurb: 'For the After Party, obviously.',
    price: 5,
    group: 'shop',
    image: '/images/shop/glow-sticks.webp',
    icon: FlashIcon,
    color: 'bg-plum',
  },
  // {
  //   id: 'tee-purple',
  //   name: 'JAMZA! tee — Purple',
  //   blurb: 'Deep purple with the cream JAMZA! mark and half-moon hem.',
  //   price: null,
  //   group: 'shop',
  //   image: '/images/shop/tee-purple.webp',
  //   color: 'bg-plum',
  //   sizes: teeSizes,
  // },
  // {
  //   id: 'tee-cream',
  //   name: 'JAMZA! tee — Cream',
  //   blurb: 'Soft cream fading to lilac, with the purple JAMZA! mark.',
  //   price: null,
  //   group: 'shop',
  //   image: '/images/shop/tee-cream.webp',
  //   color: 'bg-peach',
  //   sizes: teeSizes,
  // },
  // Festival merch: for the day itself.
  { id: 'cake', name: 'JAMZA! cake', blurb: 'A festive treat, baked for the night.', price: null, group: 'merch', icon: CakeIcon, color: 'bg-tomato' },
  { id: 'bracelet', name: 'JAMZA! bracelet', blurb: 'Wear the festival on your wrist.', price: null, group: 'merch', icon: DiamondIcon, color: 'bg-pine' },
  { id: 'necklace', name: 'JAMZA! necklace', blurb: 'A keepsake from the night.', price: null, group: 'merch', icon: NecklaceIcon, color: 'bg-plum' },
];
