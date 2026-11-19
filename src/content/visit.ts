import { festival } from './festival';

export const shuttle = {
  fare: 30, // GHS, round trip
  pickup: 'Accra Mall',
  departure: null as string | null, // TODO: departure time, e.g. '11:00am'
  return: null as string | null, // TODO: return departure time
};

export const bedasHotel = {
  name: 'Beda’s Hotel',
  blurb: 'Stay steps from the stage at the festival venue in Old Ashongman. Bookings go straight through Beda’s.',
  url: 'https://bedasassociation.com',
};

/** Only answers we actually know. Add more as details are confirmed. */
export const faqs = [
  { q: 'What does my ticket cover?', a: festival.allAccess },
  {
    q: 'Can I come for just one part?',
    a: 'Yes. Every ticket covers the whole day and night, so come for the part you love or stay from 12pm to 5am.',
  },
  { q: 'How do student tickets work?', a: 'Student tickets are GHS 55 and on sale until 18 December.' },
  { q: 'How do group discounts work?', a: 'Groups of 4 or more get 5% off, from 26 November.' },
  { q: 'Can I buy tickets at the gate?', a: 'Yes — gate tickets are GHS 120, on 19 December only.' },
  {
    q: 'Where does the shuttle leave from?',
    a: `Accra Mall. The GHS ${shuttle.fare} fare covers the trip to Beda’s and the ride back to Accra Mall.`,
  },
  { q: 'How do I book Beda’s Hotel?', a: 'Directly on the Beda’s website — bedasassociation.com.' },
  { q: 'Can food and drink vendors apply?', a: 'Not this year — the marketplace is for non-food creatives and businesses.' },
];
