/**
 * Rust rendering of the token model.
 *
 * The fourth renderer, beside `css.ts`, `kotlin.ts` and the resolved model in
 * `native.ts`. It emits a crate module with no dependency of any kind — every
 * value is a `const`, every colour a plain struct literal, every slice
 * `&'static` — so the token crate compiles on its own and a GUI crate above it
 * is the only place that knows what `egui::Color32` is.
 *
 * `const` rather than `static` or a lazily built map for a reason that matters
 * downstream: a widget reading `palette.bg_surface` costs nothing at runtime
 * and the compiler removes a colour nobody paints, which is what lets a small
 * desktop binary depend on the whole design system.
 *
 * Two identifier rules, matching `kotlin.ts`, because Rust has no identifier
 * that starts with a digit while three token scales do:
 *
 *   - a scale step moves its digits to the end — `2xl` becomes `XL2`
 *   - a purely numeric step takes its group's letter — `space-4` becomes `S4`
 */

import { CONTRACT_VERSION, SEMANTIC_TOKENS } from './contract';
import {
  NATIVE_BADGE_TONES,
  NATIVE_BADGE_TONE_NAMES,
  NATIVE_TOKEN_GROUPS,
  NATIVE_VOCABULARIES,
  NATIVE_TONES,
  NATIVE_TONE_DOCS,
  NATIVE_TONE_NAMES,
  NATIVE_TONE_SLOTS,
  ROOT_FONT_SIZE_PX,
  nativeFoundationKeys,
  nativeVocabularyMembers,
  resolveNativeTokens,
  type NativeGradient,
  type NativeRgba,
  type NativeShadowLayer,
  type NativeThemePalette,
  type NativeBadgeSlot,
  type NativeTokenGroup,
  type NativeTokens,
  type NativeVocabulary,
} from './native';
import type { TreeThemeName } from './tokens';

// --- identifiers -----------------------------------------------------------

const snake = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/-+/g, '_');

/** A token key as a Rust `const` name: SCREAMING_SNAKE_CASE. */
export const rustConstant = (key: string, numericPrefix?: string): string => {
  const name = snake(key);

  if (!/^[0-9]/.test(name)) return name.toUpperCase();

  const scale = /^([0-9]+)([a-z].*)$/.exec(name);
  if (scale) return `${scale[2]}${scale[1]}`.toUpperCase();

  if (!numericPrefix) {
    throw new Error(
      `Token "${key}" is a bare number and its group declares no numeric prefix, so it has no Rust identifier.`,
    );
  }

  return `${numericPrefix}${name}`.toUpperCase();
};

/** A token key as a Rust struct field: snake_case. */
export const rustField = (key: string): string => {
  const name = snake(key);
  if (!/^[0-9]/.test(name)) return name;

  const scale = /^([0-9]+)([a-z].*)$/.exec(name);
  if (scale) return `${scale[2]}${scale[1]}`;

  throw new Error(`Token "${key}" is a bare number and has no Rust field name.`);
};

/** The group's module name: its words in snake_case. */
const moduleName = (group: NativeTokenGroup) => group.name.join('_');

// --- value rendering -------------------------------------------------------

/** Rust infers `f64` from `1.0` in some positions, so every float is written with its type's precision in mind. */
const float = (value: number): string => (Number.isInteger(value) ? `${value}.0` : `${value}`);

const color = (value: NativeRgba): string =>
  `Color { r: ${value.r}, g: ${value.g}, b: ${value.b}, a: ${float(value.a)} }`;

const shadow = (layers: NativeShadowLayer[]): string =>
  `&[${layers
    .map(
      (layer) =>
        `ShadowLayer { offset_x: ${float(layer.offsetXPx)}, offset_y: ${float(
          layer.offsetYPx,
        )}, blur: ${float(layer.blurPx)}, spread: ${float(layer.spreadPx)}, color: ${color(
          layer.color,
        )} }`,
    )
    .join(', ')}]`;

const gradient = (value: NativeGradient): string =>
  `Gradient { angle_deg: ${float(value.angleDeg)}, stops: &[${value.stops
    .map(
      (stop) =>
        `GradientStop { color: ${color(stop.color)}, position_pct: ${
          stop.positionPct === null ? 'None' : `Some(${float(stop.positionPct)})`
        } }`,
    )
    .join(', ')}] }`;

const string = (value: string) => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

// --- documentation ---------------------------------------------------------

const ROLES = new Map(SEMANTIC_TOKENS.map((spec) => [spec.name, spec.role]));

/**
 * Rustdoc for one colour, from the same contract sentence the web publishes.
 *
 * A derived colour says so instead: `states.ts` owns it, and a port that
 * presented it as settable would be granting public API the contract withholds.
 */
const colorDoc = (token: string): string => {
  const role = ROLES.get(`--tree-${token}`);
  return role
    ? `/// \`--tree-${token}\` — ${role}`
    : `/// \`--tree-${token}\` — derived by the library from the semantic layer. Read it; never set it.`;
};

const indent = (text: string, depth: number) =>
  text
    .split('\n')
    .map((line) => (line ? `${'    '.repeat(depth)}${line}` : line))
    .join('\n');

// --- emission --------------------------------------------------------------

const renderModule = (group: NativeTokenGroup, tokens: NativeTokens, claimed: Set<string>): string => {
  const lines: string[] = [];

  const take = <T>(map: Record<string, T>, render: (value: T) => string) => {
    for (const [token, value] of Object.entries(map)) {
      if (!token.startsWith(group.prefix)) continue;
      claimed.add(token);
      lines.push(`/// \`--tree-${token}\``);
      lines.push(
        `pub const ${rustConstant(token.slice(group.prefix.length), group.numericPrefix)}: ${render(
          value,
        )};`,
      );
    }
  };

  take(tokens.fontFamily, (value) => `&[&str] = &[${value.map(string).join(', ')}]`);
  take(tokens.fontSizePx, (value) => `f32 = ${float(value)}`);
  take(tokens.fontWeight, (value) => `u16 = ${value}`);
  take(tokens.lineHeight, (value) => `f32 = ${float(value)}`);
  take(tokens.trackingEm, (value) => `f32 = ${float(value)}`);
  take(tokens.lengthPx, (value) => `f32 = ${float(value)}`);
  take(tokens.opacity, (value) => `f32 = ${float(value)}`);
  take(tokens.durationMs, (value) => `u32 = ${Math.round(value)}`);
  take(
    tokens.easing,
    (value) =>
      `Easing = Easing { x1: ${float(value.x1)}, y1: ${float(value.y1)}, x2: ${float(
        value.x2,
      )}, y2: ${float(value.y2)} }`,
  );
  take(tokens.zIndex, (value) => `i32 = ${value}`);
  take(tokens.count, (value) => `u32 = ${value}`);

  if (!lines.length) {
    throw new Error(
      `Rust module "${moduleName(group)}" matched no token; the prefix "${group.prefix}" is stale.`,
    );
  }

  const needsEasing = lines.some((line) => line.includes(': Easing ='));

  return [
    `/// ${group.doc}`,
    `pub mod ${moduleName(group)} {`,
    needsEasing ? indent('use crate::Easing;\n', 1) : '',
    indent(lines.join('\n'), 1),
    '}',
  ]
    .filter((part) => part !== '')
    .join('\n');
};

const paletteProperties = (palette: NativeThemePalette) => ({
  colors: Object.keys(palette.color),
  shadows: Object.keys(palette.shadow),
  gradients: Object.keys(palette.gradient),
});

const assertPalettesAgree = (tokens: NativeTokens) => {
  const light = paletteProperties(tokens.themes.light);
  const dark = paletteProperties(tokens.themes.dark);

  for (const key of ['colors', 'shadows', 'gradients'] as const) {
    const missing = light[key].filter((name) => !dark[key].includes(name));
    const extra = dark[key].filter((name) => !light[key].includes(name));

    if (missing.length || extra.length) {
      throw new Error(
        `The light and dark palettes disagree on ${key}: light-only [${missing.join(
          ', ',
        )}], dark-only [${extra.join(', ')}].`,
      );
    }
  }

  return light;
};

const renderPaletteStruct = (names: ReturnType<typeof paletteProperties>): string => {
  const fields = [
    '/// Which of the two colour modes this palette is.',
    'pub mode: ColorMode,',
    ...names.colors.flatMap((token) => [
      colorDoc(token),
      `pub ${rustField(token.replace(/^color-/, ''))}: Color,`,
    ]),
    ...names.shadows.flatMap((token) => [
      `/// \`--tree-${token}\` — layers in paint order, colour already composited over the theme's umbra.`,
      `pub ${rustField(token)}: &'static [ShadowLayer],`,
    ]),
    ...names.gradients.flatMap((token) => [`/// \`--tree-${token}\``, `pub ${rustField(token)}: Gradient,`]),
  ];

  return [
    '/// One theme, fully resolved: the semantic colours a product fills in, the',
    '/// interaction states the library derives from them, and the two groups whose',
    '/// CSS refers to theme variables and so can only exist per theme.',
    '///',
    '/// Every field is required. A palette assembled by hand that omits one does not',
    '/// compile, which is the Rust form of the contract validator.',
    '#[derive(Clone, Copy, Debug, PartialEq)]',
    'pub struct Palette {',
    indent(fields.join('\n'), 1),
    '}',
  ].join('\n');
};

const renderPaletteValue = (
  name: string,
  doc: string,
  palette: NativeThemePalette,
  names: ReturnType<typeof paletteProperties>,
): string => {
  const fields = [
    `mode: ColorMode::${palette.mode === 'light' ? 'Light' : 'Dark'},`,
    ...names.colors.map(
      (token) => `${rustField(token.replace(/^color-/, ''))}: ${color(palette.color[token])},`,
    ),
    ...names.shadows.map((token) => `${rustField(token)}: ${shadow(palette.shadow[token])},`),
    ...names.gradients.map((token) => `${rustField(token)}: ${gradient(palette.gradient[token])},`),
  ];

  return [
    `/// ${doc}`,
    `pub const ${name}: Palette = Palette {`,
    indent(fields.join('\n'), 1),
    '};',
  ].join('\n');
};

// --- tones -----------------------------------------------------------------

/** A palette key (`color-text-primary`) as its Rust field on `Palette`. */
const paletteField = (key: string) => rustField(key.replace(/^color-/, ''));

const pascal = (word: string) => word[0].toUpperCase() + word.slice(1);

/**
 * The tone axis as Rust: the closed vocabulary, the ten-colour set one tone
 * resolves to, and the `const fn` that resolves it against a palette.
 *
 * Generated from `NATIVE_TONES` rather than written out, because the same table
 * generates the Kotlin accessor and the `@treeui/vue` stylesheet is tested
 * against it — three renderings of one decision, none of them retyped.
 *
 * The accessor is `const` so a widget that paints a fixed tone resolves it at
 * compile time and the unused tones fall out of the binary.
 */
const renderTones = (): string => {
  const variants = NATIVE_TONE_NAMES.flatMap((tone) => [
    `/// ${NATIVE_TONE_DOCS[tone]}`,
    `${pascal(tone)},`,
  ]);

  const fields = NATIVE_TONE_SLOTS.map((slot) => {
    const doc =
      slot === 'accent-contrast'
        ? 'Ink that clears AA on the solid fill. Computed per theme — never `text.inverse`.'
        : slot === 'accent-on-soft'
          ? 'Ink that clears AA on the tint. It deepens as the tint deepens, because a tint has only so much headroom.'
          : slot.startsWith('accent-soft')
            ? "The tone's tint, which the `soft` variant fills with."
            : "The tone's solid fill, and its ink on the quiet variants.";

    return [`/// ${doc}`, `pub ${rustField(slot)}: Color,`];
  }).flat();

  const arms = NATIVE_TONE_NAMES.map((tone) => {
    const slots = NATIVE_TONES[tone];
    const args = NATIVE_TONE_SLOTS.map(
      (slot) => `${rustField(slot)}: self.${paletteField(slots[slot])},`,
    );

    return [`Tone::${pascal(tone)} => ToneColors {`, indent(args.join('\n'), 1), '},'].join('\n');
  });

  return [
    '/// The colour axis for an action surface, orthogonal to its variant.',
    '///',
    '/// The variant decides the SHAPE — filled, outlined, quiet, tinted — and the',
    '/// tone decides which colour set that shape paints with. Splitting them is what',
    '/// makes a quiet destructive action expressible: a single `danger` variant could',
    '/// only ever be a filled red button.',
    '#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]',
    'pub enum Tone {',
    indent(variants.join('\n'), 1),
    '}',
    '',
    '/// One tone resolved against one palette.',
    '#[derive(Clone, Copy, Debug, PartialEq)]',
    'pub struct ToneColors {',
    indent(fields.join('\n'), 1),
    '}',
    '',
    'impl Palette {',
    indent(
      [
        "/// This palette's colours for one tone.",
        '///',
        '/// Exhaustive over `Tone` with no wildcard arm, so adding a tone to the',
        '/// contract fails this file to compile rather than silently painting a default.',
        '#[must_use]',
        'pub const fn tone(&self, tone: Tone) -> ToneColors {',
        indent(['match tone {', indent(arms.join('\n'), 1), '}'].join('\n'), 1),
        '}',
      ].join('\n'),
      1,
    ),
    '}',
  ].join('\n');
};

// --- vocabularies ----------------------------------------------------------

/**
 * A closed vocabulary as a Rust enum, with `as_str` mapping each member back to
 * the string the web spells it with.
 *
 * `as_str` is not decoration: it is what lets a Rust widget log, serialise or
 * assert against the same value the CSS class and the JS prop carry, so the two
 * ecosystems can be compared without a lookup table written by hand.
 */
const renderVocabulary = (vocabulary: NativeVocabulary): string => {
  const type = vocabulary.name.map((word) => word[0].toUpperCase() + word.slice(1)).join('');
  const members = nativeVocabularyMembers(vocabulary);

  const variantName = (member: string) => {
    const camel = member.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase());
    return `${camel[0].toUpperCase()}${camel.slice(1)}`;
  };

  const variants = members.flatMap((member) => [`/// \`"${member}"\``, `${variantName(member)},`]);
  const arms = members.map((member) => `Self::${variantName(member)} => "${member}",`);

  const doc = [
    `/// ${vocabulary.doc}`,
    ...(vocabulary.deprecationReason ? ['///', `/// ${vocabulary.deprecationReason}`] : []),
  ];

  return [
    ...doc,
    '#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]',
    `pub enum ${type} {`,
    indent(variants.join('\n'), 1),
    '}',
    '',
    `impl ${type} {`,
    indent(
      [
        '/// The string this member is spelled with on the web — its CSS modifier and its JS prop value.',
        '#[must_use]',
        'pub const fn as_str(self) -> &\'static str {',
        indent(['match self {', indent(arms.join('\n'), 1), '}'].join('\n'), 1),
        '}',
      ].join('\n'),
      1,
    ),
    '}',
  ].join('\n');
};

/**
 * The badge tone axis as Rust.
 *
 * A second table and a different shape from the action tones: a badge has no
 * hover, no press and no tint ramp, so a tone resolves to a fill, an ink and an
 * edge per variant rather than to ten interaction colours.
 *
 * Generated for the reason both ports discovered the hard way — each had
 * re-declared these twenty cells by hand, from the same stylesheet, and two
 * hand-derivations of one table are two chances to drift.
 *
 * Only the variants the port reproduces get an arm, so the deprecated `danger`
 * variant is absent here exactly as it is absent from `Variant`.
 */
const renderBadgeTones = (): string => {
  const variants = nativeVocabularyMembers(
    NATIVE_VOCABULARIES.find((vocabulary) => vocabulary.name.join('-') === 'variant')!,
  );

  const optional = (key: NativeBadgeSlot) =>
    key === null ? 'None' : `Some(self.${paletteField(key)})`;

  const arms = NATIVE_BADGE_TONE_NAMES.flatMap((tone) =>
    variants.map((variant) => {
      const slots = NATIVE_BADGE_TONES[tone][variant as keyof (typeof NATIVE_BADGE_TONES)[typeof tone]];

      return [
        `(BadgeTone::${pascal(tone)}, Variant::${pascal(variant)}) => BadgeColors {`,
        indent(
          [
            `background: ${optional(slots.bg)},`,
            `text: self.${paletteField(slots.text)},`,
            `border: ${optional(slots.border)},`,
          ].join('\n'),
          1,
        ),
        '},',
      ].join('\n');
    }),
  );

  return [
    '/// One badge tone resolved against one palette, for one variant.',
    '///',
    '/// A fill and an edge may be absent — a ghost badge has neither. The ink never',
    '/// is: a badge whose label cannot be read is not a badge.',
    '#[derive(Clone, Copy, Debug, PartialEq)]',
    'pub struct BadgeColors {',
    indent(
      [
        '/// Fill, or `None` for none.',
        'pub background: Option<Color>,',
        '/// Ink. Always present.',
        'pub text: Color,',
        '/// Edge, or `None` for none. Only `Outline` draws one.',
        'pub border: Option<Color>,',
      ].join('\n'),
      1,
    ),
    '}',
    '',
    'impl Palette {',
    indent(
      [
        "/// This palette's colours for one badge tone and variant.",
        '///',
        '/// Exhaustive over both vocabularies with no wildcard arm, so adding a tone',
        '/// or a variant fails this file to compile rather than silently painting a',
        '/// default.',
        '#[must_use]',
        'pub const fn badge_tone(&self, tone: BadgeTone, variant: Variant) -> BadgeColors {',
        indent(['match (tone, variant) {', indent(arms.join('\n'), 1), '}'].join('\n'), 1),
        '}',
      ].join('\n'),
      1,
    ),
    '}',
  ].join('\n');
};

const THEMES: Record<TreeThemeName, { constant: string; doc: string }> = {
  light: { constant: 'LIGHT', doc: 'The light theme TreeUI ships.' },
  dark: { constant: 'DARK', doc: 'The dark theme TreeUI ships.' },
};

/** The generated Rust source, as one module. */
export const createRustTokens = (): string => {
  const tokens = resolveNativeTokens();
  const names = assertPalettesAgree(tokens);
  const claimed = new Set<string>();

  const modules = NATIVE_TOKEN_GROUPS.map((group) => renderModule(group, tokens, claimed));

  const unclaimed = nativeFoundationKeys(tokens).filter((token) => !claimed.has(token));
  if (unclaimed.length) {
    throw new Error(
      `No Rust module claims these tokens: ${unclaimed.join(', ')}. Add a group to NATIVE_TOKEN_GROUPS rather than dropping them.`,
    );
  }

  return [
    '// Generated by @treeui/tokens. DO NOT EDIT.',
    '// Regenerate with: pnpm codegen:native',
    `// Colour contract version: ${CONTRACT_VERSION}`,
    '',
    '// rustfmt is asked to leave this file alone on purpose. Nobody reads it to',
    '// learn the codebase and nobody edits it, so its line breaks carry no',
    '// information — but if the formatter rewrapped it, `cargo fmt` and',
    '// `pnpm codegen:native --check` would each report the other\'s output as',
    '// wrong, forever.',
    '#![cfg_attr(rustfmt, rustfmt::skip)]',
    '',
    '//! The TreeUI token layer, resolved for Rust.',
    '//!',
    '//! Lengths and type sizes are logical pixels, taken from the CSS model at its',
    `//! authored root size of ${ROOT_FONT_SIZE_PX}px — one CSS pixel is one egui point. Nothing`,
    '//! here depends on a GUI crate, so this module also serves a consumer that only',
    '//! wants the palette.',
    '',
    '// The hand-written support types live in the crate root, so the generated',
    '// half holds nothing but values. Only the types the palette itself needs are',
    '// imported here; a group whose values need one imports it in its own module.',
    `use crate::{${[
      'Color',
      'ColorMode',
      ...(names.shadows.length ? ['ShadowLayer'] : []),
      ...(names.gradients.length ? ['Gradient', 'GradientStop'] : []),
    ]
      .sort()
      .join(', ')}};`,
    '',
    '/// The colour contract this file was generated against.',
    `pub const CONTRACT_VERSION: &str = ${string(CONTRACT_VERSION)};`,
    '',
    '/// The CSS root font size the lengths below were resolved against.',
    `pub const ROOT_FONT_SIZE_PX: f32 = ${float(ROOT_FONT_SIZE_PX)};`,
    '',
    modules.join('\n\n'),
    '',
    NATIVE_VOCABULARIES.map(renderVocabulary).join('\n\n'),
    '',
    renderPaletteStruct(names),
    '',
    renderTones(),
    '',
    renderBadgeTones(),
    '',
    (Object.keys(THEMES) as TreeThemeName[])
      .map((theme) =>
        renderPaletteValue(
          THEMES[theme].constant,
          THEMES[theme].doc,
          tokens.themes[theme],
          names,
        ),
      )
      .join('\n\n'),
    '',
  ].join('\n');
};
