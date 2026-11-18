import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JAMZA! FESTIVAL 2026',
    short_name: 'JAMZA!',
    description: 'A festive music experience celebrating women in the arts. Sat 19 Dec 2026, Accra.',
    start_url: '/',
    display: 'standalone',
    background_color: '#12031c',
    theme_color: '#580e79',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
