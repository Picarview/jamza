import { $, el, safeUrl } from '../lib/dom.js';

const PLACEHOLDER = '/images/placeholder.svg';
const collections = {
  artists: { title: 'All artists', className: 'artists', limit: 3, search: 'Search artists…' },
  posts: { title: 'Announcements & Blogs', className: 'posts', limit: 3, search: 'Search announcements and blogs…' },
  partners: { title: 'All partners', className: 'partners', limit: 4, search: 'Search partners…' },
};
let content = null, activeCollection = 'artists';

function photo(src, alt) {
  const image = el('img');
  image.src = safeUrl(src, true) || PLACEHOLDER;
  image.alt = alt;
  image.loading = 'lazy';
  image.addEventListener('error', () => { image.src = PLACEHOLDER; }, { once: true });
  return image;
}

function artistCard(artist) {
  const card = el('article', 'artist'), portrait = el('div', 'portrait');
  const info = el('div', 'artist-info'), copy = el('div');
  portrait.append(photo(artist.image, artist.name));
  copy.append(el('h3', '', artist.name), el('p', '', artist.role));
  const mark = el('span', 'artist-mark', '✳');
  mark.setAttribute('aria-hidden', 'true');
  info.append(copy, mark);
  card.append(portrait, info);
  return card;
}

function postCard(post) {
  const card = el('article', 'post'), read = el('button', 'read-story', 'Read story ↗');
  read.type = 'button';
  read.setAttribute('aria-label', 'Read ' + post.title);
  read.onclick = () => {
    $('#article-title').textContent = post.title;
    $('#article-body').textContent = post.body;
    $('#article-dialog').showModal();
  };
  card.append(
    photo(post.image, post.title + ' — cover image'),
    el('div', 'post-meta', post.category + ' / ' + post.date),
    el('h3', '', post.title), el('p', '', post.excerpt), read,
  );
  return card;
}

function partnerCard(partner) {
  const url = safeUrl(partner.url), card = el(url ? 'a' : 'article', 'partner');
  if (url) { card.href = url; card.target = '_blank'; card.rel = 'noopener noreferrer'; }
  const logo = el('div', 'partner-logo');
  if (partner.image) logo.append(photo(partner.image, partner.name + ' logo'));
  else {
    const initials = partner.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
    const monogram = el('span', 'partner-monogram', initials);
    monogram.setAttribute('aria-hidden', 'true');
    logo.append(monogram);
  }
  card.append(logo, el('span', 'partner-name', partner.name));
  if (url) card.append(el('span', 'partner-visit', 'Visit website ↗'));
  return card;
}

const createCard = { artists: artistCard, posts: postCard, partners: partnerCard };
function records(type) {
  return type === 'posts'
    ? content.posts.filter((post) => post.status === 'Published').sort((a, b) => b.date.localeCompare(a.date))
    : content[type];
}

function renderCollection() {
  const type = activeCollection, config = collections[type], all = records(type);
  const query = $('#collection-search').value.trim().toLocaleLowerCase();
  const matches = all.filter((record) => [record.name, record.role, record.title, record.category, record.excerpt].filter(Boolean).join(' ').toLocaleLowerCase().includes(query));
  const grid = $('#collection-grid');
  grid.className = 'collection-results ' + config.className;
  grid.replaceChildren(...matches.map(createCard[type]));
  $('#collection-count').textContent = `Showing ${matches.length} of ${all.length}`;
  if (!matches.length) grid.append(el('p', 'empty', query ? 'No matches. Try a different search.' : 'New additions will appear here.'));
}

function openCollection(type) {
  activeCollection = type;
  $('#collection-title').textContent = collections[type].title;
  $('#collection-search').placeholder = collections[type].search;
  $('#collection-search').value = '';
  renderCollection();
  $('#collection-dialog').showModal();
  $('#collection-search').focus();
}

export function renderSite(data) {
  content = data;
  document.title = data.settings.title + ' — A different perspective.';
  document.querySelectorAll('.site-brand').forEach((brand) => {
    brand.replaceChildren(document.createTextNode(data.settings.title), el('span', '', '✳'));
    brand.setAttribute('aria-label', data.settings.title + ' home');
  });
  $('#footer-title').textContent = data.settings.title;
  $('#year').textContent = new Date().getFullYear();
  $('#contact-email').textContent = data.settings.email + ' ↗';
  $('#contact-email').href = 'mailto:' + encodeURIComponent(data.settings.email);

  for (const [type, selector] of [['artists', '#artist-grid'], ['posts', '#post-grid'], ['partners', '#partner-grid']]) {
    const grid = $(selector), items = records(type);
    grid.replaceChildren(...items.slice(0, collections[type].limit).map(createCard[type]));
    if (!items.length) grid.append(el('p', 'empty', type === 'artists' ? 'New voices are on the way.' : type === 'posts' ? 'Fresh stories are coming soon.' : 'New partners will appear here.'));
    $('#view-all-' + type).onclick = () => openCollection(type);
  }
  $('#collection-search').oninput = renderCollection;
  $('#collection-dialog .close').onclick = () => $('#collection-dialog').close();
  if ($('#collection-dialog').open) renderCollection();

  const socials = $('#socials');
  socials.replaceChildren();
  for (const key of ['instagram', 'linkedin']) {
    const url = safeUrl(data.settings[key]);
    if (url) {
      const link = el('a', '', key[0].toUpperCase() + key.slice(1) + ' ↗');
      link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      socials.append(link);
    }
  }
}
