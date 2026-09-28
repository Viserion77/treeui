/**
 * Shared contract types for the Vue package.
 *
 * The closed vocabularies themselves now live in `@treeui/tokens` — they are
 * design decisions rather than Vue ones, and `@treeui/react` plus the Compose
 * and egui ports have to reproduce exactly the same sets. This file re-exports
 * them so every existing import keeps working, and is where a genuinely
 * Vue-specific contract type would go.
 */
export {
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
  type TAccent,
  type TActionTone,
  type TBadgeTone,
  type TBreakpoint,
  type TCardVariant,
  type TDeprecatedVariant,
  type TDrawerSide,
  type TFieldWidth,
  type TSize,
  type TTooltipSide,
  type TVariant,
} from '@treeui/tokens';
