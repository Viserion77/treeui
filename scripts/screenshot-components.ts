/**
 * Captures PNG screenshots of every Storybook component story.
 *
 * Usage:
 *   pnpm screenshots            # builds Storybook, serves, captures
 *   pnpm screenshots:only       # skips build, uses already-running server
 *
 * Output: screenshots/<component>--<story>.png
 */

import { chromium, type Browser, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync, spawn, type ChildProcess } from 'node:child_process';

const BASE_URL = process.env.PW_BASE_URL ?? 'http://127.0.0.1:6006';
const OUT_DIR = path.resolve(__dirname, '..', 'screenshots');
const INDEX_JSON = path.resolve(
  __dirname,
  '..',
  'apps',
  'docs',
  'storybook-static',
  'index.json',
);
const SKIP_BUILD = process.argv.includes('--skip-build');

interface StoryEntry {
  id: string;
  type: 'story' | 'docs';
  title: string;
  name: string;
}

async function getStoryIds(): Promise<StoryEntry[]> {
  const raw = JSON.parse(fs.readFileSync(INDEX_JSON, 'utf-8'));
  const entries: StoryEntry[] = Object.values(raw.entries);
  return entries.filter(
    (e) => e.type === 'story' && e.title.startsWith('Components/'),
  );
}

/**
 * Pre-screenshot interactions for components that need to be "opened"
 * before capturing (modals, date pickers, tooltips, etc.).
 * Returns the locator to screenshot (defaults to #storybook-root).
 */
async function interactBeforeCapture(
  page: Page,
  storyId: string,
): Promise<{ screenshotTarget: 'page' | 'root' }> {
  // Modal stories: click the trigger to open, then screenshot the full page
  // so the backdrop + dialog are visible.
  if (storyId.startsWith('components-modal--')) {
    const trigger = page.locator('.tree-modal__trigger').first();
    if (await trigger.isVisible()) {
      await trigger.click();
      await page.waitForSelector('.tree-modal__surface[role="dialog"]', {
        timeout: 5_000,
      });
      await page.waitForTimeout(400); // let animation finish
      return { screenshotTarget: 'page' };
    }
  }

  // DatePicker Playground: click the trigger to open the calendar
  if (storyId === 'components-datepicker--playground') {
    const trigger = page.locator('.tree-date-picker__trigger');
    if (await trigger.isVisible()) {
      await trigger.click();
      await page.waitForSelector('.tree-date-picker__content', {
        timeout: 5_000,
      });
      await page.waitForTimeout(400);
    }
  }

  // Tooltip: hover the trigger to show the tooltip
  if (storyId.startsWith('components-tooltip--')) {
    const trigger = page.locator('.tree-tooltip__trigger, [data-state]').first();
    if (await trigger.isVisible()) {
      await trigger.hover();
      await page.waitForTimeout(500);
    }
  }

  return { screenshotTarget: 'root' };
}

async function captureStory(
  page: Page,
  story: StoryEntry,
): Promise<string> {
  const url = `${BASE_URL}/iframe.html?id=${story.id}&viewMode=story&shortcuts=false&singleStory=true`;
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait for the Storybook root to render
  await page.waitForSelector('#storybook-root', { timeout: 10_000 });
  // Small extra wait for animations / lazy renders
  await page.waitForTimeout(500);

  // Perform any required interaction (open modal, calendar, etc.)
  const { screenshotTarget } = await interactBeforeCapture(page, story.id);

  const fileName = `${story.id}.png`;
  const filePath = path.join(OUT_DIR, fileName);

  if (screenshotTarget === 'page') {
    // Full page screenshot to capture overlays (modal backdrop + dialog)
    await page.screenshot({ path: filePath, type: 'png', fullPage: true });
  } else {
    // Screenshot only the story root for a clean image
    const root = page.locator('#storybook-root');
    await root.screenshot({ path: filePath, type: 'png' });
  }

  return filePath;
}

async function main() {
  // 1. Build if needed
  if (!SKIP_BUILD) {
    console.log('📦 Building Storybook...');
    execSync('pnpm docs:build', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
    });
  }

  // 2. Serve storybook-static
  let server: ChildProcess | undefined;
  if (!process.env.PW_BASE_URL) {
    console.log('🌐 Starting local server...');
    server = spawn(
      'npx',
      ['http-server', 'apps/docs/storybook-static', '-p', '6006', '-a', '127.0.0.1', '-c-1'],
      { cwd: path.resolve(__dirname, '..'), stdio: 'ignore' },
    );
    // Give the server a moment to start
    await new Promise((r) => setTimeout(r, 2000));
  }

  // 3. Prepare output dir
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 4. Get all story entries
  const stories = await getStoryIds();
  console.log(`📸 Found ${stories.length} component stories\n`);

  // 5. Launch browser & capture
  const browser: Browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2, // Retina-quality screenshots
  });
  const page = await context.newPage();

  const results: { story: string; file: string }[] = [];

  for (const story of stories) {
    try {
      const file = await captureStory(page, story);
      const rel = path.relative(process.cwd(), file);
      console.log(`  ✅ ${story.title} / ${story.name} → ${rel}`);
      results.push({ story: `${story.title} / ${story.name}`, file: rel });
    } catch (err) {
      console.error(`  ❌ ${story.title} / ${story.name}: ${err}`);
    }
  }

  await browser.close();
  server?.kill();

  // 6. Summary
  console.log(`\n✨ Captured ${results.length}/${stories.length} screenshots to ./screenshots/`);
  console.log('   Use these PNGs in your PDF presentation.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
