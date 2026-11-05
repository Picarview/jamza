import test from 'node:test';
import assert from 'node:assert/strict';
import { readPublicConfig } from '../../src/config/env.js';

const jwt = (role) =>
  `header.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.signature`;
test('public configuration accepts public keys and normalizes the project origin', () => {
  const env = {
    VITE_SUPABASE_URL: ' https://example.supabase.co/ ',
    VITE_SUPABASE_ANON_KEY: jwt('anon'),
  };
  assert.equal(readPublicConfig(env).url, 'https://example.supabase.co');
  assert.equal(
    readPublicConfig({ ...env, VITE_SUPABASE_ANON_KEY: 'sb_publishable_example' }).key,
    'sb_publishable_example',
  );
});
test('privileged keys and malformed configuration are rejected without echoing credentials', () => {
  const secret = jwt('service_role');
  assert.throws(
    () =>
      readPublicConfig({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_ANON_KEY: secret,
      }),
    (error) => !error.message.includes(secret),
  );
  for (const url of [
    'http://example.com',
    'https://user:password@example.com',
    'https://example.com/path',
    'not-a-url',
  ]) {
    assert.throws(() =>
      readPublicConfig({ VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: jwt('anon') }),
    );
  }
  assert.throws(() => readPublicConfig({}), /Set VITE_SUPABASE_URL/);
  assert.equal(
    readPublicConfig({
      VITE_SUPABASE_URL: 'http://127.0.0.1:54321',
      VITE_SUPABASE_ANON_KEY: jwt('anon'),
    }).url,
    'http://127.0.0.1:54321',
  );
});
