// Run against an isolated local CMS database; this check edits and publishes content.
const assert = require('node:assert/strict');
const { chromium, expect } = require('../../capitar-ventures-frontend/node_modules/@playwright/test');

async function main() {
  const origin = process.env.CMS_TEST_URL || 'http://127.0.0.1:3049';
  assert.ok(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname), 'Use an isolated local CMS only');
  assert.ok(process.env.CMS_TEST_EMAIL && process.env.CMS_TEST_PASSWORD, 'Supply local QA credentials');
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Exercise the asynchronous schema/configuration handoff on sidebar navigation.
    await page.route('**/content-manager/content-types/*/configuration', async route => {
      await new Promise(resolve => setTimeout(resolve, 300));
      await route.continue();
    });
    await page.goto(`${origin}/admin/auth/login`, { waitUntil: 'domcontentloaded' });
    await page.locator('input[name=email]').fill(process.env.CMS_TEST_EMAIL);
    await page.locator('input[name=password]').fill(process.env.CMS_TEST_PASSWORD);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.waitForURL(`${origin}/admin`);
    await page.goto(`${origin}/admin/content-manager/single-types/api::venture-debt.venture-debt`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[name=title]')).toBeVisible({ timeout: 60000 });
    for (const label of ['Homepage', 'About Us', 'Global', 'Portfolio', 'Blog', 'Privacy Policy', 'Venture Debt', 'Homepage', 'Global', 'Venture Debt']) {
      await page.getByRole('link', { name: label, exact: true }).click();
      await expect(page.locator('main input, main textarea').first()).toBeVisible({ timeout: 60000 });
      await expect(page.getByText('Something went wrong', { exact: true })).toHaveCount(0);
      assert.deepEqual(errors, [], `Navigation to ${label} must not crash`);
      console.log(`PASS editor: ${label}`);
    }
    const title = page.locator('input[name=title]');
    const original = await title.inputValue();
    const updated = original + ' QA';
    await title.fill(updated);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled({ timeout: 30000 });
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await expect.poll(async () => (await (await fetch(`${origin}/api/venture-debt`)).json()).data.title, { timeout: 30000 }).toBe(updated);
    await page.getByRole('link', { name: 'Homepage', exact: true }).click();
    await expect(page.locator('main input, main textarea').first()).toBeVisible({ timeout: 60000 });
    await page.getByRole('link', { name: 'Venture Debt', exact: true }).click();
    await expect(title).toHaveValue(updated, { timeout: 60000 });
    assert.deepEqual(errors, []);
    console.log('PASS: all seven single-type editors, cached navigation, delayed configuration, save, publish and return to editor.');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
