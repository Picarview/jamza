import { $, el, safeUrl } from '../lib/dom.js';
import { state } from './state.js';
import { schemas } from './schema.js';
import { explain } from '../lib/errors.js';

const BUCKET_NAME = 'jamzabucket';

/**
 * Direct file upload to Supabase 'jamzabucket' storage
 */
async function uploadToJamzaBucket(db, file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await db.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) {
    throw new Error(`Upload to ${BUCKET_NAME} failed: ${uploadError.message}`);
  }

  const { data } = db.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return { url: data.publicUrl, path: filePath };
}

export function createRecordEditor({ db, read, save, render, toast }) {
  let editing = null, editingView = null, savingRecord = false, editorGeneration = 0;
  let selectedFile = null, previewUrl = null;

  function clearFile() {
    selectedFile = null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  function openEditor(id = null) {
    const generation = ++editorGeneration;
    clearFile();
    editing = id;
    editingView = state.current;
    const record = read()[editingView].find((item) => item.id === id) || {};
    $('#editor-title').textContent = (id ? 'Edit ' : 'Add ') +
      (editingView === 'artists' ? 'artist' : editingView === 'posts' ? 'post' : 'partner');
    const fields = $('#fields');
    fields.replaceChildren();
    $('#editor-error').textContent = '';
    
    for (const [key, label, type, required] of schemas[editingView]) {
      const wrapper = el('label', type === 'textarea' || key === 'image' ? 'full' : '', label);
      const input = el(type === 'textarea' ? 'textarea' : type === 'select' ? 'select' : 'input');
      input.name = key;
      input.required = required;
      if (type === 'select') {
        for (const value of ['Draft', 'Published']) {
          const option = el('option', '', value);
          option.value = value;
          input.append(option);
        }
      } else if (type !== 'textarea') input.type = type;
      
      input.value = record[key] ?? (key === 'date' ? new Date().toISOString().slice(0, 10) : key === 'status' ? 'Draft' : '');
      
      if (type !== 'select') {
        input.maxLength = type === 'textarea' 
          ? (key === 'body' ? 20000 : key === 'description' ? 2000 : 350) 
          : (key === 'image' ? 2048 : 300);
      }
      if (key === 'description' && type === 'textarea') {
        input.rows = 4;
        input.placeholder = 'Write details or a biography about the artist...';
      }
      if (key === 'image') input.placeholder = 'Paste an image URL, or upload a file below';
      
      wrapper.append(input);
      fields.append(wrapper);
    }

    const imageInput = fields.querySelector('[name=image]');
    const imageRequired = schemas[editingView].find(([key]) => key === 'image')[3];
    const wrapper = el('div', 'full image-upload');
    const label = el('label', '', `Upload image to ${BUCKET_NAME}`), file = el('input', 'upload');
    file.type = 'file';
    file.accept = 'image/png,image/jpeg,image/webp';
    label.append(file);
    const preview = el('img', 'preview');
    preview.alt = editingView === 'partners' ? 'Partner logo preview' : editingView === 'artists' ? 'Artist image preview' : 'Announcement or blog cover preview';
    const clearButton = el('button', 'button outline clear-upload', 'Clear selected file');
    clearButton.type = 'button';
    clearButton.hidden = true;

    function refreshPreview() {
      const url = previewUrl || safeUrl(imageInput.value.trim(), true);
      preview.hidden = !url;
      if (url) preview.src = url;
      else preview.removeAttribute('src');
      imageInput.required = imageRequired && !selectedFile;
      clearButton.hidden = !selectedFile;
    }
    
    file.onchange = () => {
      const candidate = file.files[0];
      if (!candidate) return;
      try {
        clearFile();
        selectedFile = candidate;
        previewUrl = URL.createObjectURL(candidate);
        imageInput.value = '';
        $('#editor-error').textContent = '';
      } catch (error) {
        clearFile();
        imageInput.value = record.image || '';
        file.value = '';
        $('#editor-error').textContent = error.message;
      }
      refreshPreview();
    };
    
    imageInput.oninput = () => {
      clearFile();
      file.value = '';
      $('#editor-error').textContent = '';
      refreshPreview();
    };
    
    clearButton.onclick = () => {
      clearFile();
      file.value = '';
      imageInput.value = record.image || '';
      refreshPreview();
    };
    
    preview.onerror = () => {
      if (generation !== editorGeneration || !$('#editor').open) return;
      if (selectedFile) {
        clearFile();
        file.value = '';
        imageInput.required = imageRequired;
        clearButton.hidden = true;
        $('#editor-error').textContent = 'This image could not be previewed. Please choose another file.';
      }
      preview.hidden = true;
    };
    
    wrapper.append(
      label, 
      el('p', 'help', `PNG, JPEG, WebP. Choose a file or paste an image URL. Uploads directly to ${BUCKET_NAME}.`), 
      preview, 
      clearButton
    );
    fields.append(wrapper);
    refreshPreview();
    $('#editor').showModal();
  }

  $('#editor-form').onsubmit = async (event) => {
    event.preventDefault();
    if (savingRecord || state.busy) return;
    const recordView = editingView, recordId = editing, imageFile = selectedFile;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    Object.keys(values).forEach((key) => values[key] = values[key].trim());
    
    if (schemas[recordView].some(([key,,,required]) => required && !values[key] && !(key === 'image' && imageFile))) {
      $('#editor-error').textContent = 'Please complete all required fields and choose an image or image URL.';
      return;
    }
    
    if ((values.image && !safeUrl(values.image, true)) || (values.url && !safeUrl(values.url))) {
      $('#editor-error').textContent = 'Use a valid HTTP(S) URL or upload an image.';
      return;
    }
    
    const data = read(), list = data[recordView];
    const index = recordId ? list.findIndex((item) => item.id === recordId) : -1;
    
    if (recordId && index < 0) {
      $('#editor-error').textContent = 'This item was removed. Close the editor and refresh.';
      return;
    }
    
    savingRecord = true;
    const submitButton = $('#save-record');
    submitButton.disabled = true;
    let upload = null, saved = false;
    
    try {
      if (imageFile) {
        upload = await uploadToJamzaBucket(db, imageFile);
        values.image = upload.url;
      }
      if (recordId) list[index] = { ...list[index], ...values };
      else list.unshift({ ...values, id: crypto.randomUUID() });
      
      saved = await save(data);
      if (saved) {
        $('#editor').close();
        render();
        toast('Changes saved. Published content is now on your website.');
      } else {
        $('#editor-error').textContent = 'Your changes were not saved. Check the notification and try again.';
      }
    } catch (error) {
      $('#editor-error').textContent = explain(error);
    } finally {
      savingRecord = false;
      submitButton.disabled = false;
    }
  };

  $('#editor').addEventListener('close', clearFile);
  $('#cancel-editor').onclick = () => { if (!savingRecord) $('#editor').close(); };
  $('#editor').addEventListener('cancel', (event) => { if (savingRecord) event.preventDefault(); });
  document.querySelectorAll('dialog .close').forEach((button) => button.onclick = () => {
    if (button.closest('dialog').id !== 'editor' || !savingRecord) button.closest('dialog').close();
  });

  return { openEditor };
}