import { parseHex, withAlpha } from './color';
import { treeAlpha, treePrimitives as p } from './primitives';

/** Compose an alpha primitive over a colour primitive. */
const alpha = (color: string, amount: number) => withAlpha(parseHex(color), amount);

export const treeTokens = {
  font: {
    family: {
      sans: "'Google Sans Flex', 'Segoe UI', sans-serif",
      mono: "'Google Sans Code', 'SFMono-Regular', monospace",
    },
    size: {
      xs: '0.6875rem',
      sm: '0.8125rem',
      md: '0.9375rem',
      base: '0.9375rem',
      lg: '1.125rem',
      xl: '1.375rem',
      // `2xl` used to repeat `xl` verbatim, which made every
      // `clamp(xl … 2xl)` a constant and left a hole between 1.375 and 1.75rem.
      // It now fills that hole; `xl` is unchanged, since it is the more used of
      // the two. `tokens.test.ts` keeps the scale strictly increasing.
      '2xl': '1.5rem',
      '3xl': '1.75rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    weight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      compact: '1.1',
      ui: '1.15',
      tight: '1.25',
      heading: '1.3',
      base: '1.5',
      body: '1.6',
      relaxed: '1.65',
    },
    tracking: {
      tight: '-0.02em',
      normal: '0em',
      wide: '0.08em',
    },
  },
  space: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    12: '3rem',
    16: '4rem',
  },
  radius: {
    sm: '0.375rem',
    md: '0.625rem',
    lg: '0.875rem',
    pill: '999px',
  },
  // Elevation. The geometry is theme-independent and lives here; the *colour*
  // comes from `--tree-color-shadow-rgb`, which the theme sets — a slate shadow
  // was being emitted on `:root` and reused verbatim on the dark surface, where
  // a near-black umbra is what actually reads.
  shadow: {
    xs: '0 1px 2px rgba(var(--tree-color-shadow-rgb), 0.06)',
    sm: '0 6px 18px rgba(var(--tree-color-shadow-rgb), 0.08)',
    md: '0 14px 34px rgba(var(--tree-color-shadow-rgb), 0.12)',
    // Marketing-scale elevation: a large, soft lift for a hero card or a banded
    // section, where `md` reads flat. Same neutral shadow colour as the smaller
    // steps, so the whole scale stays one family.
    lg: '0 24px 48px -24px rgba(var(--tree-color-shadow-rgb), 0.22)',
    xl: '0 40px 80px -32px rgba(var(--tree-color-shadow-rgb), 0.28)',
    // Elevation tinted by whatever accent is in scope (see `--tree-color-accent-*`
    // and the `accent` prop on TSection/THero/TPageSurface), so a surface's glow
    // follows its accent instead of being written by hand per landing page.
    accent:
      '0 24px 48px -32px color-mix(in srgb, var(--tree-color-accent-primary) 60%, transparent)',
  },
  // Brand gradient for high-emphasis surfaces (e.g. the primary CTA).
  // References the theme brand vars so it follows light/dark automatically;
  // override `--tree-gradient-brand` to match a product's marketing gradient.
  gradient: {
    brand: 'linear-gradient(135deg, var(--tree-color-brand-primary), var(--tree-color-brand-hover))',
  },
  border: {
    width: {
      subtle: '1px',
      strong: '1.5px',
    },
  },
  /**
   * Opacity for the parts of a disabled control that carry no text — an icon,
   * a thumbnail, a toolbar. Anywhere a label sits on a surface, disabled is a
   * colour instead (`--tree-color-state-disabled-*`), because opacity cannot be
   * measured for contrast. This replaces eight different hand-picked values.
   */
  opacity: {
    disabled: '0.5',
  },
  motion: {
    duration: {
      fast: '100ms',
      moderate: '200ms',
      normal: '300ms',
      slow: '400ms',
      slower: '500ms',
    },
    easing: {
      standard: 'cubic-bezier(0.2, 0, 0, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
  size: {
    control: {
      sm: '2rem',
      md: '2.5rem',
      lg: '3rem',
    },
    icon: {
      sm: '1rem',
      md: '1.25rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
  },
  layout: {
    grid: {
      columns: '12',
      base: '8px',
    },
    gutter: {
      sm: '1rem',
      md: '1.5rem',
    },
    margin: {
      sm: '1.5rem',
      md: '2rem',
      lg: '3rem',
    },
  },
  z: {
    base: '1',
    dropdown: '1000',
    popover: '1050',
    sticky: '1100',
    overlay: '1200',
    modal: '1300',
    toast: '1400',
  },
  breakpoint: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

/**
 * Layer 2 — semantics. This is the public API of the colour system: the list a
 * product fills in, and the only colour layer a component is allowed to name.
 * Every value here is a primitive reference, never a literal.
 *
 * Interactive states (hover on a surface, press, disabled, selected) are NOT
 * here — the library derives them from these roles in `states.ts`. The one
 * exception is `brand.hover` / `accent.hover`, which shipped as public before
 * the derived layer existed and stays public for compatibility.
 *
 * The authoritative, versioned list of these roles is `contract.ts`.
 */
export const treeThemes = {
  light: {
    color: {
      bg: {
        primary: p.gray[50],
        surface: p.gray[0],
        subtle: p.gray[100],
      },
      border: {
        default: p.gray[200],
        strong: p.gray[300],
        // `border.interactive` is deliberately absent: WCAG 1.4.11 asks for 3:1
        // on the boundary that *identifies* a control, and `default` measures
        // 1.45:1 here — fine for a card edge, not fine for the only thing
        // telling a user where an input is. The library derives a passing value
        // from `strong` (see states.ts); a product may set one, and it is
        // validated the same way.
      },
      text: {
        primary: p.gray.ink,
        muted: p.gray[600],
        inverse: p.gray[0],
      },
      /** Umbra as an `r, g, b` triple so the elevation scale can vary alpha. */
      'shadow-rgb': '15, 23, 42',
      brand: {
        primary: p.blue[500],
        hover: p.blue[600],
        soft: p.blue[50],
        contrast: p.gray[0],
      },
      // Secondary brand accent — a closed axis, never a free colour. It is what
      // `TTag tone="accent"` paints with, and the default value of the surface
      // `accent` axis (TSection/THero/TPageSurface), which remaps these four
      // variables when a product wants a status hue instead. Derived with
      // `deriveBrandRamp` from #8957e5 so the accent stays legible as text on
      // its own soft tint (measured 4.77:1) and on every background.
      accent: {
        primary: p.purple[500],
        hover: p.purple[600],
        soft: p.purple[50],
        contrast: p.gray[0],
      },
      status: {
        success: p.green[500],
        warning: p.amber[500],
        error: p.red[500],
        info: p.blue[500],
      },
      // Categorical data-viz palette. Fixed hue order (blue → orange), validated
      // for CVD separation and contrast against the light surface. Assign in order;
      // the components cycle after 8 as a fallback, but prefer folding a 9th+
      // category into "Other".
      chart: p.dataviz.light,
      overlay: alpha(p.gray.ink, treeAlpha.overlay.light),
      'focus-ring': alpha(p.blue[500], treeAlpha.focusRing),
    },
  },
  dark: {
    color: {
      bg: {
        primary: p.gray[900],
        surface: p.gray[850],
        subtle: p.gray[800],
      },
      border: {
        default: p.gray[700],
        strong: p.gray[650],
      },
      text: {
        primary: p.gray.inkDark,
        muted: p.gray.inkDarkMuted,
        inverse: p.gray[900],
      },
      /** Near-black umbra: a slate shadow is invisible on a dark surface. */
      'shadow-rgb': '0, 0, 0',
      brand: {
        primary: p.blue[400],
        hover: p.blue[450],
        soft: p.blue[800],
        contrast: p.blue[900],
      },
      // Dark pair of the secondary accent (same #8957e5 seed, stepped for the
      // dark surface). Measured 5.93:1 on bg-primary, 4.67:1 on bg-subtle and
      // 4.72:1 on its own soft tint — AA on every background, and above what
      // the dark brand pair itself clears. `accent.test.ts` holds that bar.
      accent: {
        primary: p.purple[400],
        hover: p.purple[300],
        soft: p.purple[800],
        contrast: p.gray[900],
      },
      status: {
        success: p.green[400],
        warning: p.amber[400],
        error: p.red[400],
        info: p.blue[300],
      },
      // Same hue order stepped for the dark surface (not a separate palette) —
      // each step re-validated for the dark band and >= 3:1 on the dark surface.
      chart: p.dataviz.dark,
      overlay: alpha(p.gray[950], treeAlpha.overlay.dark),
      'focus-ring': alpha(p.blue[400], treeAlpha.focusRing),
    },
  },
} as const;

export type TreeTokens = typeof treeTokens;
export type TreeThemes = typeof treeThemes;
export type TreeThemeName = keyof TreeThemes;
/** The semantic colour block a theme is made of — what a product fills in. */
export type TreeThemeColors = TreeThemes[TreeThemeName]['color'];
