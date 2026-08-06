/**
 * THE COLOUR CONTRACT — the versioned list of what a product supplies and what
 * the library guarantees back.
 *
 * This file is the single source of truth. The stylesheet generator, the
 * validator, `docs/ai/TOKENS.yaml` and `MIGRATION.md` all describe what is
 * written here; if they disagree, this file is right and they are stale.
 *
 * Three layers, one rule each:
 *
 *   1. PRIMITIVES  (`primitives.ts`)  — raw values. Never referenced by a
 *      component, never themed by a product, never emitted as a CSS variable.
 *   2. SEMANTICS   (this file)        — the public API. A product fills these,
 *      directly or by seeding. Components may only name these.
 *   3. DERIVED     (`states.ts`)      — hover, press, selected, disabled. The
 *      library computes them. Emitted so the stylesheet can use them; marked
 *      `private` here because overriding one is unsupported.
 *
 * Versioning: `CONTRACT_VERSION` is the minor version of the semantic list.
 * Adding an optional token is a minor bump. Adding a required token, removing
 * one, or changing what one means is a major bump and needs a MIGRATION.md
 * entry.
 */

export const CONTRACT_VERSION = '1.0';

/** What a failing pair costs. `text` is 4.5:1, `ui` and `large-text` are 3:1. */
export type ContrastTier = 'text' | 'large-text' | 'ui' | 'none';

export interface SemanticTokenSpec {
  /** CSS custom property, verbatim. */
  name: string;
  /** Dotted path inside a theme's `color` object. */
  path: string;
  group: 'bg' | 'border' | 'text' | 'brand' | 'accent' | 'status' | 'chart' | 'misc';
  /** Where to use it. If this sentence needs an "or", the token is doing two jobs. */
  role: string;
  /**
   * `required` — a theme without it is invalid; the validator fails.
   * `optional` — the library falls back to the default theme's value.
   */
  requirement: 'required' | 'optional';
  /** `true` when the value is not a plain hex (alpha colours, rgb triples). */
  nonHex?: boolean;
}

/**
 * A text-on-background pair the library actually renders. The validator checks
 * every one of these against every theme — this list is what "the library's
 * contrast is verified" means concretely.
 */
export interface ContrastPairSpec {
  /** Dotted path of the foreground. */
  foreground: string;
  /** Dotted path of the background. */
  background: string;
  tier: ContrastTier;
  /** Where this pair shows up, so a failure message can name a component. */
  where: string;
  /** Set when the pair is derived rather than semantic. */
  derived?: boolean;
}

// ---------------------------------------------------------------------------
// Semantic tokens — the list a product fills in.
// ---------------------------------------------------------------------------

export const SEMANTIC_TOKENS: readonly SemanticTokenSpec[] = [
  // --- canvas and surfaces -------------------------------------------------
  {
    name: '--tree-color-bg-primary',
    path: 'bg.primary',
    group: 'bg',
    role: 'The page canvas, behind everything else.',
    requirement: 'required',
  },
  {
    name: '--tree-color-bg-surface',
    path: 'bg.surface',
    group: 'bg',
    role: 'A raised surface sitting on the canvas: card, modal, popover, table head.',
    requirement: 'required',
  },
  {
    name: '--tree-color-bg-subtle',
    path: 'bg.subtle',
    group: 'bg',
    role: 'A recessed or quiet band inside a surface: inset card, code block, disabled field.',
    requirement: 'required',
  },

  // --- borders -------------------------------------------------------------
  {
    name: '--tree-color-border-default',
    path: 'border.default',
    group: 'border',
    role: 'Decorative edges — card outline, divider, table rule. Not a control boundary.',
    requirement: 'required',
  },
  {
    name: '--tree-color-border-strong',
    path: 'border.strong',
    group: 'border',
    role: 'An emphasised decorative edge, and the hover edge of a quiet control.',
    requirement: 'required',
  },
  {
    name: '--tree-color-border-interactive',
    path: 'border.interactive',
    group: 'border',
    role:
      'The boundary that identifies a form control (input, select, checkbox, radio). ' +
      'Must clear 3:1 on every surface — WCAG 1.4.11. Derived when omitted.',
    requirement: 'optional',
  },

  // --- text ----------------------------------------------------------------
  {
    name: '--tree-color-text-primary',
    path: 'text.primary',
    group: 'text',
    role: 'Body and heading ink on any bg.* surface.',
    requirement: 'required',
  },
  {
    name: '--tree-color-text-muted',
    path: 'text.muted',
    group: 'text',
    role: 'Secondary ink: help text, captions, placeholders. Still passes AA.',
    requirement: 'required',
  },
  {
    name: '--tree-color-text-inverse',
    path: 'text.inverse',
    group: 'text',
    role:
      'Ink for a surface that inverts the theme. NOT the ink for a brand fill — ' +
      'that is brand.contrast, which is computed per theme.',
    requirement: 'required',
  },

  // --- brand ---------------------------------------------------------------
  {
    name: '--tree-color-brand-primary',
    path: 'brand.primary',
    group: 'brand',
    role: 'The product accent: primary action fill, active nav, focus emphasis, links.',
    requirement: 'required',
  },
  {
    name: '--tree-color-brand-hover',
    path: 'brand.hover',
    group: 'brand',
    role:
      'Hover fill for a solid brand surface. Public for compatibility; new state ' +
      'tokens are derived. Seeding a theme computes this for you.',
    requirement: 'optional',
  },
  {
    name: '--tree-color-brand-soft',
    path: 'brand.soft',
    group: 'brand',
    role: 'Brand tint: soft button, selected row, badge background. Carries brand ink.',
    requirement: 'required',
  },
  {
    name: '--tree-color-brand-contrast',
    path: 'brand.contrast',
    group: 'brand',
    role:
      'Ink ON a solid brand fill. Computed per theme by whichever of black/white ' +
      'reads better on that accent — never hardcoded in a component.',
    requirement: 'required',
  },

  // --- secondary accent ----------------------------------------------------
  {
    name: '--tree-color-accent-primary',
    path: 'accent.primary',
    group: 'accent',
    role: 'Secondary accent, for surfaces that need a second voice next to brand.',
    requirement: 'optional',
  },
  {
    name: '--tree-color-accent-hover',
    path: 'accent.hover',
    group: 'accent',
    role: 'Hover fill for a solid secondary-accent surface.',
    requirement: 'optional',
  },
  {
    name: '--tree-color-accent-soft',
    path: 'accent.soft',
    group: 'accent',
    role: 'Secondary-accent tint. Carries accent ink.',
    requirement: 'optional',
  },
  {
    name: '--tree-color-accent-contrast',
    path: 'accent.contrast',
    group: 'accent',
    role: 'Ink ON a solid secondary-accent fill. Computed per theme.',
    requirement: 'optional',
  },

  // --- status --------------------------------------------------------------
  {
    name: '--tree-color-status-success',
    path: 'status.success',
    group: 'status',
    role: 'Confirmed / healthy. Independent of brand — do not remap it to the accent.',
    requirement: 'required',
  },
  {
    name: '--tree-color-status-warning',
    path: 'status.warning',
    group: 'status',
    role: 'Needs attention, not yet broken.',
    requirement: 'required',
  },
  {
    name: '--tree-color-status-error',
    path: 'status.error',
    group: 'status',
    role: 'Failed / destructive. Also the ink for validation messages.',
    requirement: 'required',
  },
  {
    name: '--tree-color-status-info',
    path: 'status.info',
    group: 'status',
    role:
      'Neutral information. Ships equal to brand.primary in the default theme; a ' +
      'product with a non-blue accent should set this so info stays distinguishable.',
    requirement: 'required',
  },

  // --- data viz ------------------------------------------------------------
  ...Array.from({ length: 8 }, (_, index) => {
    const position = index + 1;

    return {
      name: `--tree-color-chart-${position}`,
      path: `chart.${position}`,
      group: 'chart' as const,
      role: `Categorical series ${position}. Fixed hue order; assign in sequence.`,
      requirement: 'optional' as const,
    };
  }),

  // --- misc ----------------------------------------------------------------
  {
    name: '--tree-color-overlay',
    path: 'overlay',
    group: 'misc',
    role: 'Scrim behind a modal or drawer. Carries alpha.',
    requirement: 'required',
    nonHex: true,
  },
  {
    name: '--tree-color-focus-ring',
    path: 'focus-ring',
    group: 'misc',
    role: 'The focus indicator. Carries alpha; width is --tree-focus-ring-width.',
    requirement: 'required',
    nonHex: true,
  },
  {
    name: '--tree-color-shadow-rgb',
    path: 'shadow-rgb',
    group: 'misc',
    role: 'Umbra as an "r, g, b" triple. The elevation scale varies alpha over it.',
    requirement: 'optional',
    nonHex: true,
  },
] as const;

/** Semantic tokens a theme cannot omit. */
export const REQUIRED_TOKENS = SEMANTIC_TOKENS.filter(
  (token) => token.requirement === 'required',
);

// ---------------------------------------------------------------------------
// Derived tokens — private. Listed so the validator can prove they exist and so
// products can be told, precisely, what not to override.
// ---------------------------------------------------------------------------

export const DERIVED_TOKEN_PATTERNS: readonly { pattern: string; role: string }[] = [
  { pattern: '--tree-color-{brand,accent}-press', role: 'Pressed solid fill.' },
  { pattern: '--tree-color-{brand,accent}-soft-hover', role: 'Hovered tint surface.' },
  { pattern: '--tree-color-{brand,accent}-soft-press', role: 'Pressed tint surface.' },
  { pattern: '--tree-color-status-<s>-hover', role: 'Hovered solid status fill.' },
  { pattern: '--tree-color-status-<s>-press', role: 'Pressed solid status fill.' },
  { pattern: '--tree-color-status-<s>-soft', role: 'Status tint (was a 14% color-mix).' },
  { pattern: '--tree-color-status-<s>-soft-hover', role: 'Hovered status tint.' },
  { pattern: '--tree-color-status-<s>-border', role: 'Status edge (was a 36% color-mix).' },
  { pattern: '--tree-color-status-<s>-contrast', role: 'Computed ink on a solid status fill.' },
  { pattern: '--tree-color-status-<s>-on-soft', role: 'Computed ink on a status tint.' },
  { pattern: '--tree-color-state-hover-bg', role: 'Neutral hover surface (row, menu item).' },
  { pattern: '--tree-color-state-press-bg', role: 'Neutral pressed surface.' },
  { pattern: '--tree-color-state-selected-bg', role: 'Selected surface.' },
  { pattern: '--tree-color-state-selected-fg', role: 'Ink on a selected surface.' },
  { pattern: '--tree-color-state-selected-border', role: 'Edge of a selected item.' },
  { pattern: '--tree-color-state-disabled-bg', role: 'Inactive control surface.' },
  { pattern: '--tree-color-state-disabled-fg', role: 'Inactive control ink, held at 3:1.' },
  { pattern: '--tree-color-state-disabled-border', role: 'Inactive control edge.' },
];

// ---------------------------------------------------------------------------
// Contrast pairs the library renders. The validator checks all of them.
// ---------------------------------------------------------------------------

const onEverySurface = (
  foreground: string,
  tier: ContrastTier,
  where: string,
  derived = false,
): ContrastPairSpec[] =>
  ['bg.primary', 'bg.surface', 'bg.subtle'].map((background) => ({
    foreground,
    background,
    tier,
    where,
    derived,
  }));

export const CONTRAST_PAIRS: readonly ContrastPairSpec[] = [
  ...onEverySurface('text.primary', 'text', 'Body copy and headings'),
  ...onEverySurface('text.muted', 'text', 'Help text, captions, placeholders'),
  ...onEverySurface('brand.primary', 'text', 'Links and quiet brand actions'),
  ...onEverySurface('status.error', 'text', 'Validation messages'),
  ...onEverySurface('status.success', 'text', 'Success messages'),
  ...onEverySurface('status.warning', 'text', 'Warning messages'),
  ...onEverySurface('status.info', 'text', 'Informational messages'),

  {
    foreground: 'brand.contrast',
    background: 'brand.primary',
    tier: 'text',
    where: 'Label on a solid primary button',
  },
  {
    foreground: 'brand.contrast',
    background: 'brand.hover',
    tier: 'text',
    where: 'Label on a hovered primary button',
  },
  {
    foreground: 'accent.contrast',
    background: 'accent.primary',
    tier: 'text',
    where: 'Label on a solid secondary-accent surface',
  },

  // Control boundaries — the 1.4.11 tier.
  ...onEverySurface('border.interactive', 'ui', 'Input, select, checkbox and radio edges'),

  // Derived states. A state you cannot see is a state that does not exist.
  {
    foreground: 'brand.contrast',
    background: 'brand.press',
    tier: 'text',
    where: 'Label on a pressed primary button',
    derived: true,
  },
  // Tint surfaces are checked against the ink the library pairs with them, not
  // against `*.primary`. The ink moves with the tint — see `familyStates`.
  ...(['brand', 'accent'] as const).flatMap((family): ContrastPairSpec[] => [
    {
      foreground: `${family}.on-soft`,
      background: `${family}.soft`,
      tier: 'text',
      where: `Label on a soft ${family} button, selected nav item, ${family} badge`,
      derived: true,
    },
    {
      foreground: `${family}.on-soft-hover`,
      background: `${family}.soft-hover`,
      tier: 'text',
      where: `Label on a hovered soft ${family} button`,
      derived: true,
    },
    {
      foreground: `${family}.on-soft-press`,
      background: `${family}.soft-press`,
      tier: 'text',
      where: `Label on a pressed soft ${family} button`,
      derived: true,
    },
  ]),
  {
    foreground: 'state.selected-fg',
    background: 'state.selected-bg',
    tier: 'text',
    where: 'Label on a selected row or nav item',
    derived: true,
  },
  {
    foreground: 'text.primary',
    background: 'state.hover-bg',
    tier: 'text',
    where: 'Label on a hovered menu item or table row',
    derived: true,
  },
  {
    foreground: 'text.primary',
    background: 'state.press-bg',
    tier: 'text',
    where: 'Label on a pressed menu item or table row',
    derived: true,
  },
  {
    // WCAG 1.4.3 exempts inactive controls from the 4.5:1 floor. It is held to
    // the 3:1 UI tier anyway: `opacity: 0.5` on muted text measured about
    // 2.2:1 effective, which is not "de-emphasised", it is unreadable.
    foreground: 'state.disabled-fg',
    background: 'state.disabled-bg',
    tier: 'ui',
    where: 'Label of a disabled control',
    derived: true,
  },
  ...(['success', 'warning', 'error', 'info'] as const).flatMap(
    (status): ContrastPairSpec[] => [
      {
        foreground: `status.${status}-contrast`,
        background: `status.${status}`,
        tier: 'text',
        where: `Label on a solid ${status} fill (badge, toast, solid button)`,
        derived: true,
      },
      {
        foreground: `status.${status}-on-soft`,
        background: `status.${status}-soft`,
        tier: 'text',
        where: `Label on a soft ${status} alert or badge`,
        derived: true,
      },
      {
        foreground: `status.${status}-border`,
        background: `status.${status}-soft`,
        tier: 'ui',
        where: `Edge of a soft ${status} alert`,
        derived: true,
      },
    ],
  ),
];

/**
 * State pairs that must be visibly different from their base. Without this a
 * theme can pass every contrast check and still have a hover you cannot see —
 * which is what shipped: the button's only hover feedback was a 1px lift.
 */
export interface StateDistinctionSpec {
  state: string;
  base: string;
  /** Minimum WCAG contrast between the two. 1.0 means identical. */
  minRatio: number;
  where: string;
}

/**
 * 1.12:1 is deliberately low. It is not a legibility threshold — it is the
 * point below which a fill change stops being perceivable next to its own base
 * on a normal display.
 */
const MIN_STATE_DELTA = 1.12;

export const STATE_DISTINCTIONS: readonly StateDistinctionSpec[] = [
  { state: 'brand.hover', base: 'brand.primary', minRatio: MIN_STATE_DELTA, where: 'Primary button hover' },
  { state: 'brand.press', base: 'brand.primary', minRatio: MIN_STATE_DELTA, where: 'Primary button press' },
  { state: 'brand.press', base: 'brand.hover', minRatio: 1.05, where: 'Press vs hover on a primary button' },
  { state: 'brand.soft-hover', base: 'brand.soft', minRatio: 1.04, where: 'Soft brand button hover' },
  { state: 'accent.press', base: 'accent.primary', minRatio: MIN_STATE_DELTA, where: 'Secondary-accent press' },
  { state: 'state.hover-bg', base: 'bg.surface', minRatio: 1.04, where: 'Menu item / table row hover' },
  { state: 'state.press-bg', base: 'state.hover-bg', minRatio: 1.04, where: 'Row press vs row hover' },
  { state: 'state.disabled-bg', base: 'bg.surface', minRatio: 1.04, where: 'Disabled control vs surface' },
];
