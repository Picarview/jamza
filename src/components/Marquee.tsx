import { Fragment, type ReactNode } from 'react';

/** Infinite ticker. Content is duplicated once; the second copy is hidden from assistive tech. */
export function Marquee({
  items,
  separator,
  className = '',
  duration = 30,
  reverse = false,
}: {
  items: ReactNode[];
  separator?: ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
}) {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <Fragment key={i}>
          <span className="shrink-0">{item}</span>
          {separator && <span className="shrink-0">{separator}</span>}
        </Fragment>
      ))}
    </div>
  );
  return (
    <div className={`group flex overflow-hidden ${className}`}>
      <div
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
        style={{
          ['--marquee-duration' as string]: `${duration}s`,
          animationDirection: reverse ? 'reverse' : undefined,
        }}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
