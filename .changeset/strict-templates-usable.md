---
"@treeui/vue": minor
---

Make the `GlobalComponents` typing actually reach a consumer, and actually
usable (TREEUX-008 / TREEUX-011).

**It was unreachable.** `global-components.d.ts` shipped in `dist/` referenced
by nothing: a bare side-effect import is elided from the emitted `index.d.ts`,
so the augmentation never loaded in a consumer's program. The barrel now
re-exports a type from it, and `packaging.test.ts` fails if that regresses —
nothing else in the gates could catch it, because the source typechecks, the
tests pass, the file is in the tarball, and it is inert.

**It was unusable.** The augmentation only reports a wrong prop under
`vueCompilerOptions.strictTemplates`, which the previous note did not say — and
turning that on cost one consumer 87 errors from legitimate code for 2 real
ones. The passthrough surface is now declared instead of left to chance:

- `ComponentCustomProps` accepts ARIA (all `aria-*` and `role`), `id`, `title`,
  `tabindex`, `data-*` and native `on*` listeners on any component, because the
  library forwards `$attrs` to an inner element by design. "Remove the
  accessible name from a `TTable` to satisfy the type checker" is not an
  acceptable instruction.
- **Every v-model component declares `modelModifiers`**, so `v-model.trim` type-
  checks — and so the prop stops falling through to an inner element as an
  invalid DOM attribute, which is what it silently did while undeclared.
- `TInput` gains `readonly`, which it forwards to the native field.

Both halves are held by `pnpm typecheck:strict-templates`, which checks a
consumer-style template that must compile AND a known-bad one whose six dead
props must still error. Checking only the first would let a later change "fix"
the noise by allowing everything.
