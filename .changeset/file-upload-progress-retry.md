---
"@treeui/vue": minor
"@treeui/mcp": minor
---

feat(file-upload): per-file upload state, resumable retry, and thumbnails

`TFileUpload` can now render the whole lifecycle of an upload instead of only the
picked file list.

- **`uploadState`** — a new prop taking either a `ReadonlyMap<File, TFileUploadState>`
  or a `(file, index) => TFileUploadState | undefined` resolver. Both shapes key on the
  `File` object (never on index or name), and an unknown `File` renders name + meta only.
- **Per-row progress** — determinate or indeterminate bar, percentage, uploaded bytes,
  and a remaining-time estimate, composed into one status line. An errored bar holds its
  last progress in the error tone rather than resetting, so the resume offer stays legible.
- **`retry` / `cancel` events** — Retry offers `Resume from 90%` when the state is
  `resumable`, otherwise a plain restart; Remove and Clear all emit `cancel` so in-flight
  requests can be aborted.
- **Thumbnails** — client-only object URLs for image files, revoked on removal and unmount,
  with an extension chip for everything else (and for SSR, so hydration matches).
- **New props**: `dragLabel`, `dragRejectLabel`, `thumbnails`, `maxThumbnailSize`,
  `retryLabel`, `resumeLabel`, `remainingTimeFormat`, `statusLabels`.
- **New slots**: `file` and `file-status` for per-row customization.
- **New exported types**: `TFileUploadState`, `TFileUploadStateSource`, `TFileUploadStatus`,
  `TFileUploadRetryPayload`, `TFileUploadCancelPayload`, `TFileUploadFileSlotProps`.

**BREAKING** — `loading` is now presentational on `TFileUpload`. It previously disabled the
dropzone, the native input, Clear all, and every Remove, which made it impossible to remove
file 1 while file 4 was uploading. It now only conveys busy state (`aria-busy`, `is-loading`).
Use `:disabled` to reproduce the old behavior; prefer driving `uploadState` and freezing
nothing. This aligns `loading` with the other form value controls (`TInput`, `TSelect`,
`TTextarea`, `TCombobox`), where it has always been presentational.

Accessibility: terminal transitions are announced with filenames through a polite
`role="log"` region that appends each message, so a retry failing with the identical error
is still announced; percentages reach assistive tech via each row's progressbar rather than
the live region; and focus is rescued when a focused Retry unmounts.

`@treeui/mcp`: catalog regenerated for the new `TFileUpload` surface.
