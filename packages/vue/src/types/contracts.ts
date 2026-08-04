export const treeSizes = ['sm', 'md', 'lg'] as const;
export const treeVariants = ['solid', 'outline', 'ghost', 'soft', 'danger'] as const;
export const treeCardVariants = ['outline', 'soft', 'inset'] as const;
export const treeTooltipSides = ['top', 'right', 'bottom', 'left'] as const;
export const treeDrawerSides = ['top', 'right', 'bottom', 'left'] as const;
/**
 * Inline-size scale for form controls. Controls fill their container by default
 * (`full`); the other steps cap them at a comfortable reading width while still
 * shrinking on narrow screens.
 */
export const treeFieldWidths = ['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const;
/**
 * The closed accent axis a surface can declare (TSection, THero, TPageSurface)
 * and every descendant inherits through `--tree-color-accent-*`. Same vocabulary
 * TLinkTile's `tone` uses: a product picks a tone, never a free colour. Left
 * unset, the accent is the secondary brand accent shipped by `@treeui/tokens`.
 */
export const treeAccents = ['brand', 'neutral', 'success', 'warning', 'danger', 'info'] as const;
/** Breakpoint names shared with `--tree-breakpoint-*` in `@treeui/tokens`. */
export const treeBreakpoints = ['sm', 'md', 'lg', 'xl'] as const;

export type TSize = (typeof treeSizes)[number];
export type TAccent = (typeof treeAccents)[number];
export type TBreakpoint = (typeof treeBreakpoints)[number];
export type TFieldWidth = (typeof treeFieldWidths)[number];
export type TVariant = (typeof treeVariants)[number];
export type TCardVariant = (typeof treeCardVariants)[number];
export type TTooltipSide = (typeof treeTooltipSides)[number];
export type TDrawerSide = (typeof treeDrawerSides)[number];

