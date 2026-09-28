/**
 * Kotlin rendering of the token model.
 *
 * The third renderer, beside `css.ts` (custom properties) and `rust.ts`. It
 * emits plain Kotlin — `Float`, `Int`, `String` and four small data classes —
 * with no Compose, Android or JVM-graphics import anywhere in the output. That
 * is deliberate: the module this lands in has to compile without the Android
 * SDK, so the token layer stays as framework-agnostic in Kotlin as it is in
 * TypeScript, and the Compose layer above it is the only place that knows what
 * a `Dp` is.
 *
 * Two identifier rules, because Kotlin has no identifier that starts with a
 * digit while three token scales do:
 *
 *   - a scale step moves its digits to the end — `2xl` becomes `xl2`
 *   - a purely numeric step takes its group's letter — `space-4` becomes `s4`
 *
 * Every emitted property carries the `--tree-*` name it came from in its KDoc,
 * and every semantic colour also carries its role sentence from `contract.ts`,
 * so the Kotlin API documents itself out of the same contract the web does.
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

/** The Kotlin package the generated source declares. */
export const KOTLIN_PACKAGE = 'treeui.tokens';

// --- identifiers -----------------------------------------------------------

const camel = (key: string) => key.replace(/-+([a-zA-Z0-9])/g, (_, char: string) => char.toUpperCase());

/**
 * A token key as a Kotlin identifier.
 *
 * `numericPrefix` is the letter a purely numeric step takes; a group whose keys
 * can never be numeric does not need one, and asking for one it did not declare
 * throws rather than inventing a name.
 */
export const kotlinIdentifier = (key: string, numericPrefix?: string): string => {
  const name = camel(key);

  if (!/^[0-9]/.test(name)) return name;

  const scale = /^([0-9]+)([a-zA-Z].*)$/.exec(name);
  if (scale) return `${scale[2]}${scale[1]}`;

  if (!numericPrefix) {
    throw new Error(
      `Token "${key}" is a bare number and its group declares no numeric prefix, so it has no Kotlin identifier.`,
    );
  }

  return `${numericPrefix}${name}`;
};

// --- groups ----------------------------------------------------------------

/**
 * The group's Kotlin object name: its words in PascalCase, so `['control',
 * 'size']` becomes `ControlSize`. The grouping itself is shared with `rust.ts`
 * (see `NATIVE_TOKEN_GROUPS`); only the spelling is decided here.
 */
const objectName = (group: NativeTokenGroup) =>
  group.name.map((word) => word[0].toUpperCase() + word.slice(1)).join('');

// --- value rendering -------------------------------------------------------

/** Kotlin float literals need the suffix, and `16` is not a `Float`. */
const float = (value: number): string => {
  const text = Number.isInteger(value) ? `${value}.0` : `${value}`;
  return `${text}f`;
};

const color = (value: NativeRgba): string =>
  `TreeColor(${value.r}, ${value.g}, ${value.b}, ${float(value.a)})`;

const shadow = (layers: NativeShadowLayer[]): string =>
  `listOf(${layers
    .map(
      (layer) =>
        `TreeShadowLayer(${float(layer.offsetXPx)}, ${float(layer.offsetYPx)}, ${float(
          layer.blurPx,
        )}, ${float(layer.spreadPx)}, ${color(layer.color)})`,
    )
    .join(', ')})`;

const gradient = (value: NativeGradient): string =>
  `TreeGradient(${float(value.angleDeg)}, listOf(${value.stops
    .map(
      (stop) =>
        `TreeGradientStop(${color(stop.color)}, ${
          stop.positionPct === null ? 'null' : float(stop.positionPct)
        })`,
    )
    .join(', ')}))`;

/** Doubles a backslash and escapes a quote, which is all a token value can contain. */
const string = (value: string) => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

// --- documentation ---------------------------------------------------------

const ROLES = new Map(SEMANTIC_TOKENS.map((spec) => [spec.name, spec.role]));

/**
 * The KDoc for one colour.
 *
 * A semantic colour gets its role sentence from `contract.ts` — the same
 * sentence the web contract publishes. A derived one gets the warning instead,
 * because overriding it is unsupported and a port that exposed it as settable
 * would be inventing public API the contract does not grant.
 */
const colorDoc = (token: string): string => {
  const role = ROLES.get(`--tree-${token}`);
  if (role) return `/** \`--tree-${token}\` — ${role} */`;
  return `/** \`--tree-${token}\` — derived by the library from the semantic layer. Read it; never set it. */`;
};

const indent = (text: string, depth: number) =>
  text
    .split('\n')
    .map((line) => (line ? `${'    '.repeat(depth)}${line}` : line))
    .join('\n');

// --- emission --------------------------------------------------------------

const renderGroup = (group: NativeTokenGroup, tokens: NativeTokens, claimed: Set<string>): string => {
  const lines: string[] = [];

  const take = <T>(map: Record<string, T>, render: (value: T) => string) => {
    for (const [token, value] of Object.entries(map)) {
      if (!token.startsWith(group.prefix)) continue;
      claimed.add(token);
      const name = kotlinIdentifier(token.slice(group.prefix.length), group.numericPrefix);
      lines.push(`/** \`--tree-${token}\` */`);
      lines.push(`public val ${name}: ${render(value)}`);
    }
  };

  take(tokens.fontFamily, (value) => `List<String> = listOf(${value.map(string).join(', ')})`);
  take(tokens.fontSizePx, (value) => `Float = ${float(value)}`);
  take(tokens.fontWeight, (value) => `Int = ${value}`);
  take(tokens.lineHeight, (value) => `Float = ${float(value)}`);
  take(tokens.trackingEm, (value) => `Float = ${float(value)}`);
  take(tokens.lengthPx, (value) => `Float = ${float(value)}`);
  take(tokens.opacity, (value) => `Float = ${float(value)}`);
  take(tokens.durationMs, (value) => `Int = ${Math.round(value)}`);
  take(
    tokens.easing,
    (value) =>
      `TreeEasing = TreeEasing(${float(value.x1)}, ${float(value.y1)}, ${float(value.x2)}, ${float(
        value.y2,
      )})`,
  );
  take(tokens.zIndex, (value) => `Int = ${value}`);
  take(tokens.count, (value) => `Int = ${value}`);

  if (!lines.length) {
    throw new Error(
      `Kotlin group "${objectName(group)}" matched no token; the prefix "${group.prefix}" is stale.`,
    );
  }

  return [
    `/** ${group.doc} */`,
    `public object ${objectName(group)} {`,
    indent(lines.join('\n'), 1),
    '}',
  ].join('\n');
};

const paletteProperties = (palette: NativeThemePalette) => ({
  colors: Object.keys(palette.color),
  shadows: Object.keys(palette.shadow),
  gradients: Object.keys(palette.gradient),
});

/**
 * Both palettes must carry the same property list, or the generated data class
 * fits one theme and not the other. `themeDeclarations` produces them from the
 * same contract, so a mismatch means a theme is missing a role — which is a
 * contract failure worth naming here rather than a compile error later.
 */
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

const renderPaletteClass = (names: ReturnType<typeof paletteProperties>): string => {
  const fields = [
    '/** Which of the two colour modes this palette is, for the platform status bar and for `states.ts` parity. */',
    'public val mode: TreeColorMode,',
    ...names.colors.flatMap((token) => [
      colorDoc(token),
      `public val ${kotlinIdentifier(token.replace(/^color-/, ''))}: TreeColor,`,
    ]),
    ...names.shadows.flatMap((token) => [
      `/** \`--tree-${token}\` — layers in paint order, colour already composited over the theme’s umbra. */`,
      `public val ${kotlinIdentifier(token)}: List<TreeShadowLayer>,`,
    ]),
    ...names.gradients.flatMap((token) => [
      `/** \`--tree-${token}\` */`,
      `public val ${kotlinIdentifier(token)}: TreeGradient,`,
    ]),
  ];

  return [
    '/**',
    ' * One theme, fully resolved: the semantic colours a product fills in, the',
    ' * interaction states the library derives from them, and the two groups whose',
    ' * CSS refers to theme variables and so can only exist per theme.',
    ' *',
    ' * Every property is required. A theme assembled by hand that omits one does',
    ' * not compile, which is the Kotlin form of the contract validator.',
    ' */',
    'public data class TreePalette(',
    indent(fields.join('\n'), 1),
    ')',
  ].join('\n');
};

const renderPaletteValue = (
  name: string,
  palette: NativeThemePalette,
  names: ReturnType<typeof paletteProperties>,
): string => {
  const args = [
    `mode = TreeColorMode.${palette.mode === 'light' ? 'Light' : 'Dark'},`,
    ...names.colors.map(
      (token) => `${kotlinIdentifier(token.replace(/^color-/, ''))} = ${color(palette.color[token])},`,
    ),
    ...names.shadows.map((token) => `${kotlinIdentifier(token)} = ${shadow(palette.shadow[token])},`),
    ...names.gradients.map((token) => `${kotlinIdentifier(token)} = ${gradient(palette.gradient[token])},`),
  ];

  return [`public val ${name}: TreePalette = TreePalette(`, indent(args.join('\n'), 1), ')'].join('\n');
};

// --- tones -----------------------------------------------------------------

/** A palette key (`color-text-primary`) as its Kotlin property on `TreePalette`. */
const paletteProperty = (key: string) => kotlinIdentifier(key.replace(/^color-/, ''));

const pascal = (word: string) => word[0].toUpperCase() + word.slice(1);

/**
 * The tone axis as Kotlin: the closed vocabulary, the ten-colour set one tone
 * resolves to, and the extension that resolves it against a palette.
 *
 * Generated from `NATIVE_TONES` rather than written out, because the same table
 * generates the Rust accessor and the `@treeui/vue` stylesheet is tested against
 * it — three renderings of one decision, none of them retyped.
 */
const renderTones = (): string => {
  const enumEntries = NATIVE_TONE_NAMES.flatMap((tone) => [
    `/** ${NATIVE_TONE_DOCS[tone]} */`,
    `${pascal(tone)},`,
  ]);

  const setFields = NATIVE_TONE_SLOTS.map((slot) => {
    const doc =
      slot === 'accent-contrast'
        ? 'Ink that clears AA on the solid fill. Computed per theme — never `text.inverse`.'
        : slot === 'accent-on-soft'
          ? 'Ink that clears AA on the tint. It deepens as the tint deepens, because a tint has only so much headroom.'
          : slot.startsWith('accent-soft')
            ? 'The tone’s tint, which the `soft` variant fills with.'
            : 'The tone’s solid fill, and its ink on the quiet variants.';

    return [`/** ${doc} */`, `public val ${kotlinIdentifier(slot)}: TreeColor,`];
  }).flat();

  const arms = NATIVE_TONE_NAMES.map((tone) => {
    const slots = NATIVE_TONES[tone];
    const args = NATIVE_TONE_SLOTS.map(
      (slot) => `${kotlinIdentifier(slot)} = ${paletteProperty(slots[slot])},`,
    );

    return [
      `TreeTone.${pascal(tone)} -> TreeToneColors(`,
      indent(args.join('\n'), 1),
      ')',
    ].join('\n');
  });

  return [
    '/**',
    ' * The colour axis for an action surface, orthogonal to its variant.',
    ' *',
    ' * The variant decides the SHAPE — filled, outlined, quiet, tinted — and the',
    ' * tone decides which colour set that shape paints with. Splitting them is what',
    ' * makes a quiet destructive action expressible: a single `danger` variant could',
    ' * only ever be a filled red button.',
    ' */',
    'public enum class TreeTone {',
    indent(enumEntries.join('\n'), 1),
    '}',
    '',
    '/** One tone resolved against one palette. */',
    'public data class TreeToneColors(',
    indent(setFields.join('\n'), 1),
    ')',
    '',
    '/**',
    ' * This palette’s colours for one tone.',
    ' *',
    ' * Exhaustive over `TreeTone` with no `else` branch, so adding a tone to the',
    ' * contract fails this file to compile rather than silently painting a default.',
    ' */',
    'public fun TreePalette.tone(tone: TreeTone): TreeToneColors =',
    indent(['when (tone) {', indent(arms.join('\n'), 1), '}'].join('\n'), 1),
  ].join('\n');
};

// --- vocabularies ----------------------------------------------------------

/**
 * A closed vocabulary as a Kotlin enum, with `token` mapping each member back
 * to the string the web spells it with.
 *
 * `token` is not decoration: it is what lets a Kotlin screen log, serialise or
 * assert against the same value the CSS class and the JS prop carry, so the two
 * ecosystems can be compared without a lookup table written by hand.
 */
const renderVocabulary = (vocabulary: NativeVocabulary): string => {
  const type = `Tree${vocabulary.name.map((word) => word[0].toUpperCase() + word.slice(1)).join('')}`;
  const members = nativeVocabularyMembers(vocabulary);

  const entries = members.flatMap((member) => [
    `/** \`"${member}"\` */`,
    `${kotlinIdentifier(member)[0].toUpperCase()}${kotlinIdentifier(member).slice(1)},`,
  ]);

  const arms = members.map(
    (member) =>
      `${kotlinIdentifier(member)[0].toUpperCase()}${kotlinIdentifier(member).slice(1)} -> "${member}"`,
  );

  const doc = [
    '/**',
    ` * ${vocabulary.doc}`,
    ...(vocabulary.deprecationReason ? [' *', ` * ${vocabulary.deprecationReason}`] : []),
    ' */',
  ];

  return [
    ...doc,
    `public enum class ${type} {`,
    indent(entries.join('\n'), 1),
    '    ;',
    '',
    indent(
      [
        '/** The string this member is spelled with on the web — its CSS modifier and its JS prop value. */',
        'public val token: String',
        indent(['get() =', indent(['when (this) {', indent(arms.join('\n'), 1), '}'].join('\n'), 1)].join('\n'), 1),
      ].join('\n'),
      1,
    ),
    '}',
  ].join('\n');
};

/**
 * The badge tone axis as Kotlin.
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
 * variant is absent here exactly as it is absent from `TreeVariant`.
 */
const renderBadgeTones = (): string => {
  const variants = nativeVocabularyMembers(
    NATIVE_VOCABULARIES.find((vocabulary) => vocabulary.name.join('-') === 'variant')!,
  );

  const optional = (key: NativeBadgeSlot) =>
    key === null ? 'null' : paletteProperty(key);

  // NESTED `when`, not `when (tone to variant)`. Kotlin checks exhaustiveness
  // against the subject's TYPE, and only an enum, a sealed hierarchy or a
  // Boolean can be exhausted — a `Pair` is an ordinary data class, so a `when`
  // over one can never be exhaustive however many cells are listed. It does not
  // compile, and the `else` that would make it compile is precisely what the
  // KDoc below promises is absent. Nesting is exhaustive on both axes and keeps
  // the promise true. (Rust needs no such care: `match (tone, variant)` over a
  // tuple of enums IS exhaustively checkable, which is why only this emitter
  // had the defect.)
  const arms = NATIVE_BADGE_TONE_NAMES.map((tone) => {
    const inner = variants.map((variant) => {
      const slots = NATIVE_BADGE_TONES[tone][variant as keyof (typeof NATIVE_BADGE_TONES)[typeof tone]];

      return [
        `TreeVariant.${pascal(variant)} -> TreeBadgeColors(`,
        indent(
          [
            `background = ${optional(slots.bg)},`,
            `text = ${paletteProperty(slots.text)},`,
            `border = ${optional(slots.border)},`,
          ].join('\n'),
          1,
        ),
        ')',
      ].join('\n');
    });

    return [
      `TreeBadgeTone.${pascal(tone)} ->`,
      indent(['when (variant) {', indent(inner.join('\n'), 1), '}'].join('\n'), 1),
    ].join('\n');
  });

  return [
    '/**',
    ' * One badge tone resolved against one palette, for one variant.',
    ' *',
    ' * A fill and an edge may be absent — a ghost badge has neither. The ink never',
    ' * is: a badge whose label cannot be read is not a badge.',
    ' */',
    'public data class TreeBadgeColors(',
    indent(
      [
        '/** Fill, or `null` for none. */',
        'public val background: TreeColor?,',
        '/** Ink. Always present. */',
        'public val text: TreeColor,',
        '/** Edge, or `null` for none. Only `Outline` draws one. */',
        'public val border: TreeColor?,',
      ].join('\n'),
      1,
    ),
    ')',
    '',
    '/**',
    " * This palette's colours for one badge tone and variant.",
    ' *',
    ' * Exhaustive over both vocabularies with no `else` branch, so adding a tone or',
    ' * a variant fails this file to compile rather than silently painting a default.',
    ' */',
    'public fun TreePalette.badgeTone(tone: TreeBadgeTone, variant: TreeVariant): TreeBadgeColors =',
    indent(['when (tone) {', indent(arms.join('\n'), 1), '}'].join('\n'), 1),
  ].join('\n');
};

const THEME_OBJECT: Record<TreeThemeName, string> = { light: 'Light', dark: 'Dark' };

/**
 * The generated Kotlin source, as one file.
 *
 * Emitted rather than hand-maintained for the reason every token system ends
 * up here: 84 colours times two themes is 168 values that have to agree with
 * the stylesheet, and agreement by review does not survive one busy week.
 */
export const createKotlinTokens = (): string => {
  const tokens = resolveNativeTokens();
  const names = assertPalettesAgree(tokens);
  const claimed = new Set<string>();

  const groups = NATIVE_TOKEN_GROUPS.map((group) => renderGroup(group, tokens, claimed));

  const unclaimed = nativeFoundationKeys(tokens).filter((token) => !claimed.has(token));
  if (unclaimed.length) {
    throw new Error(
      `No Kotlin group claims these tokens: ${unclaimed.join(', ')}. Add a group to kotlin.ts rather than dropping them.`,
    );
  }

  return [
    '// Generated by @treeui/tokens. DO NOT EDIT.',
    '// Regenerate with: pnpm codegen:native',
    `// Colour contract version: ${CONTRACT_VERSION}`,
    '',
    `package ${KOTLIN_PACKAGE}`,
    '',
    '/**',
    ' * The TreeUI token layer, resolved for Kotlin.',
    ' *',
    ' * Lengths are density-independent pixels and type sizes are scalable pixels,',
    ' * both taken from the CSS model at its authored root size of',
    ` * ${ROOT_FONT_SIZE_PX}px — one CSS pixel is one \`dp\`. Nothing here imports Compose, so`,
    ' * this module also serves a plain-JVM or a Compose Multiplatform consumer.',
    ' */',
    'public object TreeTokens {',
    indent(
      [
        '/** The colour contract this file was generated against. */',
        `public const val CONTRACT_VERSION: String = ${string(CONTRACT_VERSION)}`,
        '',
        '/** The CSS root font size the lengths below were resolved against. */',
        `public const val ROOT_FONT_SIZE_PX: Float = ${float(ROOT_FONT_SIZE_PX)}`,
        '',
        groups.join('\n\n'),
      ].join('\n'),
      1,
    ),
    '}',
    '',
    NATIVE_VOCABULARIES.map(renderVocabulary).join('\n\n'),
    '',
    renderPaletteClass(names),
    '',
    renderTones(),
    '',
    renderBadgeTones(),
    '',
    '/** The two themes TreeUI ships. A product may build its own `TreePalette` instead. */',
    'public object TreePalettes {',
    indent(
      (Object.keys(THEME_OBJECT) as TreeThemeName[])
        .map((theme) => renderPaletteValue(THEME_OBJECT[theme], tokens.themes[theme], names))
        .join('\n\n'),
      1,
    ),
    '}',
    '',
  ].join('\n');
};
