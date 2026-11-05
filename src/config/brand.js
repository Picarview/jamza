import { defaults } from './defaults.js';

/** Keep an existing database's original demo settings from restoring the old brand. */
export function normalizeBrandSettings(settings) {
  return {
    ...settings,
    title:
      settings.title?.trim().toLowerCase() === 'picarview'
        ? defaults.settings.title
        : settings.title,
    email:
      settings.email?.trim().toLowerCase() === 'hello@picarview.com'
        ? defaults.settings.email
        : settings.email,
  };
}

export function normalizeSamplePost(post) {
  if (
    post.id === 'p1' &&
    post.excerpt === 'An introduction to the ideas and people at the heart of picarview.'
  ) {
    return { ...post, excerpt: 'An introduction to the ideas and people at the heart of jamza.' };
  }
  return post;
}
