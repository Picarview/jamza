import localFont from 'next/font/local';

export const swung = localFont({
  src: '../fonts/SwungNote.ttf',
  variable: '--font-swung',
  display: 'swap',
});

export const epilogue = localFont({
  src: [
    { path: '../fonts/Epilogue-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/Epilogue-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../fonts/Epilogue-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../fonts/Epilogue-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../fonts/Epilogue-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../fonts/Epilogue-ExtraBold.ttf', weight: '800', style: 'normal' },
    { path: '../fonts/Epilogue-Black.ttf', weight: '900', style: 'normal' },
  ],
  variable: '--font-epilogue',
  display: 'swap',
});
