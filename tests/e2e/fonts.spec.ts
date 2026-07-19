import { expect, test } from '@playwright/test';

// This regression is silent by nature: a wrong font renders perfectly readable
// text, so nothing fails until someone looks. Each surface below is a separate
// mechanism — the base stylesheet rule, the addon-docs theme, and the manager
// theme — and fixing one does not cover the others.

const SANS = /Google Sans Flex/;
const MONO = /Google Sans Code/;

test('manager chrome uses the design font, not Storybook default', async ({ page }) => {
  await page.goto('/?path=/docs/foundation-introduction--docs');

  const sidebar = page.locator('nav, [role="navigation"]').first();
  await expect(sidebar).toBeVisible();

  // The manager paints with Storybook's default theme first and swaps in the
  // configured one a tick later, so this has to settle rather than be read once.
  await expect
    .poll(() => sidebar.evaluate((el) => getComputedStyle(el).fontFamily))
    .toMatch(SANS);
});

test('MDX docs prose uses the design font', async ({ page }) => {
  await page.goto('/?path=/docs/foundation-introduction--docs');

  // Storybook keeps a hidden "no stories" <p> in the DOM, so scope to the
  // rendered docs container rather than matching the first paragraph.
  const prose = page.frameLocator('#storybook-preview-iframe').locator('#storybook-docs p:visible');
  await expect(prose.first()).toBeVisible();
  await expect(await prose.first().evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(SANS);
});

test('MDX code blocks use the mono token', async ({ page }) => {
  await page.goto('/?path=/docs/foundation-installation--docs');

  const code = page
    .frameLocator('#storybook-preview-iframe')
    .locator('#storybook-docs code:visible, #storybook-docs pre:visible');
  await expect(code.first()).toBeVisible();
  await expect(await code.first().evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(MONO);
});

test('elements teleported to body inherit the design font', async ({ page }) => {
  await page.goto('/iframe.html?id=components-overlay-modal--playground');

  // Overlays are teleported out of the app root, so they inherit only from the
  // base rule. A node appended straight to <body> reproduces that exactly.
  const font = await page.evaluate(() => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const family = getComputedStyle(el).fontFamily;
    el.remove();
    return family;
  });

  expect(font).toMatch(SANS);
});

test('webfonts are self-hosted and load without reaching Google', async ({ page }) => {
  const external: string[] = [];
  await page.route('**://fonts.googleapis.com/**', (route) => {
    external.push(route.request().url());
    return route.abort();
  });
  await page.route('**://fonts.gstatic.com/**', (route) => {
    external.push(route.request().url());
    return route.abort();
  });

  await page.goto('/iframe.html?id=showcase-all-components--gallery');
  await page.evaluate(() => document.fonts.ready);

  // Faces load lazily as glyphs are first painted, so poll rather than sampling
  // the set once. document.fonts.check() is not usable here: it returns true for
  // any family with no @font-face at all, including invented names.
  await expect
    .poll(() =>
      page.evaluate(() => [
        ...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family)),
      ]),
    )
    .toContain('Google Sans Flex');

  expect(external).toEqual([]);
});
