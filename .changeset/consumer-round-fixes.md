---
"@treeui/vue": minor
---

Fixes for the two components the LSS dashboard rejected in validation.

**`TKeyValueEditor` — data loss under the idiomatic binding.** The watcher that
rebuilt the rows from `modelValue` compared by REFERENCE, and a parent holding
the map in `reactive()`/`ref()` hands back a proxy that is never `===` the raw
object the editor emitted. The guard therefore failed on every keystroke and
rebuilt the rows from the COMMITTED record — which by contract omits the row
being edited — so clearing a key deleted that row and its value. The comparison
is now by content, and row ids of surviving keys are reused, so an external
change patches inputs instead of remounting them and stealing the caret.

Three more, found in the same review:

- `validity-change` is emitted **on mount** and whenever `modelValue` changes
  from outside, not only on keystroke. A `Record` can arrive invalid (`{"": "x"}`
  is a legitimate `Record<string, string>`), and after an external reset the rows
  could render clean while the consumer's aggregated summary still said invalid.
  Repeat emissions of an unchanged validity are suppressed.
- `invalid` is no longer inert: it draws an error rail and sets `aria-invalid` on
  the now-`role="group"` root. It previously applied a class with no rule behind
  it.
- An incoming `id` lands on the first key input instead of the wrapper `div`, so
  a `TFormField` label names a real control.

**`TTagInput` — three ways a value could vanish.**

- **`allowDuplicates`** — dedupe is right for a set of names and wrong for an
  ordered argument list, where `--param a --param b` is meaningful. The emit
  guard also compared array lengths, so a dropped duplicate emitted nothing while
  the field cleared anyway: typed value, no chip, no event.
- **`separator`** (`string | string[] | null`) — the comma was a fixed separator
  with no escape, so `--param=tags=a,b` silently became two arguments. `null`
  makes Enter the only confirm.
- **`commitOnBlur`** (default `true`) — typing the last value and clicking Save
  dropped it with no warning. `commit()` is exposed for an explicit flush.
- Pasting a lone separator no longer strands the text in the field.
