export const $ = (selector) => document.querySelector(selector);
export function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}
export function safeUrl(v, image = false) {
  try {
    const u = new URL(v);
    return ['https:', 'http:'].includes(u.protocol) ||
      (image && /^data:image\/(png|jpeg|webp);base64,/.test(v))
      ? v
      : '';
  } catch {
    return '';
  }
}
