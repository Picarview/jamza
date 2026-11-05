import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeContact, submitContact } from '../../src/services/messages.js';
import { validateLogo, validateImage, IMAGE_UPLOADS, LOGO_MAX_BYTES } from '../../src/services/uploads.js';
import { safeUrl } from '../../src/lib/dom.js';

const contact = {
  name: ' Visitor ',
  email: ' visitor@example.com ',
  subject: ' An idea ',
  message: ' Hello ',
};
test('contact data is trimmed and never includes unexpected fields in the RPC payload', async () => {
  assert.equal(normalizeContact(contact).name, 'Visitor');
  let sent;
  await submitContact(
    {
      async rpc(name, args) {
        sent = { name, args };
        return { error: null };
      },
    },
    { ...contact, read: true },
  );
  assert.equal(sent.name, 'picarview_submit_message');
  assert.deepEqual(Object.keys(sent.args).sort(), ['p_email', 'p_message', 'p_name', 'p_subject']);
});
test('empty, oversized, and malformed submissions are rejected before sending', () => {
  for (const invalid of [
    { ...contact, name: ' ' },
    { ...contact, email: 'bad-email' },
    { ...contact, message: 'x'.repeat(5001) },
  ]) {
    assert.throws(() => normalizeContact(invalid));
  }
});
test('logo uploads restrict formats, nonempty files, and size', () => {
  assert.equal(validateLogo({ type: 'image/png', size: LOGO_MAX_BYTES }), 'png');
  for (const file of [
    { type: 'image/svg+xml', size: 10 },
    { type: 'image/png', size: 0 },
    { type: 'image/jpeg', size: LOGO_MAX_BYTES + 1 },
  ]) {
    assert.throws(() => validateLogo(file));
  }
});

test('artist photos and post covers allow larger images with separate upload buckets', () => {
  for (const entity of ['artists', 'posts']) {
    assert.equal(validateImage({ type: 'image/jpeg', size: 5_000_000 }, entity), 'jpg');
    assert.throws(() => validateImage({ type: 'image/jpeg', size: 5_000_001 }, entity));
    assert.throws(() => validateImage({ type: 'image/svg+xml', size: 100 }, entity));
    assert.throws(() => validateImage({ type: 'image/png', size: 0 }, entity));
  }
  assert.equal(IMAGE_UPLOADS.artists.bucket, 'artist-images');
  assert.equal(IMAGE_UPLOADS.posts.bucket, 'post-images');
  assert.equal(IMAGE_UPLOADS.partners.bucket, 'partner-logos');
});
test('rendered URLs reject executable and unsupported schemes', () => {
  assert.equal(safeUrl('javascript:alert(1)'), '');
  assert.equal(safeUrl('data:text/html,<script>alert(1)</script>', true), '');
  assert.equal(safeUrl('https://example.com/logo.png'), 'https://example.com/logo.png');
  assert.equal(safeUrl('data:image/png;base64,aGVsbG8=', true), 'data:image/png;base64,aGVsbG8=');
});
