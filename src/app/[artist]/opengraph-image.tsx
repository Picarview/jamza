import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { festival } from '@/content/festival';
import { artistBySlug, lineup } from '@/content/lineup';
import { ogAssets, ogSize } from '@/og/assets';

export const alt = 'JAMZA! FESTIVAL 2026 artist';
export const size = ogSize;
export const contentType = 'image/png';
export const dynamicParams = false;
export const generateStaticParams = () => lineup.map((a) => ({ artist: a.slug }));

const bg = { tomato: '#8e1f4f', pine: '#0b5a33', plum: '#430a5e', ember: '#c4391a' } as const;

export default async function OpengraphImage({ params }: { params: Promise<{ artist: string }> }) {
  const artist = artistBySlug((await params).artist)!;
  const { logo, fonts } = await ogAssets();
  const photo = artist.image
    ? `data:image/jpeg;base64,${(await readFile(join(process.cwd(), 'src/og/artists', `${artist.slug}.jpg`))).toString('base64')}`
    : null;

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', fontFamily: 'Epilogue', color: '#fff9f3', background: `linear-gradient(135deg, ${bg[artist.accent]} 0%, #12031c 100%)` }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 60px', width: photo ? 700 : 1200 }}>
          <img src={logo} alt="" width={110} height={86} />
          <div style={{ display: 'flex', marginTop: 22, fontSize: 22, fontWeight: 700, letterSpacing: 4, color: '#debf83' }}>
            {artist.tier === 'main' ? 'MAIN ARTIST' : 'SPECIAL GUEST'}
          </div>
          <div style={{ display: 'flex', marginTop: 6, fontFamily: 'Swung', fontSize: artist.name.length > 16 ? 72 : 112, lineHeight: 0.95 }}>
            {artist.name}
          </div>
          <div style={{ display: 'flex', marginTop: 16, fontSize: 28, fontWeight: 700, color: '#e3d1ea' }}>{artist.role}</div>
          <div style={{ display: 'flex', marginTop: 34, fontSize: 28, fontWeight: 900, color: '#debf83' }}>
            JAMZA! FESTIVAL · Sat 19 Dec 2026 · {festival.hours}
          </div>
        </div>
        {photo && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <img
              src={photo}
              alt=""
              width={360}
              height={450}
              style={{ objectFit: 'cover', transform: 'rotate(4deg)', borderRadius: 24, border: '10px solid #f7e1c0', boxShadow: '18px 22px 0 rgba(0,0,0,0.45)' }}
            />
          </div>
        )}
      </div>
    ),
    { ...size, fonts },
  );
}
