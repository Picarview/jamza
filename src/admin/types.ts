/**
 * Admin data model. These shapes mirror the Supabase tables the admin will use once connected,
 * so swapping the demo backend for Supabase doesn't touch any screen.
 */
export type InboxKind = 'letter' | 'shop' | 'merch' | 'shuttle' | 'vendor' | 'sales-team' | 'voucher';
export type InboxStatus = 'new' | 'read' | 'done';

export type Message = {
  id: string;
  kind: InboxKind;
  name: string;
  email: string;
  subject: string;
  body: string;
  date: string; // ISO
  status: InboxStatus;
};

export type Voucher = {
  id: string;
  code: string;
  note: string; // who/what it's for
  maxUses: number;
  uses: number;
  active: boolean;
  expiresAt: string; // yyyy-mm-dd or ''
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  group: 'shop' | 'merch';
  price: string; // GHS, '' = price soon
  image: string;
  sizes: string; // comma separated
  blurb: string;
  visible: boolean;
  sort: number; // display order, lowest first
};

export type Artist = {
  id: string;
  slug: string;
  name: string;
  role: string;
  tier: 'main' | 'guest';
  handle: string;
  image: string;
  bio: string;
  visible: boolean;
};

export type Partner = {
  id: string;
  name: string;
  image: string;
  url: string;
  tagline: string;
  visible: boolean;
};

export type Settings = {
  ticketUrl: string;
  email: string;
  instagram: string;
  communityPrice: string;
  shopDeadline: string;
  shuttleDeparture: string;
  shuttleReturn: string;
  vendorDeadline: string;
};

export type Db = {
  messages: Message[];
  vouchers: Voucher[];
  products: Product[];
  artists: Artist[];
  partners: Partner[];
  settings: Settings;
};

export type CollectionKey = Exclude<keyof Db, 'settings'>;
export type Row<K extends CollectionKey> = Db[K][number];
