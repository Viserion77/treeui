---
"@treeui/vue": minor
---

Clear the remaining queued TREEUX items in one batch: the popover close contract, two new list primitives, the rich menu compound, and the responsive-rail policy.

**TPopover — `close()` method + slot arg (TREEUX-015)**

`close(options?)` is exposed via template ref and passed to the default slot, so content dismisses the panel after a navigation or action without a v-model watcher or manual focus handling. Focus restore follows a heuristic: without options it returns focus to the trigger only if focus is inside the panel at close time; `restoreFocus: true/false` forces or suppresses it; an external v-model change follows the same heuristic; an outside pointer never steals focus; Escape always restores. Replaces the consumer's `useTriggerFocusRestore`.

**TList + TListItem (TREEUX-002)**

A non-selectable content list: plain `<ul>`/`<li>` with `leading`/`default`/`meta`/`actions` regions and a `size` scale. Unlike TSelectableList (role=listbox), the rows carry no selection semantics, so the `actions` region holds real interactive controls. On a narrow container `meta` drops below the content while `actions` stay visible — the list never owns or auto-collapses an overflow.

**TMenu + TMenuGroup + TMenuItem (TREEUX-007)**

A slot-driven rich action menu built on TPopover, coexisting with TDropdown (which stays the data-driven lightweight menu). `role="menu"` with the header rendered outside it; `TMenuGroup` adds a non-focusable labelled group; `TMenuItem` supports action / `href` / `to` link items, icon + description + meta, a `danger` variant (the label text carries the meaning, not colour alone), and a `menuitemradio` mode via `checked` for a workspace switch. Roving focus (arrows/Home/End, skipping disabled), Escape and item selection close through TPopover's `close()` — one focus-restore contract, reused, not duplicated.

**TDescriptionList + TDescriptionItem (TREEUX-005)**

A key/value list with real `<dl>`/`<dt>`/`<dd>` semantics and per-row `actions` (e.g. copy) as siblings of the value. On a narrow container the label moves above the value — right for long values like ARNs. Distinct from TList: a description list announces label/value pairs.

**TAppShell — `railBreakpoint` responsive policy (TREEUX-011)**

The responsive policy now measures the shell root via ResizeObserver (not the viewport, not the content panel — avoiding the feedback loop the panel would cause). `railBreakpoint` enables three states: drawer below `breakpoint`, auto-forced collapsed rail between `breakpoint` and `railBreakpoint`, and the user's manual collapse preference at/above it. The auto-rail band never mutates the manual preference and emits no `update:collapsed`/`collapse-change`; the preference returns when the width grows back. `breakpoint` now accepts px/rem/em and is the drawer boundary.

Practice conformance updated: `TMenu` → interaction-feedback, accessible-by-default, token-driven; `TPopover` → accessible-by-default; `TList` / `TDescriptionList` → content-alignment, token-driven.
