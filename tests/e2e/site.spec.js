import { test, expect } from '@playwright/test';
import { mockSupabase } from './fixtures/supabase.js';

test('public content, article reading, brand colours, and mobile navigation', async ({
  page,
  context,
}) => {
  await mockSupabase(context);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.artist')).toHaveCount(1);
  await expect(page.locator('.post')).toHaveCount(1);
  await expect(page.locator('.site-brand').first()).toHaveText('jamza✳');
  await expect(page).toHaveTitle('jamza — A different perspective.');
  await expect(page.locator('#navigation a')).toHaveText([
    'Home',
    'Our Story',
    'The Artist',
    'Announcements & Blogs',
    'Partners',
    'Contact Us',
  ]);
  const targets = await page
    .locator('#navigation a')
    .evaluateAll((links) =>
      links.map((link) => document.querySelector(link.getAttribute('href')) !== null),
    );
  expect(targets).toEqual([true, true, true, true, true, true]);
  await expect(page.getByText('Private draft', { exact: true })).toHaveCount(0);
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(88, 14, 121)');
  await expect(page.locator('.hero-actions .button')).toHaveCSS(
    'background-color',
    'rgb(255, 249, 243)',
  );
  await page.getByRole('button', { name: 'Read Published story', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#article-body')).toHaveText('The complete public article.');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.locator('#navigation')).toBeVisible();
  await page.locator('#navigation').getByRole('link', { name: 'The Artist', exact: true }).click();
  await expect(page.locator('#navigation')).not.toBeVisible();
  expect(errors).toEqual([]);
});

test('contact submissions reach the private inbox and persist read state', async ({
  page,
  context,
}) => {
  const backend = await mockSupabase(context);
  await page.goto('/');
  await page.getByLabel('Your name').fill('Visitor');
  await page.getByLabel('Email address').fill('visitor@example.test');
  await page.getByLabel('Subject', { exact: true }).fill('A collaboration');
  await page.getByLabel('Your message').fill('Let’s make something together.');
  await page.getByRole('button', { name: 'Send your message' }).click();
  await expect(page.locator('#form-status')).toContainText('has been sent');
  expect(backend.tables.messages).toHaveLength(1);
  const admin = await context.newPage();
  await admin.goto('/admin.html');
  const { signIn } = await import('./fixtures/supabase.js');
  await signIn(admin);
  await expect(admin.locator('main')).toBeVisible();
  await admin.locator('[data-view="messages"]').click();
  await expect(admin.locator('tr.unread')).toHaveCount(1);
  await admin.getByRole('button', { name: 'Read Visitor', exact: true }).click();
  await expect(admin.locator('#message-body')).toHaveText('Let’s make something together.');
  await expect.poll(() => backend.tables.messages[0].read).toBe(true);
});

test('an unavailable schema shows an honest error and offers retry', async ({ page, context }) => {
  const backend = await mockSupabase(context);
  backend.missingSchema = true;
  await page.goto('/');
  await expect(page.locator('#content-status')).toContainText('temporarily unavailable');
  backend.missingSchema = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.locator('.artist')).toHaveCount(1);
  await expect(page.locator('#content-status')).not.toBeVisible();
});
