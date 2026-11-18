import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/site.css';
import { $ } from '../lib/dom.js';
import { defaults } from '../config/defaults.js';
import { createAppClient } from '../lib/supabase.js';
import { getPublicContent } from '../services/content.js';
import { submitContact } from '../services/messages.js';
import { renderSite } from './render.js';
const db = createAppClient();
let loading = false;
async function loadContent() {
  if (loading) return;
  loading = true;
  try {
    const content = await getPublicContent(db);
    renderSite(content);
    $('#content-status').hidden = true;
  } catch (error) {
    $('#content-status').hidden = false;
    $('#content-status-text').textContent =
      'Our latest content is temporarily unavailable. Please try again shortly.';
    console.warn('Public content load failed:', error.message);
  } finally {
    loading = false;
  }
}
$('.menu').onclick = () => {
  const open = $('#navigation').classList.toggle('open');
  $('.menu').setAttribute('aria-expanded', String(open));
};
$('#navigation').addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    $('#navigation').classList.remove('open');
    $('.menu').setAttribute('aria-expanded', 'false');
  }
});
$('#article-dialog .close').onclick = () => $('#article-dialog').close();

$('#contact-form').onsubmit = async (event) => {
  event.preventDefault();
  const form = event.currentTarget,
    button = form.querySelector('[type=submit]');
  if (button.disabled) return;
  const values = Object.fromEntries(new FormData(form));
  if (values.website?.trim()) return;
  delete values.website;
  button.disabled = true;
  $('#form-status').textContent = 'Sending your message…';
  try {
    await submitContact(db, values);
    form.reset();
    $('#form-status').textContent = 'Thank you! Your message has been sent to the team.';
  } catch (error) {
    $('#form-status').textContent = error.message?.includes('Too many')
      ? 'Too many messages. Please wait 15 minutes before trying again.'
      : 'Your message could not be sent. Please try again or email us directly.';
  } finally {
    button.disabled = false;
  }
};
const updates =
  typeof BroadcastChannel === 'function' ? new BroadcastChannel('picarview.content') : null;
if (updates) updates.onmessage = loadContent;
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) loadContent();
});
window.addEventListener('focus', loadContent);
$('#retry-content').onclick = loadContent;
renderSite(structuredClone(defaults));
loadContent();
