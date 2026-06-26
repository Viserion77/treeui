export const treeSizes = ['sm', 'md', 'lg'] as const;
export const treeVariants = ['solid', 'outline', 'ghost', 'soft', 'danger'] as const;
export const treeCardVariants = ['outline', 'soft', 'solid', 'inset'] as const;
export const treeTooltipSides = ['top', 'right', 'bottom', 'left'] as const;
export const treeDrawerSides = ['top', 'right', 'bottom', 'left'] as const;

export type TSize = (typeof treeSizes)[number];
export type TVariant = (typeof treeVariants)[number];
export type TCardVariant = (typeof treeCardVariants)[number];
export type TTooltipSide = (typeof treeTooltipSides)[number];
export type TDrawerSide = (typeof treeDrawerSides)[number];

