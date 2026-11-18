import { $ } from '../lib/dom.js';
import { defaults } from '../config/defaults.js';
import { explain } from '../lib/errors.js';
import { state } from './state.js';
export function setupAuth({ db, loadData, go, toast }) {
  function setWorkspace(open) {
    document.body.classList.toggle('signed-in', open);
    $('#auth-panel').hidden = open;
    $('#sidebar').hidden = !open;
    $('main').hidden = !open;
  }
  async function enterWorkspace() {
    const generation = ++state.authGeneration;
    $('#auth-status').textContent = 'Checking administrator access…';
    const { data: userData, error: userError } = await db.auth.getUser();
    if (generation !== state.authGeneration) return;
    if (userError || !userData.user) {
      state.authorized = false;
      setWorkspace(false);
      $('#auth-status').textContent = '';
      return;
    }
    const { data: adminRecord, error } = await db
      .from('picarview_admins')
      .select('user_id')
      .eq('user_id', userData.user.id)
      .maybeSingle();
    if (generation !== state.authGeneration) return;
    if (error) throw error;
    if (!adminRecord)
      throw Error(
        'This account is not an approved administrator. Add its user ID to picarview_admins in Supabase.',
      );
    state.authorized = true;
    await loadData();
    if (!state.authorized || generation !== state.authGeneration) return;
    $('#admin-email').textContent = userData.user.email;
    $('#auth-error').textContent = '';
    $('#auth-status').textContent = '';
    setWorkspace(true);
    go(state.current);
  }
  $('#login-form').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget,
      b = form.querySelector('button');
    if (b.disabled) return;
    b.disabled = true;
    $('#auth-error').textContent = '';
    $('#auth-status').textContent = 'Signing in…';
    try {
      if (!db)
        throw Error('Supabase is not configured. Check .env.local and restart the dev server.');
      const v = Object.fromEntries(new FormData(form));
      const { error } = await db.auth.signInWithPassword({
        email: v.email.trim(),
        password: v.password,
      });
      if (error) throw error;
      form.querySelector('[name=password]').value = '';
      await enterWorkspace();
    } catch (error) {
      state.authorized = false;
      state.cache = structuredClone(defaults);
      setWorkspace(false);
      $('#auth-error').textContent = explain(error);
      $('#auth-status').textContent = '';
    } finally {
      b.disabled = false;
    }
  };
  $('#sign-out').onclick = async () => {
    if (state.busy) return;
    state.authGeneration++;
    state.authorized = false;
    state.cache = structuredClone(defaults);
    document.querySelectorAll('dialog[open]').forEach((d) => d.close());
    $('#content').replaceChildren();
    setWorkspace(false);
    const { error } = await db.auth.signOut({ scope: 'local' });
    $('#auth-status').textContent = error
      ? 'Signed out of the workspace. Refresh if the stored session could not be cleared.'
      : '';
    $('#login-form').reset();
  };
  $('#refresh-data').onclick = async () => {
    if (state.busy || document.querySelector('dialog[open]'))
      return toast('Finish your current edit before refreshing.');
    const b = $('#refresh-data');
    b.disabled = true;
    try {
      await loadData();
      $('#connection-note').textContent = 'Connected. Showing the latest data from Supabase.';
    } catch (error) {
      $('#connection-note').textContent = explain(error);
    } finally {
      b.disabled = false;
    }
  };
  if (db) {
    db.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        state.authGeneration++;
        state.authorized = false;
        state.cache = structuredClone(defaults);
        document.querySelectorAll('dialog[open]').forEach((d) => d.close());
        $('#content').replaceChildren();
        setWorkspace(false);
      }
    });
    enterWorkspace().catch((error) => {
      state.authorized = false;
      setWorkspace(false);
      $('#auth-error').textContent = explain(error);
      $('#auth-status').textContent = '';
    });
  } else {
    $('#auth-status').textContent = '';
    $('#auth-error').textContent =
      'Supabase is not configured. Check .env.local and restart the dev server.';
  }
}
