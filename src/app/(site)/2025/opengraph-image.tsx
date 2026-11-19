import { ImageResponse } from 'next/og';
import { report2025 as report } from '@/content/report2025';
import { reportCover, ogAssets, ogSize } from '@/og/assets';

export const alt = 'JAMZA! 2025 Event Report — about 102 people, 14 female performers, Beda’s House Band';
export const size = ogSize;
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const [{ logo, fonts }, cover] = await Promise.all([ogAssets(), reportCover()]);

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', fontFamily: 'Epilogue', color: '#fff9f3', background: 'radial-gradient(circle at 80% 20%, #7a1aa3 0%, #430a5e 45%, #12031c 100%)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px', width: 760 }}>
          <img src={logo} alt="" width={120} height={94} />
          <div style={{ display: 'flex', marginTop: 24, fontSize: 24, fontWeight: 700, letterSpacing: 4, color: '#debf83' }}>
            EVENT REPORT
          </div>
          <div style={{ display: 'flex', marginTop: 8, fontFamily: 'Swung', fontSize: 130, lineHeight: 0.95 }}>
            JAMZA<span style={{ color: '#d8461e' }}>!</span>
            <span style={{ marginLeft: 28 }}>2025</span>
          </div>
          <div style={{ display: 'flex', gap: 36, marginTop: 34 }}>
            {report.stats.slice(0, 3).map((s) => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 56, fontWeight: 900, color: '#debf83', lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#e3d1ea', marginTop: 6, maxWidth: 190 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <img
            src={cover}
            alt=""
            width={300}
            height={424}
            style={{ transform: 'rotate(5deg)', borderRadius: 18, border: '8px solid #f7e1c0', boxShadow: '18px 22px 0 rgba(0,0,0,0.45)' }}
          />
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
