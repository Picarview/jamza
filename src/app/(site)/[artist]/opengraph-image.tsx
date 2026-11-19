import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { festival } from '@/content/festival';
import { getArtist, getPublicContent } from '@/lib/content';
import { ogAssets, ogSize } from '@/og/assets';

export const alt = 'JAMZA! FESTIVAL 2026 artist';
export const size = ogSize;
export const contentType = 'image/png';
export const revalidate = 60;
export const generateStaticParams = async () => (await getPublicContent()).lineup.map((a) => ({ artist: a.slug }));

/** Prepared JPEG for lineup artists; otherwise an uploaded JPEG/PNG (the share renderer can't read WebP). */
async function photoFor(slug: string, image: string) {
  const local = join(process.cwd(), 'src/og/artists', `${slug}.jpg`);
  if (existsSync(local)) return `data:image/jpeg;base64,${(await readFile(local)).toString('base64')}`;
  if (/^https:\/\/.+\.(jpe?g|png)(\?.*)?$/i.test(image)) return image;
  return null;
}

const bg = { tomato: '#8e1f4f', pine: '#0b5a33', plum: '#430a5e', ember: '#c4391a' } as const;

export default async function OpengraphImage({ params }: { params: Promise<{ artist: string }> }) {
  const artist = await getArtist((await params).artist);
  const { logo, fonts } = await ogAssets();
  if (!artist) {
    return new ImageResponse(<div style={{ display: 'flex', width: '100%', height: '100%', background: '#12031c', alignItems: 'center', justifyContent: 'center' }}><img src={logo} alt="" width={300} height={235} /></div>, { ...size, fonts });
  }
  const photo = await photoFor(artist.slug, artist.image);

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
