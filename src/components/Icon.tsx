import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';

/** Thin wrapper so every icon on the site shares stroke and sizing defaults. */
export function Icon({
  icon,
  size = 20,
  strokeWidth = 1.8,
  className,
  label,
}: {
  icon: IconSvgElement;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      color="currentColor"
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  );
}
