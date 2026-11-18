import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Every path is a string literal so build tracing includes just these files.
const toDataUri = (buf: Buffer, type: string) => `data:${type};base64,${buf.toString('base64')}`;

/** Fonts and images for next/og (Satori needs TTF/OTF and PNG/JPEG). */
export async function ogAssets() {
  const [swung, epilogueBold, epilogueBlack, logo] = await Promise.all([
    readFile(join(process.cwd(), 'src/fonts/SwungNote.ttf')),
    readFile(join(process.cwd(), 'src/fonts/Epilogue-Bold.ttf')),
    readFile(join(process.cwd(), 'src/fonts/Epilogue-Black.ttf')),
    readFile(join(process.cwd(), 'public/images/logo-main.png')),
  ]);
  return {
    logo: toDataUri(logo, 'image/png'),
    fonts: [
      { name: 'Swung', data: swung, weight: 400 as const, style: 'normal' as const },
      { name: 'Epilogue', data: epilogueBold, weight: 700 as const, style: 'normal' as const },
      { name: 'Epilogue', data: epilogueBlack, weight: 900 as const, style: 'normal' as const },
    ],
  };
}

export const heroPhoto = async () =>
  toDataUri(await readFile(join(process.cwd(), 'public/images/festival/hero-singer.jpg')), 'image/jpeg');

export const reportCover = async () =>
  toDataUri(await readFile(join(process.cwd(), 'src/og/report-cover.jpg')), 'image/jpeg');

export const ogSize = { width: 1200, height: 630 };
