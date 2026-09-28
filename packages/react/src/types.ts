/**
 * Shared contract types for the React package.
 *
 * Re-exported from `@treeui/tokens` rather than re-declared. They used to be a
 * hand-typed copy of `@treeui/vue`'s list, with a comment promising to
 * centralize them — this is that. A closed vocabulary kept in three places is
 * not closed, and the two ports (Compose, egui) generate their enums from the
 * same source.
 */
export type {
  TAccent,
  TActionTone,
  TBadgeTone,
  TBreakpoint,
  TCardVariant,
  TFieldWidth,
  TSize,
  TTooltipSide,
  TVariant,
} from '@treeui/tokens';
