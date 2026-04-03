import { expect, test } from '@playwright/test';

test('loads the introduction docs page', async ({ page }) => {
  await page.goto('/?path=/docs/foundation-introduction--docs');

  await expect(page.getByRole('link', { name: 'Introduction' })).toBeVisible();
  await expect(page.locator('#storybook-preview-iframe')).toBeVisible();
  await expect(page).toHaveURL(/foundation-introduction--docs/);
});

test('renders the tooltip story canvas', async ({ page }) => {
  await page.goto('/iframe.html?id=components-tooltip--playground');

  const trigger = page.getByRole('button', { name: 'Invite teammate' });
  const tooltipRoot = page.locator('.tree-tooltip');

  await expect(trigger).toBeVisible();
  await expect(tooltipRoot).toHaveAttribute('data-state', 'closed');
  await expect(page).toHaveURL(/components-tooltip--playground/);
});

test('applies the dark theme toolbar state', async ({ page }) => {
  await page.goto('/?path=/story/components-badge--states&globals=theme:dark');

  const preview = page.frameLocator('#storybook-preview-iframe');

  await expect(preview.locator('html')).toHaveAttribute('data-tree-theme', 'dark');
  await expect(preview.getByText('Danger')).toBeVisible();
});
