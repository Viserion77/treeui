---
name: ui-review
description: >-
  Drive TreeUI's Storybook in a real browser and capture on-demand screenshots
  to review UI/UX. Use when asked to see how a component looks, screenshot the
  UI, compare light vs dark theme, or click through an interaction (open a modal,
  fill a field, hover a button) and capture the resulting state. Runs against a
  live Storybook via Playwright; you then read the PNGs and give visual feedback.
---

# TreeUI UI review

Capture screenshots of TreeUI components straight from Storybook, drive real
interactions before capturing, and then **read the PNGs** to give UI/UX feedback.

The driver is [`shoot.mjs`](shoot.mjs): a thin Playwright wrapper that connects to
an already-running Storybook and captures on demand. It never builds or serves —
you start the server once and reuse it, so each shot is fast.

## 1. Ensure Storybook is running (once per session)

Check first, then reuse:

```bash
curl -sf http://127.0.0.1:6006/index.json >/dev/null && echo "up" || echo "down"
```

If down, start it in the **background** and wait until `/index.json` answers
(first boot builds packages, so give it up to ~2 min):

```bash
pnpm docs:dev   # run_in_background: true — serves Storybook on :6006
```

Poll `curl -sf http://127.0.0.1:6006/index.json` until it succeeds before shooting.
One server serves every capture for the rest of the session — do not restart it
per screenshot.

First time on a fresh machine, install the browser once:
`pnpm exec playwright install chromium`.

## 2. Find the story id

```bash
node .claude/skills/ui-review/shoot.mjs --list
```

Prints every `Components/*` story id + title. Ids look like
`components-<category>-<name>--<story>` (e.g. `components-actions-button--variants`,
`components-form-fileupload--playground`). Use the exact id — don't guess the kebab-casing.

## 3. Capture

```bash
# default state
node .claude/skills/ui-review/shoot.mjs --story components-actions-button--variants

# dark theme (light | dark)
node .claude/skills/ui-review/shoot.mjs --story components-actions-button--variants --theme dark

# overlays portal to <body> — open them, then capture the whole page
node .claude/skills/ui-review/shoot.mjs --story components-overlay-modal--playground \
  --target page \
  --step 'click:.t-modal__trigger' \
  --step 'waitfor:.t-modal__portal [role=\"dialog\"]'

# drive a flow: hover, fill, press, etc.
node .claude/skills/ui-review/shoot.mjs --story components-data-entry-input--playground \
  --step 'fill:input=hello@example.com' --step 'hover:input'

# any arbitrary URL (example apps, landing, a specific page)
node .claude/skills/ui-review/shoot.mjs --url http://127.0.0.1:6006/iframe.html?id=... --out screenshots/x.png
```

Output goes to `screenshots/` (gitignored). Run `--help` for the full option list.

Key options: `--theme`, `--target root|page|<selector>`, `--step <spec>` (repeatable:
`click:`/`hover:`/`press:`/`fill:sel=val`/`type:sel=val`/`waitfor:`/`wait:ms`),
`--viewport WxH`, `--out`, `--base`.

Use `--target page` for anything that portals to `<body>`: **modal, drawer, dropdown,
tooltip, popover, context-menu**. Otherwise the default `--target root` (`#storybook-root`)
gives a clean, tight shot. Class names follow the `t-` BEM convention
(`.t-modal__trigger`, `.t-button`, …) — check the component's CSS in
`packages/vue/src/styles/index.css` if a selector doesn't match.

## 4. Review

After capturing, **Read each PNG** (the file tool renders images) and give concrete
UI/UX feedback: spacing, alignment, contrast, state clarity, theme parity
(light vs dark), focus/hover affordances, and accessibility of what's visible.
For a component, capturing the default + an interactive/error state, in both
themes, usually tells the story.
