import type { InboxKind } from './types';

export const kindMeta: Record<InboxKind, { label: string; tone: 'plum' | 'green' | 'red' | 'gold' | 'grey' }> = {
  letter: { label: 'Letter', tone: 'plum' },
  shop: { label: 'Shop order', tone: 'red' },
  merch: { label: 'Merch order', tone: 'red' },
  shuttle: { label: 'Shuttle', tone: 'green' },
  vendor: { label: 'Vendor', tone: 'gold' },
  'sales-team': { label: 'Sales team', tone: 'green' },
  voucher: { label: 'Voucher', tone: 'gold' },
};

export const ago = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};
