import { ImageResponse } from 'next/og';
import { festival } from '@/content/festival';
import { heroPhoto, ogAssets, ogSize } from '@/og/assets';

export const alt = 'JAMZA! FESTIVAL 2026 — Saturday 19 December, 12PM–5AM, Beda’s, Old Ashongman, Accra';
export const size = ogSize;
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const [{ logo, fonts }, photo] = await Promise.all([ogAssets(), heroPhoto()]);
  const from = Math.min(...festival.tickets.flatMap((t) => (t.price === null ? [] : [t.price])));

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#12031c', fontFamily: 'Epilogue', color: '#fff9f3' }}>
        {/* Stage photo, melting into the dark on the left */}
        <img src={photo} alt="" width={760} height={630} style={{ position: 'absolute', right: 0, top: 0, width: 760, height: 630, objectFit: 'cover', objectPosition: '50% 15%' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, display: 'flex', background: 'linear-gradient(90deg, #12031c 0%, #12031c 36%, rgba(18,3,28,0.85) 46%, rgba(18,3,28,0.35) 64%, rgba(18,3,28,0) 85%)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, display: 'flex', background: 'linear-gradient(90deg, #f06a1f, #00843d, #7a1aa3)' }} />

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px', width: 720 }}>
          <img src={logo} alt="" width={150} height={118} style={{ transform: 'rotate(-4deg)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 26, fontFamily: 'Swung', fontSize: 104, lineHeight: 0.92 }}>
            <span style={{ display: 'flex' }}>
              JAMZA<span style={{ color: '#d8461e' }}>!</span>
            </span>
            <span>FESTIVAL</span>
          </div>
          <div style={{ display: 'flex', marginTop: 26, fontSize: 34, fontWeight: 900, color: '#debf83', letterSpacing: -0.5 }}>
            Sat 19 Dec 2026 · {festival.hours}
          </div>
          <div style={{ display: 'flex', marginTop: 8, fontSize: 26, fontWeight: 700, color: '#e3d1ea' }}>
            Beda’s, {festival.city}
          </div>
          <div style={{ display: 'flex', marginTop: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#d6d045', color: '#000', borderRadius: 999, padding: '12px 26px', fontSize: 26, fontWeight: 900 }}>
              Tickets from {festival.currency} {from}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
