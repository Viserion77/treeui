---
'@treeui/vue': minor
---

**Security:** `TMarkdownEditor` no longer renders links or images whose URL uses
an unsafe scheme. `[click](javascript:…)` previously reached the DOM as a live
`href` and executed on click — the preview escapes HTML, so the URL scheme was
the one remaining way to get script into it. Links now allow `http`, `https`,
`mailto`, `tel` and relative URLs; images allow `http`, `https` and non-SVG
`data:image/*`. A rejected URL renders as inert text marked with
`t-md-editor__blocked-link` rather than being silently dropped.

Adds a `sanitize?: (html: string) => string` prop so an app can apply its own
policy (DOMPurify or otherwise) on top. No sanitizer is bundled.

Also fixes the inline renderer corrupting its own output: the emphasis pass ran
over already-generated HTML, so `target="_blank"` lost its underscore whenever a
line held two links, and any URL containing `_` had `<em>` injected into its
`href`. Links and images are now tokenized before the emphasis passes.

**If you render user-authored markdown, this is a required upgrade.**
