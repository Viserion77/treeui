---
'@treeui/tokens': minor
'@treeui/react': minor
'@treeui/vue': patch
---

The closed vocabularies move into `@treeui/tokens`, and the token model gains a second and third rendering.

**A closed set kept in four places is not closed.** `sm | md | lg`, `solid | outline | ghost | soft`, the seven action tones — these are design decisions, not framework ones, and every ecosystem that renders TreeUI has to reproduce exactly the same members. They lived in `@treeui/vue`'s `types/contracts.ts`, which meant `@treeui/react` shipped a hand-typed copy with a comment promising to centralize it, and a non-web target had nowhere to import them from at all. They now live in `@treeui/tokens`: `treeSizes`, `treeVariants`, `treeCardVariants`, `treeActionTones`, `treeBadgeTones`, `treeAccents`, `treeBreakpoints`, `treeFieldWidths`, `treeTooltipSides`, `treeDrawerSides`, with their types.

Nothing moves for a consumer. `@treeui/vue`'s `types/contracts.ts` re-exports every name it exported before, and `TBadgeTone` is still exported from `TBadge` as well as from the shared surface. `@treeui/react`'s types are now re-exports rather than re-declarations, which also adds `TAccent`, `TActionTone`, `TBreakpoint`, `TFieldWidth` and `TTooltipSide` to its public surface.

**`@treeui/tokens` can now render itself for a target that has no CSS.** `css.ts` has always emitted custom properties; `native.ts` resolves the same model into numbers and colours — `rem` into pixels, `color-mix()` into a real alpha, the elevation scale tinted by each theme's own umbra, the brand gradient into an angle and stops — and `kotlin.ts` and `rust.ts` emit source from that. New exports: `resolveNativeTokens`, `nativeParityReport`, `resolveTone`, `NATIVE_TONES`, `NATIVE_TOKEN_GROUPS`, `NATIVE_VOCABULARIES`, `createKotlinTokens`, `createRustTokens`.

`nativeParityReport` is the part that matters: it compares the stylesheet's variables with the resolved model key by key, and `native.test.ts` fails the build on a token that is in one and not the other. Adding a token without teaching the resolver about it would otherwise turn a second ecosystem into a stale copy of the design system — which is worse than no copy, because it still looks authoritative.

**The tone axis is data now, and the stylesheet is tested against it.** The mapping from a tone to the ten colours it resolves to only ever existed as seven blocks of `.t-button--tone-*` assignments. It is `NATIVE_TONES`, and a new `tone-contract.test.ts` parses the shipped stylesheet and fails when the two disagree, so one decision has three renderings and no hand-maintained copy.

**A deprecated member is declared as one.** `treeDeprecatedVariants` names `danger` — a colour trapped in the shape scale, which is why the tone axis exists — so a generator can leave it out. It keeps working on the web, where removing it would break consumers.

`TButton`'s tone axis is also documented at last. It has shipped since the axis was introduced, but the Vue Storybook had no `tone` control and no tone story — so the decision that motivated splitting colour out of the shape scale was only visible in `DECISIONS.md`. Three stories now cover it: every tone, one tone across all four variants, and the row the axis exists for — a destructive action sitting quietly among other quiet ones.

Also in this release: `TTagInput`'s and `TAppShell`'s example and test fixtures use neutral sample data, and a number of source comments, contract notes and changelog entries that justified a decision by pointing at an external application now state the same claim as a property of the problem. No behaviour changes with any of it.
