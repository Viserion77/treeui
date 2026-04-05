export const treeSizes = ['sm', 'md', 'lg'] as const;
export const treeVariants = ['solid', 'outline', 'ghost', 'soft', 'danger'] as const;
export const treeCardVariants = ['outline', 'soft', 'solid'] as const;
export const treeTooltipSides = ['top', 'right', 'bottom', 'left'] as const;
export const treeDrawerSides = ['top', 'right', 'bottom', 'left'] as const;

export type TreeSize = (typeof treeSizes)[number];
export type TreeVariant = (typeof treeVariants)[number];
export type TreeCardVariant = (typeof treeCardVariants)[number];
export type TreeTooltipSide = (typeof treeTooltipSides)[number];
export type TreeDrawerSide = (typeof treeDrawerSides)[number];

