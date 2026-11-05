import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/admin.css';
import { $ } from '../lib/dom.js';
import { explain } from '../lib/errors.js';
import { createAppClient } from '../lib/supabase.js';
import { getAdminContent } from '../services/content.js';
import { planChange, persistChange, applyChange } from '../services/records.js';
import { state } from './state.js';
import { views, schemas } from './schema.js';
import { createDashboardViews } from './views.js';
import { createRecordEditor } from './editor.js';
import { setupAuth } from './auth.js';

const db = createAppClient({ admin: true });
const BUCKET_NAME = 'jamzabucket';

const updates =
  typeof BroadcastChannel === 'function' ? new BroadcastChannel('picarview.content') : null;
let pendingDelete = null,
  toastTimer;

const read = () => structuredClone(state.cache);

function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  toastTimer = setTimeout(() => ($('#toast').textContent = ''), 5000);
}

/**
 * Uploads a file to Supabase Storage bucket 'jamzabucket'
 * @param {File} file 
 * @returns {Promise<string>} Public URL of uploaded image
 */
async function uploadFileToJamzaBucket(file) {
  if (!file || !(file instanceof File) || file.size === 0) return null;
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await db.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) {
    throw new Error(`Failed to upload image to ${BUCKET_NAME}: ${uploadError.message}`);
  }

  const { data } = db.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

async function processImageUploads(nextState) {
  const currentView = state.current;
  const currentRecords = nextState[currentView];
  
  if (!Array.isArray(currentRecords)) return nextState;

  for (const record of currentRecords) {
    for (const key of Object.keys(record)) {
      if (record[key] instanceof File) {
        toast('Uploading image to jamzabucket...');
        record[key] = await uploadFileToJamzaBucket(record[key]);
      }
    }
  }

  return nextState;
}

async function loadData() {
  if (!state.authorized) throw Error('Sign in with an approved administrator account.');
  const generation = state.authGeneration;
  const data = await getAdminContent(db);
  if (!state.authorized || generation !== state.authGeneration) return;
  state.cache = data;
  render();
}

async function save(next) {
  if (state.busy) {
    toast('Please wait for the current change to finish.');
    return false;
  }
  if (!state.authorized) {
    toast('Please sign in again.');
    return false;
  }
  state.busy = true;
  const generation = state.authGeneration;
  const controls = [...document.querySelectorAll('button')].map((button) => [
    button,
    button.disabled,
  ]);
  controls.forEach(([button]) => (button.disabled = true));
  
  try {
    const updatedNextState = await processImageUploads(next);
    const change = planChange(state.cache, updatedNextState);
    if (!change) return true;
    
    const result = await persistChange(db, change);
    if (!state.authorized || generation !== state.authGeneration)
      throw Error('Your session changed. Please sign in again.');
      
    state.cache = applyChange(state.cache, change, result);
    updates?.postMessage('refresh');
    return true;
  } catch (error) {
    toast(explain(error));
    return false;
  } finally {
    state.busy = false;
    controls.forEach(([button, disabled]) => (button.disabled = disabled));
  }
}

function go(view) {
  state.current = view;
  const [label, title, description] = views[view];
  $('#breadcrumb').textContent = label;
  $('#view-title').textContent = title;
  $('#view-description').textContent = description;
  document.querySelectorAll('[data-view]').forEach((b) => {
    b.classList.toggle('active', b.dataset.view === view);
    if (b.dataset.view === view) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  $('#add-button').hidden = !schemas[view];
  $('#add-button').textContent =
    '+ ' + (view === 'artists' ? 'Add artist' : view === 'posts' ? 'Create post' : 'Add partner');
  $('#sidebar').classList.remove('open');
  $('.mobile-menu').setAttribute('aria-expanded', 'false');
  render();
}

function askDelete(id) {
  pendingDelete = { view: state.current, id };
  $('#delete-dialog').showModal();
}

$('#confirm-delete').onclick = async () => {
  if (!pendingDelete) return;
  const d = read(),
    { view, id } = pendingDelete;
  d[view] = d[view].filter((r) => r.id !== id);
  if (await save(d)) {
    $('#delete-dialog').close();
    pendingDelete = null;
    render();
    toast('Item deleted.');
  }
};

$('#cancel-delete').onclick = () => $('#delete-dialog').close();

async function openMessage(id) {
  const d = read(),
    m = d.messages.find((r) => r.id === id);
  if (!m) return;
  $('#message-title').textContent = m.subject;
  $('#message-meta').textContent =
    m.name + ' <' + m.email + '> · ' + new Date(m.date).toLocaleString();
  $('#message-body').textContent = m.message;
  $('#message-dialog').showModal();
  if (!m.read) {
    m.read = true;
    if (await save(d)) render();
  }
}

const { render } = createDashboardViews({
  read,
  save,
  go,
  openEditor: (id) => editor.openEditor(id),
  openMessage,
  askDelete,
  toast,
});

const editor = createRecordEditor({ db, read, save, render, toast });

document
  .querySelectorAll('[data-view]')
  .forEach((button) => (button.onclick = () => go(button.dataset.view)));

$('#add-button').onclick = () => editor.openEditor();

$('.mobile-menu').onclick = () => {
  const open = $('#sidebar').classList.toggle('open');
  $('.mobile-menu').setAttribute('aria-expanded', String(open));
};

setupAuth({ db, loadData, go, toast });