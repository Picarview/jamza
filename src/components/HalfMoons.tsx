/**
 * The half-moon motif from the jamza flag banner: stacked semicircles in
 * plum → tomato gradients. Purely decorative.
 */
const palettes = {
  warm: [
    ['#580e79', '#a3283f'],
    ['#c4391a', '#f06a1f'],
    ['#8e1f4f', '#d8461e'],
  ],
  festive: [
    ['#0b5a33', '#00843d'],
    ['#c4391a', '#f06a1f'],
    ['#580e79', '#8e1f4f'],
  ],
} as const;

export function HalfMoons({
  className = '',
  palette = 'warm',
  flip = false,
}: {
  className?: string;
  palette?: keyof typeof palettes;
  flip?: boolean;
}) {
  const colors = palettes[palette];
  const id = `hm-${palette}-${flip ? 'f' : 'n'}`;
  return (
    <svg
      viewBox="0 0 240 120"
      className={className}
      aria-hidden="true"
      style={flip ? { transform: 'scaleY(-1)' } : undefined}
    >
      <defs>
        {colors.map(([a, b], i) => (
          <linearGradient key={i} id={`${id}-${i}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={a} />
            <stop offset="1" stopColor={b} />
          </linearGradient>
        ))}
      </defs>
      {/* Bowl, dome, bowl — like the banner. */}
      <path d="M0 0h80a40 40 0 0 1-80 0Z" fill={`url(#${id}-0)`} />
      <path d="M80 60a40 40 0 0 1 80 0Z" fill={`url(#${id}-1)`} transform="translate(0 0)" />
      <path d="M80 60h80a40 40 0 0 1-80 0Z" fill={`url(#${id}-2)`} />
      <path d="M160 0h80a40 40 0 0 1-80 0Z" fill={`url(#${id}-1)`} />
      <path d="M160 120a40 40 0 0 1 80 0Z" fill={`url(#${id}-0)`} />
      <path d="M0 120a40 40 0 0 1 80 0Z" fill={`url(#${id}-2)`} />
    </svg>
  );
}
