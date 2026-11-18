'use client';

import { useEffect, useState } from 'react';

function remaining(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
    done: ms === 0,
  };
}

/** Live countdown in liquid-glass tiles. Renders placeholders on the server to avoid hydration drift. */
export function Countdown({
  to,
  className = '',
  compact = false,
}: {
  to: string;
  className?: string;
  compact?: boolean;
}) {
  const target = new Date(to).getTime();
  const [time, setTime] = useState<ReturnType<typeof remaining> | null>(null);

  useEffect(() => {
    setTime(remaining(target));
    const id = setInterval(() => setTime(remaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (time?.done) {
    return <p className={`display text-4xl text-gold ${className}`}>It’s festival day!</p>;
  }

  const units = [
    ['days', time?.days],
    ['hrs', time?.hours],
    ['min', time?.minutes],
    ['sec', time?.seconds],
  ] as const;

  if (compact) {
    return (
      <div className={`flex items-end gap-4 sm:gap-5 ${className}`} role="timer" aria-label="Time until the festival">
        {units.map(([label, value]) => (
          <div key={label} className="flex flex-col">
            <span className="headline text-2xl tabular-nums sm:text-3xl" suppressHydrationWarning>
              {value === undefined ? '––' : String(value).padStart(2, '0')}
            </span>
            <span className="eyebrow mt-1 text-[0.6rem] text-cream/55">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex gap-2 sm:gap-3 ${className}`} role="timer" aria-label="Time until the festival">
      {units.map(([label, value]) => (
        <div key={label} className="glass flex min-w-[4.25rem] flex-col items-center rounded-3xl px-3 py-3 sm:min-w-[5.5rem] sm:py-4">
          <span className="headline text-3xl tabular-nums sm:text-5xl" suppressHydrationWarning>
            {value === undefined ? '––' : String(value).padStart(2, '0')}
          </span>
          <span className="eyebrow mt-1 text-[0.65rem] text-lavender">{label}</span>
        </div>
      ))}
    </div>
  );
}
