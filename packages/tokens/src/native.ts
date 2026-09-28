/**
 * Native token emission — the portable form of the token layer.
 *
 * `css.ts` renders the token model as custom properties, which is the only form
 * a browser can consume. Compose and egui have neither custom properties nor
 * `rem`, `var()` or `color-mix()`: they need numbers and colours. This file is
 * the second renderer of the same model, and it does the work the CSS renderer
 * leaves for the browser.
 *
 * Three rules keep the renderers honest:
 *
 *   1. **Nothing here is a value.** Every number and colour below is READ from
 *      the CSS renderer's own output or from `themeDeclarations`. A literal in
 *      this file would be a fork of the design system.
 *   2. **Every `--tree-*` property is accounted for.** A token is either
 *      resolved into the native model or listed in `WEB_ONLY` with a reason;
 *      `native.test.ts` fails the build on a token that is neither, so a new
 *      token cannot ship to the web and silently skip the other ecosystems.
 *   3. **The derivation stays in TypeScript.** `states.ts` computes hover,
 *      press, selected and disabled once, for every ecosystem. The ports carry
 *      the *result* as generated source, so there is no second implementation
 *      of a contrast rule that could drift from this one.
 *
 * Keys are the token's CSS custom property minus the `--tree-` prefix
 * (`font-size-md`, `color-bg-primary`). That name is the contract — see
 * `contract.ts`, whose `SEMANTIC_TOKENS[].name` uses the same spelling — so the
 * native model can be compared to the stylesheet key by key. Emitters turn
 * those names into whatever their language calls idiomatic.
 */

import { parseHex } from './color';
import { createFoundationCss, themeDeclarations } from './css';
import { CONTRACT_VERSION } from './contract';
import { treeThemes, type TreeThemeName } from './tokens';
import {
  treeAccents,
  treeActionTones,
  treeBadgeTones,
  treeBreakpoints,
  treeCardVariants,
  treeDeprecatedVariants,
  treeDrawerSides,
  treeFieldWidths,
  treeSizes,
  treeTooltipSides,
  treeVariants,
} from './vocabulary';
import type { ColorMode, SemanticColorInput } from './states';

/**
 * The root font size every `rem` in the token model is resolved against.
 *
 * 16px is the CSS initial value and the token model is authored against it, so
 * this is a restatement of the browser default rather than a choice. One `rem`
 * therefore lands on one Compose `dp` and one egui point, which is the mapping
 * both frameworks already use for "a CSS pixel".
 */
export const ROOT_FONT_SIZE_PX = 16;

/** A resolved colour. Channels are 8-bit; alpha is 0..1. */
export interface NativeRgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** One layer of a box shadow, with its colour already composited. */
export interface NativeShadowLayer {
  offsetXPx: number;
  offsetYPx: number;
  blurPx: number;
  spreadPx: number;
  color: NativeRgba;
}

/** A cubic-bezier timing function as its four control values. */
export interface NativeEasing {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface NativeGradientStop {
  color: NativeRgba;
  /** Explicit stop position in percent, or `null` when the gradient spaces them evenly. */
  positionPct: number | null;
}

export interface NativeGradient {
  angleDeg: number;
  stops: NativeGradientStop[];
}

/**
 * One theme, fully resolved: the semantic layer a product fills in, the states
 * `states.ts` derives from it, and the two token groups that can only be
 * resolved once a theme is known because their CSS refers to theme variables.
 */
export interface NativeThemePalette {
  mode: ColorMode;
  color: Record<string, NativeRgba>;
  shadow: Record<string, NativeShadowLayer[]>;
  gradient: Record<string, NativeGradient>;
}

/**
 * The whole token layer as numbers, colours and strings.
 *
 * Grouped by TYPE rather than by name, because that is the split every target
 * language needs: Compose wants `Dp` for a length and `TextUnit` for a font
 * size, egui wants `f32` points for both, and neither can be told apart from
 * the name alone.
 */
export interface NativeTokens {
  contractVersion: string;
  rootFontSizePx: number;
  /** Font stacks, split into their families in declared order. */
  fontFamily: Record<string, string[]>;
  /** Font sizes in px. Scale with the platform's text-size setting — `sp`, not `dp`. */
  fontSizePx: Record<string, number>;
  fontWeight: Record<string, number>;
  /** Unitless multipliers of the font size. */
  lineHeight: Record<string, number>;
  /** Letter spacing as a multiple of the font size (CSS `em`). */
  trackingEm: Record<string, number>;
  /** Everything measured in px: spacing, radii, control and icon sizes, borders, layout, breakpoints. */
  lengthPx: Record<string, number>;
  opacity: Record<string, number>;
  durationMs: Record<string, number>;
  easing: Record<string, NativeEasing>;
  zIndex: Record<string, number>;
  /** Unitless counts, such as the layout grid's column count. */
  count: Record<string, number>;
  themes: Record<TreeThemeName, NativeThemePalette>;
}

/**
 * Tokens that stay on the web, and why.
 *
 * The escape hatch for a property that is genuinely a browser mechanism rather
 * than a design decision. It is empty on purpose: every token shipped so far
 * carries a value the other ecosystems can honour, and an entry here is a claim
 * that has to be argued, not a place to park an unresolved parse.
 */
export const WEB_ONLY: Readonly<Record<string, string>> = Object.freeze({});

// --- parsing ---------------------------------------------------------------

const fail = (token: string, value: string, what: string): never => {
  throw new Error(
    `Token "--tree-${token}" ${what}: "${value}". Resolve it in native.ts or list it in WEB_ONLY with a reason.`,
  );
};

const toNumber = (raw: string, token: string, value: string): number => {
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) fail(token, value, 'is not numeric');
  return parsed;
};

/** `rem` and `px` resolve to px; a bare number is already px. Anything else is a hole. */
export const parseLengthPx = (value: string, token: string): number => {
  const raw = value.trim();
  if (raw.endsWith('rem')) return toNumber(raw, token, value) * ROOT_FONT_SIZE_PX;
  if (raw.endsWith('px')) return toNumber(raw, token, value);
  if (/^-?\d*\.?\d+$/.test(raw)) return toNumber(raw, token, value);
  return fail(token, value, 'carries a unit the native model cannot resolve');
};

const RGB_FUNCTION = /^rgba?\(([^)]*)\)$/;

/** `#rrggbb`, `rgb()`, `rgba()` and `transparent`. */
export const parseColor = (value: string, token: string): NativeRgba => {
  const raw = value.trim();

  if (raw === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

  if (raw.startsWith('#')) {
    const { r, g, b } = parseHex(raw);
    return { r, g, b, a: 1 };
  }

  const fn = RGB_FUNCTION.exec(raw);
  if (fn) {
    const parts = fn[1]
      .split(/[,/]/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length === 3 || parts.length === 4) {
      return {
        r: Math.round(toNumber(parts[0], token, value)),
        g: Math.round(toNumber(parts[1], token, value)),
        b: Math.round(toNumber(parts[2], token, value)),
        a: parts.length === 4 ? toNumber(parts[3], token, value) : 1,
      };
    }
  }

  return fail(token, value, 'is not a colour the native model can resolve');
};

/**
 * Split on a separator that is not inside parentheses.
 *
 * `0 1px 2px rgba(15, 23, 42, 0.06)` is one shadow layer containing three
 * commas, so a plain `split(',')` reads it as four.
 */
const splitTopLevel = (value: string, separator: ',' | ' '): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of value) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;

    if (depth === 0 && (char === separator || (separator === ' ' && /\s/.test(char)))) {
      if (current.trim()) parts.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) parts.push(current.trim());

  return parts;
};

/**
 * Substitute `var(--tree-*)` with the raw value the theme gives it.
 *
 * Only the foundation tokens need this, and only for the two groups whose CSS
 * refers to the theme: the elevation scale reads the umbra triple, and the
 * brand gradient reads the brand pair.
 */
const resolveVars = (value: string, raw: Record<string, string>, token: string): string =>
  value.replace(/var\(--tree-([a-zA-Z0-9-]+)\)/g, (_, name: string) => {
    const resolved = raw[name];
    if (resolved === undefined) {
      fail(token, value, `refers to --tree-${name}, which this theme does not define`);
    }
    return resolved;
  });

const COLOR_MIX = /^color-mix\(\s*in\s+srgb\s*,\s*(.+?)\s+([\d.]+)%\s*,\s*(.+?)\s*\)$/;

/**
 * Resolve the one `color-mix()` shape the token model uses: a colour at a
 * percentage over `transparent`, which is an alpha, and over another colour,
 * which is a blend.
 */
const resolveColorMix = (value: string, token: string): string => {
  const mix = COLOR_MIX.exec(value.trim());
  if (!mix) return value;

  const [, first, percent, second] = mix;
  const weight = toNumber(percent, token, value) / 100;
  const a = parseColor(first, token);

  if (second.trim() === 'transparent') {
    return `rgba(${a.r}, ${a.g}, ${a.b}, ${Number((a.a * weight).toFixed(4))})`;
  }

  const b = parseColor(second, token);
  const blend = (x: number, y: number) => Math.round(x * weight + y * (1 - weight));

  return `rgba(${blend(a.r, b.r)}, ${blend(a.g, b.g)}, ${blend(a.b, b.b)}, ${Number(
    (a.a * weight + b.a * (1 - weight)).toFixed(4),
  )})`;
};

const parseShadow = (
  value: string,
  raw: Record<string, string>,
  token: string,
): NativeShadowLayer[] =>
  splitTopLevel(resolveVars(value, raw, token), ',').map((layer) => {
    const parts = splitTopLevel(layer, ' ');
    const colorIndex = parts.findIndex(
      (part) => part.startsWith('#') || part.startsWith('rgb') || part.startsWith('color-mix') || part === 'transparent',
    );

    if (colorIndex < 2) fail(token, layer, 'is not a box-shadow the native model can resolve');

    const lengths = parts.slice(0, colorIndex).map((part) => parseLengthPx(part, token));
    const color = parseColor(resolveColorMix(parts.slice(colorIndex).join(' '), token), token);

    return {
      offsetXPx: lengths[0],
      offsetYPx: lengths[1],
      blurPx: lengths[2] ?? 0,
      spreadPx: lengths[3] ?? 0,
      color,
    };
  });

const LINEAR_GRADIENT = /^linear-gradient\((.*)\)$/s;

const parseGradient = (
  value: string,
  raw: Record<string, string>,
  token: string,
): NativeGradient => {
  const match = LINEAR_GRADIENT.exec(resolveVars(value, raw, token).trim());
  if (!match) fail(token, value, 'is not a linear-gradient the native model can resolve');

  const parts = splitTopLevel(match![1], ',');
  const first = parts[0] ?? '';
  const hasAngle = first.endsWith('deg');
  const angleDeg = hasAngle ? toNumber(first, token, value) : 180;

  const stops = (hasAngle ? parts.slice(1) : parts).map((stop) => {
    const pieces = splitTopLevel(stop, ' ');
    const positionPct = pieces.length > 1 ? toNumber(pieces[1], token, value) : null;
    return { color: parseColor(resolveColorMix(pieces[0], token), token), positionPct };
  });

  if (stops.length < 2) fail(token, value, 'is a gradient with fewer than two stops');

  return { angleDeg, stops };
};

// --- the model -------------------------------------------------------------

const PREFIX = '--tree-';

/**
 * The foundation tokens exactly as the stylesheet emits them.
 *
 * Read back out of `createFoundationCss()` rather than off `treeTokens`, so the
 * native model is provably derived from the same declarations the web ships: a
 * token that reaches the stylesheet cannot fail to reach this list.
 */
const foundationEntries = (): Array<[string, string]> =>
  createFoundationCss()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith(PREFIX))
    .map((line) => {
      const colon = line.indexOf(':');
      return [
        line.slice(PREFIX.length, colon).trim(),
        line.slice(colon + 1).replace(/;$/, '').trim(),
      ] as [string, string];
    });

/** The umbra triple is `r, g, b` rather than a colour, so it parses on its own path. */
const SHADOW_RGB = 'color-shadow-rgb';

const themePalette = (
  color: SemanticColorInput,
  mode: ColorMode,
  foundation: Array<[string, string]>,
): NativeThemePalette => {
  const raw: Record<string, string> = {};
  const resolved: Record<string, NativeRgba> = {};

  for (const [name, value] of themeDeclarations(color, mode)) {
    const token = name.slice(PREFIX.length);
    const text = String(value);
    raw[token] = text;
    resolved[token] =
      token === SHADOW_RGB ? parseColor(`rgb(${text})`, token) : parseColor(text, token);
  }

  const shadow: Record<string, NativeShadowLayer[]> = {};
  const gradient: Record<string, NativeGradient> = {};

  for (const [token, value] of foundation) {
    if (token.startsWith('shadow-')) shadow[token] = parseShadow(value, raw, token);
    if (token.startsWith('gradient-')) gradient[token] = parseGradient(value, raw, token);
  }

  return { mode, color: resolved, shadow, gradient };
};

/** A font stack as its families, unquoted, in declared order. */
const parseFontStack = (value: string): string[] =>
  splitTopLevel(value, ',').map((family) => family.trim().replace(/^['"]|['"]$/g, ''));

/**
 * The whole token layer, resolved.
 *
 * Throws on a token it cannot resolve rather than dropping it: a silently
 * missing token is a component in another ecosystem quietly rendering a
 * hardcoded fallback, which is the failure this whole file exists to prevent.
 */
export const resolveNativeTokens = (): NativeTokens => {
  const foundation = foundationEntries();

  const tokens: NativeTokens = {
    contractVersion: CONTRACT_VERSION,
    rootFontSizePx: ROOT_FONT_SIZE_PX,
    fontFamily: {},
    fontSizePx: {},
    fontWeight: {},
    lineHeight: {},
    trackingEm: {},
    lengthPx: {},
    opacity: {},
    durationMs: {},
    easing: {},
    zIndex: {},
    count: {},
    themes: {
      light: themePalette(
        treeThemes.light.color as unknown as SemanticColorInput,
        'light',
        foundation,
      ),
      dark: themePalette(
        treeThemes.dark.color as unknown as SemanticColorInput,
        'dark',
        foundation,
      ),
    },
  };

  for (const [token, value] of foundation) {
    if (token in WEB_ONLY) continue;

    // Resolved per theme, above.
    if (token.startsWith('shadow-') || token.startsWith('gradient-')) continue;

    if (token.startsWith('font-family-')) {
      tokens.fontFamily[token] = parseFontStack(value);
    } else if (token.startsWith('font-size-')) {
      tokens.fontSizePx[token] = parseLengthPx(value, token);
    } else if (token.startsWith('font-weight-')) {
      tokens.fontWeight[token] = Math.round(toNumber(value, token, value));
    } else if (token.startsWith('font-lineHeight-')) {
      tokens.lineHeight[token] = toNumber(value, token, value);
    } else if (token.startsWith('font-tracking-')) {
      if (!value.trim().endsWith('em')) fail(token, value, 'is not expressed in em');
      tokens.trackingEm[token] = toNumber(value, token, value);
    } else if (token.startsWith('opacity-')) {
      tokens.opacity[token] = toNumber(value, token, value);
    } else if (token.startsWith('motion-duration-')) {
      if (!value.trim().endsWith('ms')) fail(token, value, 'is not expressed in ms');
      tokens.durationMs[token] = toNumber(value, token, value);
    } else if (token.startsWith('motion-easing-')) {
      const bezier = /^cubic-bezier\(([^)]*)\)$/.exec(value.trim());
      if (!bezier) fail(token, value, 'is not a cubic-bezier');
      const [x1, y1, x2, y2] = bezier![1].split(',').map((part) => toNumber(part, token, value));
      tokens.easing[token] = { x1, y1, x2, y2 };
    } else if (token.startsWith('z-')) {
      tokens.zIndex[token] = Math.round(toNumber(value, token, value));
    } else if (token === 'layout-grid-columns') {
      tokens.count[token] = Math.round(toNumber(value, token, value));
    } else {
      // Spacing, radii, control and icon sizes, border widths, layout and
      // breakpoints are all lengths, and a length is the only kind of token
      // left. A new group that is not one lands here and throws.
      tokens.lengthPx[token] = parseLengthPx(value, token);
    }
  }

  return tokens;
};

// --- parity ----------------------------------------------------------------

export interface NativeParityReport {
  /** Every `--tree-*` property the stylesheet emits, minus the prefix. */
  emitted: string[];
  /** Those the native model resolves. */
  resolved: string[];
  /** Those deliberately left on the web, with the reason. */
  webOnly: Record<string, string>;
  /** Those that are neither — the holes a build must fail on. */
  missing: string[];
}

/**
 * Compare the stylesheet's variables with the native model's keys.
 *
 * This is the gate that makes a second ecosystem safe to ship: adding a token
 * to `tokens.ts` without teaching this file how to resolve it turns the Compose
 * and egui packages into stale copies, and a stale copy of a design system is
 * worse than no copy — it looks authoritative.
 */
export const nativeParityReport = (): NativeParityReport => {
  const tokens = resolveNativeTokens();
  const emitted = foundationEntries().map(([token]) => token);

  const light = tokens.themes.light;
  const resolved = new Set<string>([
    ...Object.keys(tokens.fontFamily),
    ...Object.keys(tokens.fontSizePx),
    ...Object.keys(tokens.fontWeight),
    ...Object.keys(tokens.lineHeight),
    ...Object.keys(tokens.trackingEm),
    ...Object.keys(tokens.lengthPx),
    ...Object.keys(tokens.opacity),
    ...Object.keys(tokens.durationMs),
    ...Object.keys(tokens.easing),
    ...Object.keys(tokens.zIndex),
    ...Object.keys(tokens.count),
    ...Object.keys(light.shadow),
    ...Object.keys(light.gradient),
    ...Object.keys(light.color),
  ]);

  return {
    emitted,
    resolved: [...resolved].sort(),
    webOnly: WEB_ONLY,
    missing: emitted.filter((token) => !resolved.has(token) && !(token in WEB_ONLY)),
  };
};

// --- grouping --------------------------------------------------------------

/**
 * How the flat token names are shaped into the nested namespaces an emitter
 * declares.
 *
 * Shared by `kotlin.ts` and `rust.ts` so the two ports cannot disagree about
 * which tokens belong together, while each still spells the group the way its
 * language does: `name` is the group as lowercase words, and the emitters join
 * them into `ControlSize` or `control_size`.
 *
 * The TYPE of a token is deliberately absent — it is read from the resolved
 * model, which already classified it. This table decides names only.
 *
 * It is exhaustive by construction: both emitters throw on a foundation token
 * no group claims, so a new token group cannot reach the stylesheet and quietly
 * skip the other ecosystems.
 */
export interface NativeTokenGroup {
  /** The token-name prefix this group owns, including its trailing hyphen. */
  prefix: string;
  /** The group name as lowercase words, for the emitter to join. */
  name: string[];
  /** The group's documentation sentence, shared by both ports. */
  doc: string;
  /**
   * The letter a purely numeric step takes, since no target language allows an
   * identifier to start with a digit. Only the numeric scales declare one; a
   * group that needs one and has not declared it throws.
   */
  numericPrefix?: string;
}

export const NATIVE_TOKEN_GROUPS: readonly NativeTokenGroup[] = [
  {
    prefix: 'font-family-',
    name: ['font', 'family'],
    doc: 'Font stacks, most preferred family first.',
  },
  {
    prefix: 'font-size-',
    name: ['font', 'size'],
    doc: 'Type scale. These follow the reader’s text-size setting — scalable pixels, not device-independent ones.',
  },
  {
    prefix: 'font-weight-',
    name: ['font', 'weight'],
    doc: 'CSS numeric weights, which every target maps 1:1.',
  },
  {
    prefix: 'font-lineHeight-',
    name: ['line', 'height'],
    doc: 'Unitless multipliers of the font size.',
  },
  {
    prefix: 'font-tracking-',
    name: ['tracking'],
    doc: 'Letter spacing as a multiple of the font size (CSS `em`).',
  },
  { prefix: 'space-', name: ['space'], doc: 'Spacing scale, in pixels.', numericPrefix: 's' },
  { prefix: 'radius-', name: ['radius'], doc: 'Corner radii, in pixels.' },
  {
    prefix: 'size-control-',
    name: ['control', 'size'],
    doc: 'Control heights, in pixels — one per size step.',
  },
  { prefix: 'size-icon-', name: ['icon', 'size'], doc: 'Icon box sizes, in pixels.' },
  { prefix: 'border-width-', name: ['border', 'width'], doc: 'Stroke widths, in pixels.' },
  { prefix: 'layout-gutter-', name: ['gutter'], doc: 'Grid gutters, in pixels.' },
  { prefix: 'layout-margin-', name: ['margin'], doc: 'Page margins, in pixels.' },
  {
    prefix: 'layout-grid-',
    name: ['grid'],
    doc: 'The layout grid itself: its column count and its base unit.',
  },
  { prefix: 'breakpoint-', name: ['breakpoint'], doc: 'Viewport widths, in pixels.' },
  {
    prefix: 'opacity-',
    name: ['opacity'],
    doc: 'The one opacity the system uses, for the parts of a disabled control that carry no text.',
  },
  {
    prefix: 'motion-duration-',
    name: ['duration'],
    doc: 'Animation durations, in milliseconds.',
  },
  {
    prefix: 'motion-easing-',
    name: ['easing'],
    doc: 'Cubic-bezier timing functions, as their four control values.',
  },
  {
    prefix: 'z-',
    name: ['z', 'index'],
    doc: 'Stacking order. A retained-mode target draws in declaration order, so these are the tie-break for overlay surfaces.',
  },
];

/**
 * Every foundation token key in the resolved model, in emission order.
 *
 * The emitters check their group coverage against this list; it is also what
 * makes "a token no group claims" a build failure rather than an omission.
 */
export const nativeFoundationKeys = (tokens: NativeTokens): string[] => [
  ...Object.keys(tokens.fontFamily),
  ...Object.keys(tokens.fontSizePx),
  ...Object.keys(tokens.fontWeight),
  ...Object.keys(tokens.lineHeight),
  ...Object.keys(tokens.trackingEm),
  ...Object.keys(tokens.lengthPx),
  ...Object.keys(tokens.opacity),
  ...Object.keys(tokens.durationMs),
  ...Object.keys(tokens.easing),
  ...Object.keys(tokens.zIndex),
  ...Object.keys(tokens.count),
];

// --- tones -----------------------------------------------------------------

/**
 * The colour axis for action surfaces, as data.
 *
 * `tone` is orthogonal to `variant`: the variant decides the SHAPE (filled,
 * outlined, quiet, tinted) and the tone decides WHICH colour set that shape
 * paints with. Splitting them is what makes a quiet destructive action
 * expressible — see `DECISIONS.md` -> "Variant Vocabulary".
 *
 * On the web that mapping lives in the stylesheet, as seven blocks of ten
 * custom-property assignments. A stylesheet is not a mapping the other
 * ecosystems can read, and re-typing seventy assignments per port is how three
 * implementations of one design decision start disagreeing. So the mapping is
 * declared here, once, and each emitter generates its own accessor from it.
 *
 * `tone-contract.test.ts` in `@treeui/vue` parses the shipped stylesheet and
 * asserts it agrees with this table, so the declaration cannot drift from the
 * CSS that is actually rendered.
 */
export const NATIVE_TONE_SLOTS = [
  /** The tone's solid fill, and its ink on the quiet variants. */
  'accent',
  'accent-hover',
  'accent-press',
  /** The tone's tint, for the `soft` variant. */
  'accent-soft',
  'accent-soft-hover',
  'accent-soft-press',
  /** Ink that clears AA on that tint — it deepens as the tint deepens. */
  'accent-on-soft',
  'accent-on-soft-hover',
  'accent-on-soft-press',
  /** Ink that clears AA on the solid fill. Computed per theme, never `text.inverse`. */
  'accent-contrast',
] as const;

export type NativeToneSlot = (typeof NATIVE_TONE_SLOTS)[number];

/**
 * The closed tone vocabulary, which IS `treeActionTones`.
 *
 * Aliased rather than restated so the tone table below and the enum the ports
 * generate cannot fall out of step with the vocabulary the web validates
 * against.
 */
export const NATIVE_TONE_NAMES = treeActionTones;

export type NativeToneName = (typeof NATIVE_TONE_NAMES)[number];

/**
 * What each tone MEANS, as opposed to which colours it resolves to.
 *
 * Declared here because both ports generate their enum from this table, and an
 * enum variant with no documentation is a closed vocabulary a caller has to
 * guess at. The Rust port's `missing_docs = "deny"` makes that a build failure
 * rather than a style opinion.
 */
export const NATIVE_TONE_DOCS: Readonly<Record<NativeToneName, string>> = {
  neutral: "The page's own ink rather than a hue — an action that makes no colour claim.",
  brand: 'The product\'s primary action. The default when no tone is set.',
  accent: 'The secondary brand accent: branded, without competing with the primary action.',
  success: 'A confirming action, or one whose outcome is a success state.',
  warning: 'An action that warrants a second look before it is taken.',
  danger:
    'A destructive action. It composes with every variant, so a destructive action can also be a quiet one.',
  info: 'An advisory action in a neutral, informational context.',
};

/**
 * Which palette colour each tone puts in each slot.
 *
 * Values are palette keys — the same `color-*` spelling the rest of this module
 * uses — so an emitter resolves them against whichever theme is in scope rather
 * than baking one theme's colours into the mapping.
 */
export const NATIVE_TONES: Readonly<
  Record<NativeToneName, Readonly<Record<NativeToneSlot, string>>>
> = {
  neutral: {
    'accent': 'color-text-primary',
    'accent-hover': 'color-text-primary',
    'accent-press': 'color-text-primary',
    'accent-soft': 'color-bg-subtle',
    'accent-soft-hover': 'color-state-hover-bg',
    'accent-soft-press': 'color-state-press-bg',
    'accent-on-soft': 'color-text-primary',
    'accent-on-soft-hover': 'color-text-primary',
    'accent-on-soft-press': 'color-text-primary',
    'accent-contrast': 'color-text-inverse',
  },
  brand: {
    'accent': 'color-brand-primary',
    'accent-hover': 'color-brand-hover',
    'accent-press': 'color-brand-press',
    'accent-soft': 'color-brand-soft',
    'accent-soft-hover': 'color-brand-soft-hover',
    'accent-soft-press': 'color-brand-soft-press',
    'accent-on-soft': 'color-brand-on-soft',
    'accent-on-soft-hover': 'color-brand-on-soft-hover',
    'accent-on-soft-press': 'color-brand-on-soft-press',
    'accent-contrast': 'color-brand-contrast',
  },
  accent: {
    'accent': 'color-accent-primary',
    'accent-hover': 'color-accent-hover',
    'accent-press': 'color-accent-press',
    'accent-soft': 'color-accent-soft',
    'accent-soft-hover': 'color-accent-soft-hover',
    'accent-soft-press': 'color-accent-soft-press',
    'accent-on-soft': 'color-accent-on-soft',
    'accent-on-soft-hover': 'color-accent-on-soft-hover',
    'accent-on-soft-press': 'color-accent-on-soft-press',
    'accent-contrast': 'color-accent-contrast',
  },
  success: {
    'accent': 'color-status-success',
    'accent-hover': 'color-status-success-hover',
    'accent-press': 'color-status-success-press',
    'accent-soft': 'color-status-success-soft',
    'accent-soft-hover': 'color-status-success-soft-hover',
    'accent-soft-press': 'color-status-success-soft-hover',
    'accent-on-soft': 'color-status-success-on-soft',
    'accent-on-soft-hover': 'color-status-success-on-soft-hover',
    'accent-on-soft-press': 'color-status-success-on-soft-hover',
    'accent-contrast': 'color-status-success-contrast',
  },
  warning: {
    'accent': 'color-status-warning',
    'accent-hover': 'color-status-warning-hover',
    'accent-press': 'color-status-warning-press',
    'accent-soft': 'color-status-warning-soft',
    'accent-soft-hover': 'color-status-warning-soft-hover',
    'accent-soft-press': 'color-status-warning-soft-hover',
    'accent-on-soft': 'color-status-warning-on-soft',
    'accent-on-soft-hover': 'color-status-warning-on-soft-hover',
    'accent-on-soft-press': 'color-status-warning-on-soft-hover',
    'accent-contrast': 'color-status-warning-contrast',
  },
  danger: {
    'accent': 'color-status-error',
    'accent-hover': 'color-status-error-hover',
    'accent-press': 'color-status-error-press',
    'accent-soft': 'color-status-error-soft',
    'accent-soft-hover': 'color-status-error-soft-hover',
    'accent-soft-press': 'color-status-error-soft-hover',
    'accent-on-soft': 'color-status-error-on-soft',
    'accent-on-soft-hover': 'color-status-error-on-soft-hover',
    'accent-on-soft-press': 'color-status-error-on-soft-hover',
    'accent-contrast': 'color-status-error-contrast',
  },
  info: {
    'accent': 'color-status-info',
    'accent-hover': 'color-status-info-hover',
    'accent-press': 'color-status-info-press',
    'accent-soft': 'color-status-info-soft',
    'accent-soft-hover': 'color-status-info-soft-hover',
    'accent-soft-press': 'color-status-info-soft-hover',
    'accent-on-soft': 'color-status-info-on-soft',
    'accent-on-soft-hover': 'color-status-info-on-soft-hover',
    'accent-on-soft-press': 'color-status-info-on-soft-hover',
    'accent-contrast': 'color-status-info-contrast',
  },
};

/**
 * Every tone's slots resolved against one palette.
 *
 * Throws on a slot whose palette key is missing, because a tone with a hole in
 * it is a component that will paint `transparent` somewhere and look like a
 * rendering bug rather than a missing token.
 */
export const resolveTone = (
  palette: NativeThemePalette,
  tone: NativeToneName,
): Record<NativeToneSlot, NativeRgba> => {
  const slots = NATIVE_TONES[tone];

  return Object.fromEntries(
    NATIVE_TONE_SLOTS.map((slot) => {
      const key = slots[slot];
      const color = palette.color[key];

      if (!color) {
        throw new Error(
          `Tone "${tone}" slot "${slot}" names --tree-${key}, which the ${palette.mode} palette does not define.`,
        );
      }

      return [slot, color];
    }),
  ) as Record<NativeToneSlot, NativeRgba>;
};

// --- vocabularies ----------------------------------------------------------

/**
 * One closed vocabulary, prepared for emission as an enum.
 *
 * `deprecated` members are left OUT of what the ports generate: a port built
 * today has no compatibility to keep, and reproducing a known mistake in a
 * second ecosystem to match the first is how a deprecation becomes permanent.
 * They stay in the vocabulary itself, because the web still resolves them.
 */
export interface NativeVocabulary {
  /** The generated type's name, as lowercase words for the emitter to join. */
  name: string[];
  /** Every member, in declared order. */
  members: readonly string[];
  /** Members the ports deliberately do not reproduce, and why. */
  deprecated: readonly string[];
  deprecationReason?: string;
  doc: string;
}

export const NATIVE_VOCABULARIES: readonly NativeVocabulary[] = [
  {
    name: ['size'],
    members: treeSizes,
    deprecated: [],
    doc: 'Size steps, shared by most components.',
  },
  {
    name: ['variant'],
    members: treeVariants,
    deprecated: treeDeprecatedVariants,
    deprecationReason:
      '`danger` is absent on purpose: it is a colour trapped in the shape scale, so it could only ever be a filled red button. Use `Solid` with `Tone::Danger`, which composes with the quiet variants too.',
    doc: 'Shape scale for an action surface. Orthogonal to its tone.',
  },
  {
    name: ['card', 'variant'],
    members: treeCardVariants,
    deprecated: [],
    doc: 'Surface scale for a card — not action variants. `solid` is deliberately absent.',
  },
  {
    name: ['badge', 'tone'],
    members: treeBadgeTones,
    deprecated: [],
    doc: 'Tone set for a component that states a status rather than offering an action. Narrower than `Tone`: no brand, no accent.',
  },
  {
    name: ['accent'],
    members: treeAccents,
    deprecated: [],
    doc: 'The accent axis a surface declares and its descendants inherit.',
  },
  {
    name: ['field', 'width'],
    members: treeFieldWidths,
    deprecated: [],
    doc: 'Inline-size scale for a form control. Controls fill their container by default.',
  },
  {
    name: ['tooltip', 'side'],
    members: treeTooltipSides,
    deprecated: [],
    doc: 'Placement for a tooltip, relative to its trigger.',
  },
  {
    name: ['drawer', 'side'],
    members: treeDrawerSides,
    deprecated: [],
    doc: 'Edge a drawer enters from.',
  },
  {
    name: ['breakpoint'],
    members: treeBreakpoints,
    deprecated: [],
    doc: 'Breakpoint names, paired with the `breakpoint-*` lengths.',
  },
];

/** The members a port reproduces: everything the vocabulary declares, minus its deprecations. */
export const nativeVocabularyMembers = (vocabulary: NativeVocabulary): string[] =>
  vocabulary.members.filter((member) => !vocabulary.deprecated.includes(member));

// --- badge tones -----------------------------------------------------------

/**
 * The tone axis for a component that STATES a status rather than offering an
 * action, as data.
 *
 * A second table, and a different shape from `NATIVE_TONES`: a badge has no
 * hover, no press and no tint ramp, so a tone does not resolve to ten
 * interaction colours — it resolves to a fill, an ink and an edge, per variant.
 * Declared here for the same reason the action tones are: on the web it exists
 * only as eleven custom properties in a base block plus four override blocks,
 * which is not something the other ecosystems can read, and re-typing twenty
 * cells per port is how the ports start disagreeing.
 *
 * `badge-tone-contract.test.ts` in `@treeui/vue` parses the shipped stylesheet
 * and asserts it agrees with this table.
 *
 * Two things worth knowing about the shape it describes:
 *
 * 1. There is no `.t-badge--tone-neutral` block. The base block IS neutral, and
 *    the four status blocks override a subset of it. This table resolves that
 *    inheritance, so `neutral` here is the base and every other tone is the
 *    base with its overrides already applied.
 * 2. `solid.text` is `color-brand-contrast` for EVERY tone, including the four
 *    status ones — no tone block overrides it. It currently measures 5.19:1 to
 *    8.13:1, so it passes, but it passes because the shipped status hues happen
 *    to be dark enough rather than by construction. The action tones do this
 *    properly: `TButton` reads `color-status-<x>-contrast`, computed per theme,
 *    and its stylesheet carries a comment explaining that white on a lighter
 *    amber would fail. A product seeding a lighter warning would break the
 *    badge and not the button. Recorded rather than changed, because changing
 *    it is a visual change to a shipped component.
 */
export const NATIVE_BADGE_VARIANTS = ['solid', 'outline', 'ghost', 'soft', 'danger'] as const;

export type NativeBadgeVariant = (typeof NATIVE_BADGE_VARIANTS)[number];

/** The badge tone vocabulary, which IS `treeBadgeTones`. */
export const NATIVE_BADGE_TONE_NAMES = treeBadgeTones;

export type NativeBadgeToneName = (typeof NATIVE_BADGE_TONE_NAMES)[number];

/** A palette key, or `null` where the stylesheet paints `transparent`. */
export type NativeBadgeSlot = string | null;

export interface NativeBadgeSlots {
  /** Fill, or `null` for none. */
  bg: NativeBadgeSlot;
  /** Ink. Always a real colour — a badge with no legible label is not a badge. */
  text: string;
  /** Edge, or `null` for none. Only `outline` draws one. */
  border: NativeBadgeSlot;
}

export const NATIVE_BADGE_TONES: Readonly<
  Record<NativeBadgeToneName, Readonly<Record<NativeBadgeVariant, NativeBadgeSlots>>>
> = {
  neutral: {
    solid: { bg: 'color-brand-primary', text: 'color-brand-contrast', border: null },
    outline: { bg: 'color-bg-surface', text: 'color-text-primary', border: 'color-border-default' },
    ghost: { bg: null, text: 'color-text-muted', border: null },
    soft: { bg: 'color-brand-soft', text: 'color-brand-on-soft', border: null },
    danger: { bg: 'color-status-error-soft', text: 'color-status-error-on-soft', border: null },
  },
  success: {
    solid: { bg: 'color-status-success', text: 'color-brand-contrast', border: null },
    outline: { bg: 'color-bg-surface', text: 'color-status-success', border: 'color-status-success-border' },
    ghost: { bg: null, text: 'color-status-success', border: null },
    soft: { bg: 'color-status-success-soft', text: 'color-status-success-on-soft', border: null },
    danger: { bg: 'color-status-success-soft', text: 'color-status-success-on-soft', border: null },
  },
  warning: {
    solid: { bg: 'color-status-warning', text: 'color-brand-contrast', border: null },
    outline: { bg: 'color-bg-surface', text: 'color-status-warning', border: 'color-status-warning-border' },
    ghost: { bg: null, text: 'color-status-warning', border: null },
    soft: { bg: 'color-status-warning-soft', text: 'color-status-warning-on-soft', border: null },
    danger: { bg: 'color-status-warning-soft', text: 'color-status-warning-on-soft', border: null },
  },
  danger: {
    solid: { bg: 'color-status-error', text: 'color-brand-contrast', border: null },
    outline: { bg: 'color-bg-surface', text: 'color-status-error', border: 'color-status-error-border' },
    ghost: { bg: null, text: 'color-status-error', border: null },
    soft: { bg: 'color-status-error-soft', text: 'color-status-error-on-soft', border: null },
    danger: { bg: 'color-status-error-soft', text: 'color-status-error-on-soft', border: null },
  },
  info: {
    solid: { bg: 'color-status-info', text: 'color-brand-contrast', border: null },
    outline: { bg: 'color-bg-surface', text: 'color-status-info', border: 'color-status-info-border' },
    ghost: { bg: null, text: 'color-status-info', border: null },
    soft: { bg: 'color-status-info-soft', text: 'color-status-info-on-soft', border: null },
    danger: { bg: 'color-status-info-soft', text: 'color-status-info-on-soft', border: null },
  },
};

/**
 * One badge tone resolved against one palette.
 *
 * Throws on a slot whose palette key is missing, for the same reason
 * `resolveTone` does: a hole here is a component that paints `transparent`
 * somewhere and looks like a rendering bug rather than a missing token.
 */
export const resolveBadgeTone = (
  palette: NativeThemePalette,
  tone: NativeBadgeToneName,
  variant: NativeBadgeVariant,
): { bg: NativeRgba | null; text: NativeRgba; border: NativeRgba | null } => {
  const slots = NATIVE_BADGE_TONES[tone][variant];

  const read = (key: NativeBadgeSlot, what: string): NativeRgba | null => {
    if (key === null) return null;

    const color = palette.color[key];
    if (!color) {
      throw new Error(
        `Badge tone "${tone}" variant "${variant}" ${what} names --tree-${key}, which the ${palette.mode} palette does not define.`,
      );
    }

    return color;
  };

  return {
    bg: read(slots.bg, 'fill'),
    text: read(slots.text, 'ink') as NativeRgba,
    border: read(slots.border, 'edge'),
  };
};
