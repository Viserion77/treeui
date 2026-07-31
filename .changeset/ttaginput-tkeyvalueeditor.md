---
"@treeui/vue": minor
---

Two new data-entry components for the LSS dashboard:

- **`TTagInput`** (TREEUX-001) — edit a list of free-text strings as
  addable/removable chips. `v-model` is `string[]`; Enter and comma confirm the
  current tag, Backspace on an empty field removes the last, pasted
  comma-separated text splits into tags, and values are trimmed and deduped
  silently. Chips reuse `TTag`. For selection from a fixed set, keep
  `TMultiSelect`/`TCombobox`.
- **`TKeyValueEditor`** (TREEUX-002, phase 1) — edit a `Record<string, string>`
  as key/value rows with inline per-row validation (empty and duplicate keys are
  flagged and blocked from commit without blocking typing) plus a
  `validity-change` event for an aggregated `TFormField` summary. Copy is
  localizable via `labels`. This is the non-sensitive mode where the full value
  round-trips; a write-only/sensitive mode is a separate, queued contract.
