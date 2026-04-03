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

test('tooltip opens on focus and closes on blur', async ({ page }) => {
  await page.goto('/iframe.html?id=components-tooltip--playground');

  const trigger = page.getByRole('button', { name: 'Invite teammate' });
  const tooltipRoot = page.locator('.tree-tooltip');

  await trigger.focus();
  await expect(tooltipRoot).toHaveAttribute('data-state', 'open');
  await expect(page.getByRole('tooltip')).toBeVisible();

  await trigger.blur();
  await expect(tooltipRoot).toHaveAttribute('data-state', 'closed');
});

test('modal opens with trigger, traps focus, and closes on Escape', async ({ page }) => {
  await page.goto('/iframe.html?id=components-modal--playground');

  const trigger = page.getByRole('button', { name: 'Open modal' });
  await trigger.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');

  // Tab through focusable elements inside the modal — focus should stay trapped
  await page.keyboard.press('Tab');
  const activeAfterTab = await page.evaluate(() => document.activeElement?.closest('[role="dialog"]'));
  expect(activeAfterTab).not.toBeNull();

  // Escape should close the modal
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();

  // Focus should return to the trigger
  await expect(trigger).toBeFocused();
});

test('date picker opens on keyboard and navigates with arrow keys', async ({ page }) => {
  await page.goto('/iframe.html?id=components-datepicker--playground');

  const trigger = page.locator('.tree-date-picker__trigger');
  await trigger.focus();

  // Open with ArrowDown
  await page.keyboard.press('ArrowDown');
  const calendar = page.getByRole('dialog');
  await expect(calendar).toBeVisible();

  // Arrow keys should move focus between day cells
  const focusedBefore = await page.evaluate(() => document.activeElement?.getAttribute('data-date'));
  await page.keyboard.press('ArrowRight');
  const focusedAfter = await page.evaluate(() => document.activeElement?.getAttribute('data-date'));
  expect(focusedAfter).not.toBe(focusedBefore);

  // Escape should close the picker
  await page.keyboard.press('Escape');
  await expect(calendar).not.toBeVisible();
});
