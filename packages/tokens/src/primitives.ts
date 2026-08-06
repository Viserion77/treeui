/**
 * Layer 1 — primitives.
 *
 * Descriptive names for raw colour values. This is the ONLY file in the system
 * that contains a literal colour, and it exists for exactly one reason: to hold
 * the values of the default fallback theme.
 *
 * Rules, enforced by `contract.test.ts`:
 *
 * - No component, in any framework package, references a primitive. They are
 *   not emitted as CSS custom properties, so a component physically cannot.
 * - No product themes against a primitive. Products fill the *semantic* layer
 *   (see `contract.ts`), or seed one (see `seed.ts`).
 * - A primitive name says what the colour *is* (`blue.500`), never where it is
 *   used. The moment a name says where, it belongs in the semantic layer.
 *
 * The scale is GitHub-derived — it is a fallback, not a brand claim. A product
 * that ships its own accent replaces every brand-carrying value here via a seed.
 */

/** Scale positions. Lower is lighter; the numbers are perceptual rungs, not luminance. */
export const treePrimitives = {
  white: '#ffffff',
  black: '#000000',

  /**
   * Neutral ramp. Carries both themes: 0-300 are light-mode surfaces and
   * borders, 700-950 are dark-mode surfaces, and the 400-600 middle is where
   * borders and muted text land in whichever theme needs that luminance.
   */
  gray: {
    0: '#ffffff',
    50: '#f6f8fa',
    100: '#eff2f5',
    200: '#d0d7de',
    300: '#afb8c1',
    /** Clears 3:1 on every light surface, including the subtle one — control edges. */
    400: '#858c93',
    /** Its dark-mode counterpart, 3:1 on every dark surface. */
    500: '#737c88',
    600: '#59636e',
    650: '#576270',
    700: '#444c56',
    800: '#2d333b',
    850: '#22272e',
    900: '#1c2128',
    950: '#0d1117',
    /** Ink. Not gray-1000: it carries a blue cast, which is why it is named. */
    ink: '#1f2328',
    /** Muted ink for dark surfaces. */
    inkDark: '#adbac7',
    inkDarkMuted: '#95a3b2',
  },

  blue: {
    50: '#ddf4ff',
    300: '#6cb6ff',
    400: '#559cf5',
    450: '#6cabf7',
    500: '#0969da',
    600: '#0550ae',
    800: '#1a3453',
    900: '#0a1a2f',
  },

  /**
   * Secondary accent ramp. Seeded from `#8957e5` and stepped until the mid tone
   * reads as text on its own tint in both themes — see `DECISIONS.md`.
   */
  purple: {
    50: '#efeaf9',
    300: '#ba9df0',
    400: '#ad8bed',
    500: '#794dcb',
    600: '#633fa6',
    800: '#332e4a',
  },

  green: {
    400: '#59ac5c',
    500: '#1a7f37',
  },

  amber: {
    400: '#c69026',
    500: '#956400',
  },

  red: {
    /** Landed on 4.50:1 against the dark subtle band; nudged for headroom. */
    400: '#f5766e',
    500: '#d1242f',
  },

  /**
   * Categorical data-viz hues. Deliberately not a ramp — these are eight
   * distinct hues chosen for separation under the three common CVD types, each
   * held at >= 3:1 against its own theme's surface so a mark is visible without
   * relying on the legend. Assign in order.
   */
  dataviz: {
    light: {
      1: '#2a78d6',
      // 2, 3 and 7 were #1baf7a / #eda100 / #e87ba4, measuring 2.82, 2.17 and
      // 2.69 against the light surface — a mark you cannot see is not a
      // category. Darkened along the same hue until each clears 3:1.
      2: '#12855c',
      3: '#8a6100',
      4: '#008300',
      5: '#4a3aa7',
      6: '#e34948',
      7: '#c4587f',
      8: '#eb6834',
    },
    dark: {
      1: '#3987e5',
      2: '#199e70',
      3: '#c98500',
      4: '#008300',
      5: '#9085e9',
      6: '#e66767',
      7: '#d55181',
      8: '#d95926',
    },
  },
} as const;

export type TreePrimitives = typeof treePrimitives;

/**
 * Alpha values the theme layer composes over a primitive. Kept here for the
 * same reason the hexes are: `rgba(31, 35, 40, 0.5)` written inline in a theme
 * is a literal colour, and the layer rule is that literals live in one file.
 */
export const treeAlpha = {
  /** Modal and drawer scrim. */
  overlay: { light: 0.5, dark: 0.6 },
  /** Focus ring, over the brand colour. */
  focusRing: 0.32,
} as const;
