/**
 * The closed vocabularies.
 *
 * `sm | md | lg`, `solid | outline | ghost | soft`, the seven action tones —
 * these are design decisions, not framework ones, and every ecosystem that
 * renders TreeUI has to reproduce exactly the same sets. They lived in
 * `@treeui/vue`'s `types/contracts.ts`, which meant `@treeui/react` kept a
 * hand-typed copy (with a comment saying so) and the Compose and egui ports had
 * nowhere to import them from at all. Three copies of a closed set is how a set
 * stops being closed.
 *
 * They belong here for the same reason the colour contract does: this is the
 * package with no framework in it. `@treeui/vue` and `@treeui/react` re-export
 * these so existing imports keep working; the Kotlin and Rust ports generate
 * their enums from them.
 *
 * A vocabulary is CLOSED: a product picks a member, never a free value. That is
 * what makes a design system checkable — an open `color` prop cannot be
 * validated for contrast, and an open `size` cannot be aligned.
 */

/** Size steps, shared by most components. */
export const treeSizes = ['sm', 'md', 'lg'] as const;

/**
 * Shape scale for an action surface.
 *
 * `danger` is a colour trapped in a shape scale — it can only ever be a filled
 * red button — which is why the tone axis exists. See `treeDeprecatedVariants`.
 */
export const treeVariants = ['solid', 'outline', 'ghost', 'soft', 'danger'] as const;

/**
 * Members that still resolve on the web for compatibility but are NOT part of
 * the contract a new ecosystem should reproduce.
 *
 * Declared rather than commented so the Kotlin and Rust emitters can leave them
 * out: a port built today has no compatibility to keep, and shipping a known
 * mistake into a second ecosystem to match the first is how a deprecation
 * becomes permanent. `variant="solid" tone="danger"` is the spelling that
 * replaces it, and it composes with `outline`, `ghost` and `soft` too.
 */
export const treeDeprecatedVariants = ['danger'] as const;

/**
 * Surface scale for a card. Not action variants — `solid` is deliberately
 * absent; see `DECISIONS.md` -> "Variant Vocabulary".
 */
export const treeCardVariants = ['outline', 'soft', 'inset'] as const;

/**
 * Colour axis for an action surface, orthogonal to `variant`.
 *
 * The runtime mapping from a tone to the ten colours it resolves to lives in
 * `native.ts` -> `NATIVE_TONES`.
 */
export const treeActionTones = [
  'neutral',
  'brand',
  'accent',
  'success',
  'warning',
  'danger',
  'info',
] as const;

/**
 * Tone set for a component that STATES something rather than offering an
 * action: a badge, a status dot, an inline pill.
 *
 * Deliberately narrower than `treeActionTones` — no `brand`, no `accent`. A
 * badge reporting "failed" is describing state, and a brand-coloured state has
 * nothing to describe; the two open sets look similar enough that sharing one
 * would let `tone="brand"` reach a component where it means nothing.
 */
export const treeBadgeTones = ['neutral', 'success', 'warning', 'danger', 'info'] as const;

/**
 * The accent axis a surface can declare and every descendant inherits. Same
 * rule as a tone: a product picks a member, never a free colour.
 */
export const treeAccents = ['brand', 'neutral', 'success', 'warning', 'danger', 'info'] as const;

/** Breakpoint names, shared with `--tree-breakpoint-*`. */
export const treeBreakpoints = ['sm', 'md', 'lg', 'xl'] as const;

/**
 * Inline-size scale for form controls. Controls fill their container by default
 * (`full`); the other steps cap them at a comfortable reading width while still
 * shrinking on narrow screens.
 */
export const treeFieldWidths = ['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const;

/** Placement for a tooltip, relative to its trigger. */
export const treeTooltipSides = ['top', 'right', 'bottom', 'left'] as const;

/** Edge a drawer enters from. */
export const treeDrawerSides = ['top', 'right', 'bottom', 'left'] as const;

export type TSize = (typeof treeSizes)[number];
export type TVariant = (typeof treeVariants)[number];
export type TDeprecatedVariant = (typeof treeDeprecatedVariants)[number];
export type TCardVariant = (typeof treeCardVariants)[number];
export type TActionTone = (typeof treeActionTones)[number];
export type TBadgeTone = (typeof treeBadgeTones)[number];
export type TAccent = (typeof treeAccents)[number];
export type TBreakpoint = (typeof treeBreakpoints)[number];
export type TFieldWidth = (typeof treeFieldWidths)[number];
export type TTooltipSide = (typeof treeTooltipSides)[number];
export type TDrawerSide = (typeof treeDrawerSides)[number];
