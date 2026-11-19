/**
 * Forms that land in the admin inbox through the existing rate-limited `picarview_submit_message`
 * function: no new tables needed. Each form is defined once here and used by both the page
 * (to render fields) and the server action (to validate and compose the message).
 */
export type Field = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  maxLength?: number;
  autoComplete?: string;
  half?: boolean;
};

export type FormKind = 'shop' | 'merch' | 'shuttle' | 'vendor' | 'sales-team' | 'voucher';

const contact: Field[] = [
  { name: 'name', label: 'Full name', required: true, autoComplete: 'name', maxLength: 100, half: true },
  { name: 'phone', label: 'Phone / WhatsApp', type: 'tel', required: true, autoComplete: 'tel', maxLength: 30, half: true },
  { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email', maxLength: 200 },
];

/** Voucher codes: letters, numbers and dashes. */
export const VOUCHER_PATTERN = /^[A-Z0-9-]{4,24}$/;

export const forms: Record<
  FormKind,
  { title: string; subject: (v: Record<string, string>) => string; fields: Field[]; sent?: string }
> = {
  voucher: {
    title: 'Ticket voucher',
    subject: (v) => `Voucher ${v.code} — ${v.name}`,
    sent: 'Code received! We’ll check it and email your free ticket.',
    fields: [{ name: 'code', label: 'Voucher code', required: true, maxLength: 24 }, ...contact],
  },
  merch: {
    title: 'Merch pre-order',
    subject: (v) => `Merch pre-order — ${v.name}`,
    fields: [...contact, { name: 'notes', label: 'Anything else?', type: 'textarea', maxLength: 1000 }],
  },
  shop: {
    title: 'Shop pre-order',
    subject: (v) => `Shop pre-order — ${v.name}`,
    fields: [
      ...contact,
      { name: 'notes', label: 'Colours, sizes or anything else', type: 'textarea', maxLength: 1000 },
    ],
  },
  shuttle: {
    title: 'Shuttle booking',
    subject: (v) => `Shuttle booking — ${v.seats} seat(s) — ${v.name}`,
    fields: [
      ...contact,
      { name: 'seats', label: 'Seats', type: 'number', required: true, min: 1, max: 10, half: true },
      { name: 'notes', label: 'Anything we should know?', type: 'textarea', maxLength: 1000 },
    ],
  },
  vendor: {
    title: 'Vendor application',
    subject: (v) => `Vendor application — ${v.business}`,
    fields: [
      { name: 'business', label: 'Business or brand name', required: true, maxLength: 120 },
      ...contact.map((f) => (f.name === 'name' ? { ...f, label: 'Contact person' } : f)),
      { name: 'category', label: 'What do you sell?', type: 'select', required: true, options: ['Fashion & accessories', 'Beauty & wellness', 'Art & prints', 'Crafts & homeware', 'Books & stationery', 'Other (not food or drink)'] },
      { name: 'socials', label: 'Instagram or website', maxLength: 200, placeholder: '@yourbrand' },
      { name: 'about', label: 'Tell us about your products', type: 'textarea', required: true, maxLength: 2000 },
    ],
  },
  'sales-team': {
    title: 'Ticket Sales Team',
    subject: (v) => `Ticket Sales Team — ${v.name}`,
    fields: [
      ...contact,
      { name: 'socials', label: 'Social media handles', maxLength: 200, placeholder: 'Optional', half: true },
      { name: 'affiliation', label: 'University, organisation or community', maxLength: 200, placeholder: 'Optional', half: true },
      { name: 'experience', label: 'Any sales or promo experience?', type: 'textarea', maxLength: 1000, placeholder: 'Optional' },
      { name: 'why', label: 'Why do you want to join the team?', type: 'textarea', required: true, maxLength: 1500 },
      { name: 'terms', label: 'I agree to the ticket sales terms: commission is paid only on completed ticket sales tracked to my code.', type: 'checkbox', required: true },
    ],
  },
};
