#!/usr/bin/env node
/**
 * TreeUI UI-review driver.
 *
 * A small, parameterized Playwright helper that connects to an ALREADY-RUNNING
 * Storybook (default http://127.0.0.1:6006) and captures PNG screenshots on
 * demand — optionally driving the UI first (click a button, open a modal, fill
 * a field) so you can review real interactive states, not just the default.
 *
 * It does NOT build or serve anything: start the server yourself once
 * (`pnpm docs:dev`) and reuse it across many shots. That keeps each capture fast.
 *
 * Usage:
 *   node .claude/skills/ui-review/shoot.mjs --list
 *   node .claude/skills/ui-review/shoot.mjs --story <id> [--theme dark] [--out path.png]
 *   node .claude/skills/ui-review/shoot.mjs --url <url> --out path.png
 *
 * Options:
 *   --list                 Print every "Components/*" story id + title from the
 *                          running server's index.json, then exit.
 *   --story <id>           Storybook story id (e.g. components-actions-button--variants).
 *   --url <url>            Screenshot an arbitrary URL instead of a story.
 *   --theme <name>         Storybook theme global (light | dark). Applied via
 *                          ?globals=theme:<name>. Default: light.
 *   --target <what>        What to capture: "root" (#storybook-root, default),
 *                          "page" (full page — use for overlays that portal to
 *                          <body>: modal, drawer, dropdown, tooltip, popover,
 *                          context-menu), or any CSS selector.
 *   --out <path>           Output PNG path. Default: screenshots/<id>[-<theme>].png
 *   --viewport <WxH>       Viewport size. Default: 1280x720.
 *   --scale <n>            deviceScaleFactor. Default: 2 (retina).
 *   --wait <ms>            Settle wait after load / after steps. Default: 400.
 *   --step <spec>          Interaction to run before capture (repeatable, in order):
 *                            click:<selector>
 *                            hover:<selector>
 *                            press:<key>              (e.g. press:Escape)
 *                            fill:<selector>=<value>
 *                            type:<selector>=<value>
 *                            waitfor:<selector>
 *                            wait:<ms>
 *   --base <url>           Storybook base URL. Default: http://127.0.0.1:6006.
 *
 * Examples:
 *   # default state, dark theme
 *   node .claude/skills/ui-review/shoot.mjs --story components-actions-button--variants --theme dark
 *
 *   # open a modal, then capture the full page (backdrop + dialog)
 *   node .claude/skills/ui-review/shoot.mjs --story components-overlay-modal--playground \
 *     --target page --step 'click:.t-modal__trigger' --step 'waitfor:.t-modal__portal [role="dialog"]'
 *
 * Output goes to screenshots/ (gitignored). Read the PNG afterwards to review it.
 */

import { chromium } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

function parseArgs(argv) {
  const opts = { steps: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case '--list': opts.list = true; break;
      case '--story': opts.story = next(); break;
      case '--url': opts.url = next(); break;
      case '--theme': opts.theme = next(); break;
      case '--target': opts.target = next(); break;
      case '--out': opts.out = next(); break;
      case '--viewport': opts.viewport = next(); break;
      case '--scale': opts.scale = Number(next()); break;
      case '--wait': opts.wait = Number(next()); break;
      case '--step': opts.steps.push(next()); break;
      case '--axe': opts.axe = true; break;
      case '--base': opts.base = next(); break;
      case '-h':
      case '--help': opts.help = true; break;
      default:
        console.error(`Unknown option: ${a}`);
        process.exit(2);
    }
  }
  return opts;
}

const HELP = `TreeUI UI-review driver — see header of this file for full docs.

  node .claude/skills/ui-review/shoot.mjs --list
  node .claude/skills/ui-review/shoot.mjs --story <id> [--theme dark] [--out path.png]
  node .claude/skills/ui-review/shoot.mjs --url <url> --out path.png
`;

const opts = parseArgs(process.argv.slice(2));
const BASE = (opts.base ?? 'http://127.0.0.1:6006').replace(/\/$/, '');

if (opts.help || (!opts.list && !opts.story && !opts.url)) {
  console.log(HELP);
  process.exit(opts.help ? 0 : 2);
}

async function listStories() {
  let res;
  try {
    res = await fetch(`${BASE}/index.json`);
  } catch (err) {
    console.error(`Could not reach ${BASE}/index.json — is Storybook running? (pnpm docs:dev)`);
    console.error(String(err));
    process.exit(1);
  }
  if (!res.ok) {
    console.error(`GET ${BASE}/index.json → ${res.status}. Is Storybook running?`);
    process.exit(1);
  }
  const data = await res.json();
  const entries = Object.values(data.entries ?? data.stories ?? {});
  const stories = entries
    .filter((e) => e.type === 'story' && String(e.title).startsWith('Components/'))
    .sort((a, b) => `${a.title}${a.name}`.localeCompare(`${b.title}${b.name}`));
  const width = Math.max(...stories.map((s) => s.id.length), 4);
  for (const s of stories) {
    console.log(`${s.id.padEnd(width)}  ${s.title} / ${s.name}`);
  }
  console.log(`\n${stories.length} Components/* stories on ${BASE}`);
}

async function runStep(page, spec) {
  const idx = spec.indexOf(':');
  const kind = idx === -1 ? spec : spec.slice(0, idx);
  const rest = idx === -1 ? '' : spec.slice(idx + 1);
  switch (kind) {
    case 'click': await page.locator(rest).first().click(); break;
    case 'hover': await page.locator(rest).first().hover(); break;
    case 'press': await page.keyboard.press(rest); break;
    case 'waitfor': await page.waitForSelector(rest, { timeout: 8000 }); break;
    case 'wait': await page.waitForTimeout(Number(rest)); break;
    case 'eval': await page.evaluate(rest); break;
    case 'fill':
    case 'type': {
      const eq = rest.indexOf('=');
      const sel = rest.slice(0, eq);
      const val = rest.slice(eq + 1);
      if (kind === 'fill') await page.locator(sel).first().fill(val);
      else await page.locator(sel).first().pressSequentially(val);
      break;
    }
    default:
      throw new Error(`Unknown --step kind: "${kind}" (in "${spec}")`);
  }
}

function findAxeSource() {
  // axe-core is a transitive dep (via @storybook/addon-a11y), so it lives under
  // node_modules/.pnpm/axe-core@<version>/node_modules/axe-core/axe.min.js.
  const pnpmDir = 'node_modules/.pnpm';
  const dirs = fs
    .readdirSync(pnpmDir)
    .filter((d) => d.startsWith('axe-core@'))
    .sort();
  if (!dirs.length) throw new Error('axe-core not found under node_modules/.pnpm');
  const file = path.join(pnpmDir, dirs[dirs.length - 1], 'node_modules/axe-core/axe.min.js');
  return fs.readFileSync(file, 'utf-8');
}

async function runAxe(page) {
  await page.addScriptTag({ content: findAxeSource() });
  const results = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    return await axe.run(document, { runOnly: ['color-contrast'] });
  });
  const violations = results.violations ?? [];
  const nodes = violations.flatMap((v) => v.nodes);
  console.log(`\n🎨 color-contrast — ${nodes.length} failing node(s)`);
  for (const v of violations) {
    for (const node of v.nodes) {
      const d = node.any?.[0]?.data ?? {};
      const ratio = d.contrastRatio != null ? `${d.contrastRatio}:1` : '?';
      const need = d.expectedContrastRatio ?? '?';
      const sel = Array.isArray(node.target) ? node.target.join(' ') : node.target;
      console.log(
        `  ✗ ${ratio} (needs ${need})  fg=${d.fgColor} bg=${d.bgColor}  ${sel}`,
      );
    }
  }
  if (!nodes.length) console.log('  ✓ no color-contrast violations');
  return nodes.length;
}

async function capture() {
  const [w, h] = (opts.viewport ?? '1280x720').split('x').map(Number);
  const theme = opts.theme ?? 'light';

  let target = opts.url;
  if (!target) {
    const params = new URLSearchParams({ id: opts.story, viewMode: 'story' });
    params.set('globals', `theme:${theme}`);
    target = `${BASE}/iframe.html?${params.toString()}`;
  }

  const outBase = opts.story ?? 'page';
  const out = opts.out
    ? opts.out
    : path.join('screenshots', `${outBase}${theme !== 'light' ? `-${theme}` : ''}.png`);
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: opts.scale ?? 2,
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  try {
    await page.goto(target, { waitUntil: 'networkidle', timeout: 30000 });
    if (opts.story) {
      await page.waitForSelector('#storybook-root', { timeout: 10000 });
    }
    await page.waitForTimeout(opts.wait ?? 400);

    for (const spec of opts.steps) {
      try {
        await runStep(page, spec);
      } catch (err) {
        throw new Error(`Step failed: "${spec}" → ${err.message}`);
      }
    }
    if (opts.steps.length) await page.waitForTimeout(opts.wait ?? 400);

    if (opts.axe) await runAxe(page);

    // Default to a clean story-root shot for Storybook, but full-page for an
    // arbitrary --url (there is no #storybook-root there).
    const targetKind = opts.target ?? (opts.url ? 'page' : 'root');
    if (targetKind === 'page') {
      await page.screenshot({ path: out, type: 'png', fullPage: true });
    } else if (targetKind === 'root') {
      await page.locator('#storybook-root').screenshot({ path: out, type: 'png' });
    } else {
      await page.locator(targetKind).first().screenshot({ path: out, type: 'png' });
    }

    const abs = path.resolve(out);
    const { size } = fs.statSync(abs);
    console.log(`📸 ${abs}  (${(size / 1024).toFixed(0)} KB, theme=${theme}, target=${targetKind})`);
    if (errors.length) console.warn(`⚠️  page errors: ${errors.join(' | ')}`);
  } finally {
    await browser.close();
  }
}

if (opts.list) {
  await listStories();
} else {
  await capture();
}
