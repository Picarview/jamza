import { test, expect } from '@playwright/test';
import { mockSupabase, signIn, png } from './fixtures/supabase.js';

test('sign-in rejects invalid credentials and non-admin accounts; sign-out clears private UI', async ({
  page,
  context,
}) => {
  await mockSupabase(context);
  await page.goto('/admin.html');
  await expect(page.locator('main')).not.toBeVisible();
  await signIn(page, 'admin@example.test', 'wrong-password');
  await expect(page.locator('#auth-error')).toContainText('Invalid login credentials');
  await signIn(page, 'member@example.test');
  await expect(page.locator('#auth-error')).toContainText('not an approved administrator');
  await expect(page.locator('main')).not.toBeVisible();
  await signIn(page);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('#admin-email')).toHaveText('admin@example.test');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await expect(page.locator('#sidebar')).toHaveClass('open');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.locator('main')).not.toBeVisible();
  await expect(page.locator('#content')).toBeEmpty();
  await page.reload();
  await expect(page.locator('#login-form')).toBeVisible();
  await expect(page.locator('main')).not.toBeVisible();
});

test('artist changes, failed saves, drafts, uploads, and settings reach the public page', async ({
  page,
  context,
}) => {
  const backend = await mockSupabase(context);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/admin.html');
  await signIn(page);
  await expect(page.locator('main')).toBeVisible();
  const site = await context.newPage();
  site.on('pageerror', (error) => errors.push(error.message));
  await site.goto('/');
  await expect(site.locator('.artist')).toHaveCount(1);
  await page.locator('[data-view="artists"]').click();
  await page.locator('#add-button').click();
  const editor = page.locator('#editor');
  await editor.getByLabel('Artist name').fill('New Artist');
  await editor.getByLabel('Genre / role').fill('Electronic');
  await editor.locator('input[type=file]').setInputFiles({ name: 'artist.png', mimeType: 'image/png', buffer: png });
  await expect(editor.locator('.preview')).toBeVisible();
  await editor.getByRole('button', { name: 'Save changes' }).click();
  await expect(editor).not.toBeVisible();
  await expect(site.locator('.artist')).toHaveCount(2);
  expect(backend.tables.artists[0].image).toContain('/storage/v1/object/public/artist-images/');
  await page.getByRole('button', { name: 'Edit New Artist', exact: true }).click();
  await editor.getByLabel('Artist name').fill('Edited <b>Artist</b>');
  backend.failNextWrite = true;
  await editor.getByRole('button', { name: 'Save changes' }).click();
  await expect(editor.locator('#editor-error')).toContainText('not saved');
  await expect(editor.getByLabel('Artist name')).toHaveValue('Edited <b>Artist</b>');
  await editor.getByRole('button', { name: 'Save changes' }).click();
  await expect(editor).not.toBeVisible();
  await expect(site.locator('.artist h3').first()).toHaveText('Edited <b>Artist</b>');
  await expect(site.locator('.artist h3 b')).toHaveCount(0);
  await page.getByRole('button', { name: 'Delete Edited <b>Artist</b>', exact: true }).click();
  await page.getByRole('button', { name: 'Keep item', exact: true }).click();
  expect(backend.tables.artists).toHaveLength(2);
  await page.getByRole('button', { name: 'Delete Edited <b>Artist</b>', exact: true }).click();
  await page.getByRole('button', { name: 'Delete item', exact: true }).click();
  await expect(site.locator('.artist')).toHaveCount(1);
  await page.locator('[data-view="posts"]').click();
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await page.getByRole('button', { name: 'Publish Private draft', exact: true }).click();
  await expect(site.locator('.post')).toHaveCount(2);
  await page.getByRole('button', { name: 'Unpublish Private draft', exact: true }).click();
  await expect(site.locator('.post')).toHaveCount(1);
  await page.locator('[data-view="partners"]').click();
  await page.locator('#add-button').click();
  await editor.getByLabel('Organization name').fill('Uploaded partner');
  await editor
    .locator('input[type=file]')
    .setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: png });
  await expect(editor.locator('.preview')).toBeVisible();
  await editor.getByRole('button', { name: 'Save changes' }).click();
  await expect(editor).not.toBeVisible();
  await expect(site.locator('.partner')).toHaveCount(2);
  expect(backend.uploads).toHaveLength(2);
  expect(backend.tables.partners[0].image).toContain('/storage/v1/object/public/partner-logos/');
  await page.locator('[data-view="settings"]').click();
  await page.getByLabel('Site title').fill('jamza studio');
  await page.getByLabel('Instagram URL').fill('https://instagram.com/example');
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(site.locator('.site-brand').first()).toContainText('jamza studio');
  await expect(site.locator('#socials a')).toHaveAttribute('href', 'https://instagram.com/example');
  expect(errors).toEqual([]);
});
