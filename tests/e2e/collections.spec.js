import { test, expect } from '@playwright/test';
import { mockSupabase, signIn, png } from './fixtures/supabase.js';

test('view-all galleries show every public record, support search, and preserve article reading', async ({ page, context }) => {
  const backend = await mockSupabase(context);
  const copy = (record, id, title) => ({ ...record, id, ...(record.name ? { name: title } : { title }) });
  for (let index = 2; index <= 5; index++) backend.tables.artists.push(copy(backend.tables.artists[0], 'a' + index, 'Artist ' + index));
  for (let index = 3; index <= 5; index++) backend.tables.posts.push(copy(backend.tables.posts[0], 'p' + index, 'Story ' + index));
  for (let index = 2; index <= 6; index++) backend.tables.partners.push(copy(backend.tables.partners[0], 'r' + index, 'Partner ' + index));
  await page.goto('/');
  await expect(page.locator('#artist-grid .artist')).toHaveCount(3);
  await expect(page.locator('#post-grid .post')).toHaveCount(3);
  await expect(page.locator('#partner-grid .partner')).toHaveCount(4);
  await expect(page.locator('#post-grid .post img').first()).toBeVisible();
  await expect(page.locator('#partner-grid .partner-logo').first()).toBeVisible();

  await page.getByRole('button', { name: 'View all artists', exact: true }).click();
  const gallery = page.locator('#collection-dialog');
  await expect(gallery).toBeVisible();
  await expect(gallery.locator('.artist')).toHaveCount(5);
  await expect(page.locator('#collection-search')).toBeFocused();
  await gallery.getByLabel('Search this collection').fill('Artist 5');
  await expect(gallery.locator('.artist')).toHaveCount(1);
  await expect(gallery.locator('.artist h3')).toHaveText('Artist 5');
  await gallery.getByLabel('Search this collection').fill('does not exist');
  await expect(gallery).toContainText('No matches.');
  await page.keyboard.press('Escape');
  await expect(page.locator('#view-all-artists')).toBeFocused();

  await page.locator('#view-all-posts').click();
  await expect(gallery.locator('.post')).toHaveCount(4);
  await expect(gallery.getByText('Private draft', { exact: true })).toHaveCount(0);
  await gallery.getByRole('button', { name: 'Read Published story', exact: true }).click();
  await expect(page.locator('#article-dialog')).toBeVisible();
  await expect(page.locator('#article-body')).toHaveText('The complete public article.');
  await page.keyboard.press('Escape');
  await expect(gallery).toBeVisible();
  await gallery.getByRole('button', { name: 'Close collection' }).click();

  await page.locator('#view-all-partners').click();
  await expect(gallery.locator('.partner')).toHaveCount(6);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => gallery.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await gallery.getByLabel('Search this collection').fill('Partner 6');
  await expect(gallery.locator('.partner')).toHaveCount(1);
});

test('blog editors preview and upload cover files, then display them when published', async ({ page, context }) => {
  const backend = await mockSupabase(context);
  await page.goto('/admin.html');
  await signIn(page);
  await expect(page.locator('main')).toBeVisible();
  await page.locator('[data-view="posts"]').click();
  await page.getByRole('button', { name: 'Edit Private draft', exact: true }).click();
  const editor = page.locator('#editor');
  await expect(editor.locator('.preview')).toBeVisible();
  await editor.locator('input[type=file]').setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: png });
  await expect(editor.locator('.preview')).toHaveAttribute('src', /^blob:/);
  await editor.getByRole('button', { name: 'Save changes' }).click();
  await expect(editor).not.toBeVisible();
  expect(backend.tables.posts.find((post) => post.id === 'p2').image).toContain('/storage/v1/object/public/post-images/');
  await page.getByRole('button', { name: 'Publish Private draft', exact: true }).click();
  await expect.poll(() => backend.tables.posts.find((post) => post.id === 'p2').status).toBe('Published');
  const site = await context.newPage();
  await site.goto('/');
  await expect(site.locator('.post').filter({ has: site.getByRole('heading', { name: 'Private draft', exact: true }) }).locator('img')).toHaveAttribute('src', /post-images/);
});
