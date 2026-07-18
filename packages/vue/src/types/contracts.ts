export const treeSizes = ['sm', 'md', 'lg'] as const;
export const treeVariants = ['solid', 'outline', 'ghost', 'soft', 'danger'] as const;
export const treeCardVariants = ['outline', 'soft', 'solid', 'inset'] as const;
export const treeTooltipSides = ['top', 'right', 'bottom', 'left'] as const;
export const treeDrawerSides = ['top', 'right', 'bottom', 'left'] as const;
/**
 * Inline-size scale for form controls. Controls fill their container by default
 * (`full`); the other steps cap them at a comfortable reading width while still
 * shrinking on narrow screens.
 */
export const treeFieldWidths = ['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const;

export type TSize = (typeof treeSizes)[number];
export type TFieldWidth = (typeof treeFieldWidths)[number];
export type TVariant = (typeof treeVariants)[number];
export type TCardVariant = (typeof treeCardVariants)[number];
export type TTooltipSide = (typeof treeTooltipSides)[number];
export type TDrawerSide = (typeof treeDrawerSides)[number];

