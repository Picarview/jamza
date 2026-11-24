import { festival } from '@/content/festival';
import { lineup } from '@/content/lineup';
import { starterPartners } from '@/content/partners';
import { shop, shopProducts } from '@/content/shop';
import { shuttle } from '@/content/visit';
import { vendors } from '@/content/join';
import type { Db } from './types';

const ago = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

/** Demo data: real festival content plus a few clearly-labelled sample submissions. */
export function seed(): Db {
  return {
    messages: [
      { id: 'm1', kind: 'voucher', name: 'Sample Guest', email: 'guest@example.com', subject: 'Voucher JAMZA-GIFT-01 — Sample Guest', body: '[Ticket voucher]\n\nVoucher code: JAMZA-GIFT-01\nFull name: Sample Guest\nPhone / WhatsApp: 020 000 0000', date: ago(2), status: 'new' },
      { id: 'm2', kind: 'shop', name: 'Sample Buyer', email: 'buyer@example.com', subject: 'Shop pre-order — Sample Buyer', body: '[Shop pre-order]\n\nItems:\n• 2 × Caxixi — GHC 160\nTotal: GHC 160\n\nFull name: Sample Buyer\nPhone / WhatsApp: 020 000 0001', date: ago(5), status: 'new' },
      { id: 'm7', kind: 'merch', name: 'Sample Raver', email: 'raver@example.com', subject: 'Merch pre-order — Sample Raver', body: '[Merch pre-order]\n\nItems:\n• 4 × JAMZA! glow sticks\n• 1 × JAMZA! bracelet\n\nFull name: Sample Raver', date: ago(8), status: 'new' },
      { id: 'm3', kind: 'vendor', name: 'Sample Studio', email: 'studio@example.com', subject: 'Vendor application — Sample Studio', body: '[Vendor application]\n\nBusiness or brand name: Sample Studio\nWhat do you sell?: Art & prints\nTell us about your products: Hand-printed posters and tote bags.', date: ago(26), status: 'read' },
      { id: 'm4', kind: 'sales-team', name: 'Sample Student', email: 'student@example.com', subject: 'Ticket Sales Team — Sample Student', body: '[Ticket Sales Team]\n\nUniversity, organisation or community: Sample University\nWhy do you want to join the team?: I love JAMZA! and know lots of people who would come.', date: ago(30), status: 'new' },
      { id: 'm5', kind: 'shuttle', name: 'Sample Rider', email: 'rider@example.com', subject: 'Shuttle booking — 3 seat(s) — Sample Rider', body: '[Shuttle booking]\n\nSeats: 3\nPhone / WhatsApp: 020 000 0002', date: ago(50), status: 'done' },
      { id: 'm6', kind: 'letter', name: 'Sample Fan', email: 'fan@example.com', subject: 'Just saying hi', body: 'Can’t wait for the After Party!', date: ago(72), status: 'read' },
    ],
    vouchers: [
      { id: 'v1', code: 'JAMZA-GIFT-01', note: 'Giveaway winner', maxUses: 1, uses: 0, active: true, expiresAt: '2026-12-18', price: '', createdAt: ago(48) },
      { id: 'v2', code: 'PRESS-2026', note: 'Press & media', maxUses: 10, uses: 3, active: true, expiresAt: '2026-12-19', price: '', createdAt: ago(96) },
      { id: 'v3', code: 'ARTIST-PLUS1', note: 'Artist guests', maxUses: 20, uses: 20, active: false, expiresAt: '', price: '', createdAt: ago(120) },
    ],
    products: shopProducts.map((p, i) => ({
      id: p.id,
      name: p.name,
      group: p.group,
      price: p.price === null ? '' : String(p.price),
      image: p.image ?? '',
      sizes: p.sizes?.join(', ') ?? '',
      blurb: p.blurb,
      visible: true,
      sort: i + 1,
    })),
    artists: lineup.map((a) => ({
      id: a.id,
      slug: a.slug,
      name: a.name,
      role: a.role,
      tier: a.tier,
      handle: a.handle,
      image: a.image,
      bio: a.bio.join('\n\n'),
      visible: true,
    })),
    partners: starterPartners.map((p) => ({ id: p.id, name: p.name, image: p.image ?? '', url: p.url, tagline: p.tagline, visible: true })),
    settings: {
      ticketUrl: festival.ticketUrl ?? '',
      email: festival.email,
      instagram: festival.instagram.url,
      communityPrice: '',
      shopDeadline: shop.deadline ?? '',
      shuttleDeparture: shuttle.departure ?? '',
      shuttleReturn: shuttle.return ?? '',
      vendorDeadline: vendors.deadline.slice(0, 10),
    },
  };
}
