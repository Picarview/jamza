import { CakeIcon, DiamondIcon, FlashIcon, NecklaceIcon } from '@hugeicons/core-free-icons';

/**
 * JAMZA! shop — pre-orders, collected on festival day. Prices, photos and the pre-order
 * deadline are still to be confirmed; fill them in here and the page updates.
 */
export const shop = {
  deadline: null as string | null, // TODO: pre-order deadline, e.g. 'Sunday 14 December'
  collection: 'Collect your order at the JAMZA! shop stand on festival day, 19 December.',
};

export const shopProducts = [
  { id: 'cake', name: 'JAMZA! cake', blurb: 'A festive treat, baked for the night.', price: null as number | null, icon: CakeIcon, color: 'bg-tomato' },
  { id: 'bracelet', name: 'JAMZA! bracelet', blurb: 'Wear the festival on your wrist.', price: null as number | null, icon: DiamondIcon, color: 'bg-pine' },
  { id: 'necklace', name: 'JAMZA! necklace', blurb: 'A keepsake from the night.', price: null as number | null, icon: NecklaceIcon, color: 'bg-plum' },
  { id: 'glow-stick', name: 'JAMZA! glow sticks', blurb: 'For the After Party, obviously.', price: null as number | null, icon: FlashIcon, color: 'bg-ember' },
];
