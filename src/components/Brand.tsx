import { Fragment, type ReactNode } from 'react';

const NAME = /(jamza!?\??)/gi;

/**
 * Sets every "JAMZA" / "JAMZA!" inside a piece of text in the brand display face (Swung Note),
 * wherever it appears — static copy, CMS content, messages.
 */
export function brand(text: string | null | undefined): ReactNode {
  if (!text) return text;
  const parts = text.split(NAME);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 ? (
      <span key={i} className="brand-name">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
