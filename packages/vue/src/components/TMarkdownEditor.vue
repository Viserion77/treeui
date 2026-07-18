<script setup lang="ts">
import { computed, ref, useAttrs, nextTick } from 'vue';
import type { TSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    size?: TSize;
    disabled?: boolean;
    placeholder?: string;
    uploadImage?: (file: File) => Promise<string>;
    sanitize?: (html: string) => string;
  }>(),
  {
    modelValue: '',
    size: 'md',
    disabled: false,
    placeholder: 'Write your markdown here...',
    uploadImage: undefined,
    sanitize: undefined,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'image-upload': [file: File, url: string];
  'image-upload-error': [file: File, error: Error];
}>();

defineSlots<{
  toolbar?: () => unknown;
}>();

const attrs = useAttrs();
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const isUploading = ref(false);

const rootClasses = computed(() => [
  't-md-editor',
  `t-md-editor--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-uploading': isUploading.value,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const editorAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const stringValue = computed(() => `${props.modelValue ?? ''}`);

const onInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
};

/* ──────── Toolbar Actions ──────── */

const insertAtCursor = (before: string, after = '') => {
  const el = textareaRef.value;
  if (!el) return;

  const start = el.selectionStart;
  const end = el.selectionEnd;
  const text = stringValue.value;
  const selected = text.slice(start, end);

  const newText = text.slice(0, start) + before + selected + after + text.slice(end);
  emit('update:modelValue', newText);

  nextTick(() => {
    el.focus();
    const cursorPos = selected
      ? start + before.length + selected.length + after.length
      : start + before.length;
    el.setSelectionRange(cursorPos, cursorPos);
  });
};

const insertHeading = (level: number) => {
  const prefix = '#'.repeat(level) + ' ';
  const el = textareaRef.value;
  if (!el) return;

  const start = el.selectionStart;
  const text = stringValue.value;

  // Find start of current line
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const lineEnd = text.indexOf('\n', start);
  const actualEnd = lineEnd === -1 ? text.length : lineEnd;
  const line = text.slice(lineStart, actualEnd);

  // Strip existing heading markers
  const stripped = line.replace(/^#{1,6}\s*/, '');
  const newLine = prefix + stripped;

  const newText = text.slice(0, lineStart) + newLine + text.slice(actualEnd);
  emit('update:modelValue', newText);

  nextTick(() => {
    el.focus();
    el.setSelectionRange(lineStart + newLine.length, lineStart + newLine.length);
  });
};

const insertBold = () => insertAtCursor('**', '**');
const insertItalic = () => insertAtCursor('_', '_');
const insertCode = () => insertAtCursor('`', '`');
const insertCodeBlock = () => insertAtCursor('\n```\n', '\n```\n');
const insertLink = () => insertAtCursor('[', '](url)');
const insertList = () => insertAtCursor('\n- ');
const insertOrderedList = () => insertAtCursor('\n1. ');
const insertQuote = () => insertAtCursor('\n> ');
const insertHr = () => insertAtCursor('\n---\n');

/* ──────── Markdown → HTML rendering ──────── */

const renderedHtml = computed(() => {
  const html = markdownToHtml(stringValue.value);
  // Escape hatch: the built-in rendering escapes HTML and allowlists URL
  // schemes, but consumers with a stricter policy can pass their own
  // sanitizer (DOMPurify or similar) instead of forking the component.
  return props.sanitize ? props.sanitize(html) : html;
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function markdownToHtml(md: string): string {
  if (!md) return '';

  const lines = md.split('\n');
  const html: string[] = [];
  let inCodeBlock = false;
  let inList = false;
  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        html.push('</code></pre>');
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        html.push('<pre class="t-md-editor__code-block"><code>');
      }
      continue;
    }

    if (inCodeBlock) {
      html.push(escapeHtml(line));
      html.push('\n');
      continue;
    }

    // Close open lists if needed
    const isUnorderedListItem = /^[-*+]\s/.test(line.trim());
    const isOrderedListItem = /^\d+\.\s/.test(line.trim());

    if (inList && !isUnorderedListItem) {
      html.push('</ul>');
      inList = false;
    }
    if (inOrderedList && !isOrderedListItem) {
      html.push('</ol>');
      inOrderedList = false;
    }

    // Horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
      html.push('<hr class="t-md-editor__hr" />');
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      html.push(`<h${level} class="t-md-editor__heading t-md-editor__heading--${level}">${inlineMarkdown(escapeHtml(headingMatch[2]))}</h${level}>`);
      continue;
    }

    // Blockquote
    if (line.trim().startsWith('> ')) {
      html.push(`<blockquote class="t-md-editor__blockquote">${inlineMarkdown(escapeHtml(line.trim().slice(2)))}</blockquote>`);
      continue;
    }

    // Unordered list
    if (isUnorderedListItem) {
      if (!inList) {
        html.push('<ul class="t-md-editor__list">');
        inList = true;
      }
      html.push(`<li>${inlineMarkdown(escapeHtml(line.trim().slice(2)))}</li>`);
      continue;
    }

    // Ordered list
    if (isOrderedListItem) {
      if (!inOrderedList) {
        html.push('<ol class="t-md-editor__list t-md-editor__list--ordered">');
        inOrderedList = true;
      }
      const content = line.trim().replace(/^\d+\.\s/, '');
      html.push(`<li>${inlineMarkdown(escapeHtml(content))}</li>`);
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      html.push('<br />');
      continue;
    }

    // Paragraph
    html.push(`<p class="t-md-editor__paragraph">${inlineMarkdown(escapeHtml(line))}</p>`);
  }

  // Close any open blocks
  if (inCodeBlock) html.push('</code></pre>');
  if (inList) html.push('</ul>');
  if (inOrderedList) html.push('</ol>');

  return html.join('\n');
}

/* ──────── URL safety ──────── */

// A URL carries a scheme only when a colon follows a valid scheme name.
// Anything else (`/path`, `./path`, `#anchor`, `?q=1`) is relative and cannot
// introduce a new scheme, so it is safe. `//host/path` is protocol-relative:
// it keeps the page's protocol but points at another host, so it can navigate
// off-origin. That is allowed — it is a link, not script — and `rel="noopener
// noreferrer"` on the anchor covers the tab-nabbing side of it.
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/;
// Navigable schemes. `javascript:`, `vbscript:`, `data:` and friends are
// rejected — everything reaching inlineMarkdown is already HTML-escaped, so
// the URL scheme is the only remaining way to get script into the preview.
const SAFE_LINK_SCHEME = /^(https?|mailto|tel):/;
const SAFE_IMAGE_SCHEME = /^https?:/;
// Inline raster images are useful for pasted screenshots. `image/svg+xml` is
// deliberately excluded: SVG is a document format that can carry script and
// external references, not just pixels.
const SAFE_IMAGE_DATA_URL = /^data:image\/(png|jpe?g|gif|webp|avif|bmp|x-icon|vnd\.microsoft\.icon)[;,]/;

const fromCodePoint = (code: number) =>
  Number.isFinite(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';

// Reduce a URL to the form a browser would act on before testing its scheme:
// decode character references, drop control characters and whitespace, and
// lowercase. This defeats `JaVaScRiPt:`, ` javascript:`, `java\tscript:`,
// `java\x00script:` and `&#106;avascript:` style evasion.
function normalizeUrl(url: string): string {
  return url
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#x([0-9a-f]+);?/gi, (_match, hex: string) => fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);?/g, (_match, dec: string) => fromCodePoint(parseInt(dec, 10)))
    // eslint-disable-next-line no-control-regex -- matching control characters is the point
    .replace(/[\x00-\x20\x7f]/g, '')
    .toLowerCase();
}

function isSafeLinkUrl(url: string): boolean {
  const normalized = normalizeUrl(url);
  return !HAS_SCHEME.test(normalized) || SAFE_LINK_SCHEME.test(normalized);
}

function isSafeImageUrl(url: string): boolean {
  const normalized = normalizeUrl(url);
  if (!HAS_SCHEME.test(normalized)) return true;
  return SAFE_IMAGE_SCHEME.test(normalized) || SAFE_IMAGE_DATA_URL.test(normalized);
}

// Placeholder delimiter for generated markup. NUL is stripped from the input
// before any token is created, so a placeholder can never collide with user
// text, and it survives the emphasis passes because none of them treat it as
// a delimiter.
const TOKEN = '\x00';
// eslint-disable-next-line no-control-regex -- matching control characters is the point
const TOKEN_PATTERN = /\x00(\d+)\x00/g;

function inlineMarkdown(text: string): string {
  const tokens: string[] = [];
  // Park generated markup outside the emphasis passes below. Without this,
  // `_(.+?)_` eats the underscore in the generated target="_blank" and any
  // underscore inside a URL.
  const token = (html: string) => {
    tokens.push(html);
    return `${TOKEN}${tokens.length - 1}${TOKEN}`;
  };
  const inert = (source: string) => token(`<span class="t-md-editor__blocked-link">${source}</span>`);

  // eslint-disable-next-line no-control-regex -- matching control characters is the point
  text = text.replace(/\x00/g, '');

  // Images: ![alt](url) — alt is a plain-text attribute, so the whole tag is parked.
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt: string, url: string) =>
    isSafeImageUrl(url)
      ? token(`<img src="${url}" alt="${alt}" class="t-md-editor__image" loading="lazy" />`)
      : inert(match),
  );
  // Links: [text](url) — only the tags are parked so the label still formats.
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label: string, url: string) =>
    isSafeLinkUrl(url)
      ? `${token(`<a href="${url}" target="_blank" rel="noopener noreferrer">`)}${label}${token('</a>')}`
      : inert(match),
  );
  // Bold: **text**
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic: _text_ or *text*
  text = text.replace(/_(.+?)_/g, '<em>$1</em>');
  text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  // Inline code: `text`
  text = text.replace(/`(.+?)`/g, '<code class="t-md-editor__inline-code">$1</code>');
  // Strikethrough: ~~text~~
  text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');

  return text.replace(TOKEN_PATTERN, (_match, index: string) => tokens[Number(index)]);
}

/* ──────── Image paste / drop handling ──────── */

const handlePaste = async (event: ClipboardEvent) => {
  if (props.disabled) return;

  const items = event.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      event.preventDefault();
      const file = item.getAsFile();
      if (file) await processImageUpload(file);
      return;
    }
  }
};

const handleDrop = async (event: DragEvent) => {
  if (props.disabled) return;

  const files = event.dataTransfer?.files;
  if (!files) return;

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      event.preventDefault();
      await processImageUpload(file);
    }
  }
};

const handleDragOver = (event: DragEvent) => {
  if (props.disabled) return;
  event.preventDefault();
};

const processImageUpload = async (file: File) => {
  if (!props.uploadImage) {
    // Fallback: insert a placeholder with the file name
    insertAtCursor(`![${file.name}]()`);
    return;
  }

  // Insert uploading placeholder
  const placeholder = `![Uploading ${file.name}...]()`;
  insertAtCursor(placeholder);
  isUploading.value = true;

  try {
    const url = props.uploadImage(file);
    const resolvedUrl = url instanceof Promise ? await url : url;

    // Replace placeholder with actual URL
    const currentValue = stringValue.value;
    const newValue = currentValue.replace(placeholder, `![${file.name}](${resolvedUrl})`);
    emit('update:modelValue', newValue);
    emit('image-upload', file, resolvedUrl);
  } catch (err) {
    // Remove placeholder on error
    const currentValue = stringValue.value;
    const newValue = currentValue.replace(placeholder, '');
    emit('update:modelValue', newValue);
    emit('image-upload-error', file, err instanceof Error ? err : new Error(String(err)));
  } finally {
    isUploading.value = false;
  }
};

/* ──────── Keyboard shortcuts ──────── */

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;

  const mod = event.metaKey || event.ctrlKey;
  if (!mod) return;

  switch (event.key) {
    case 'b':
      event.preventDefault();
      insertBold();
      break;
    case 'i':
      event.preventDefault();
      insertItalic();
      break;
    case 'k':
      event.preventDefault();
      insertLink();
      break;
    case 'e':
      event.preventDefault();
      insertCode();
      break;
  }
};

</script>

<template>
  <div
    v-bind="editorAttrs"
    :class="rootClasses"
    :style="rootStyle"
  >
    <!-- Toolbar -->
    <div
      class="t-md-editor__toolbar"
      role="toolbar"
      aria-label="Markdown formatting"
    >
      <div class="t-md-editor__toolbar-group">
        <button
          type="button"
          class="t-md-editor__toolbar-btn"
          title="Heading 1 (H1)"
          :disabled="disabled"
          @click="insertHeading(1)"
        >
          H1
        </button>
        <button
          type="button"
          class="t-md-editor__toolbar-btn"
          title="Heading 2 (H2)"
          :disabled="disabled"
          @click="insertHeading(2)"
        >
          H2
        </button>
        <button
          type="button"
          class="t-md-editor__toolbar-btn"
          title="Heading 3 (H3)"
          :disabled="disabled"
          @click="insertHeading(3)"
        >
          H3
        </button>
      </div>

      <div
        class="t-md-editor__toolbar-divider"
        role="separator"
      />

      <div class="t-md-editor__toolbar-group">
        <button
          type="button"
          class="t-md-editor__toolbar-btn"
          title="Bold (Ctrl+B)"
          :disabled="disabled"
          @click="insertBold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          class="t-md-editor__toolbar-btn"
          title="Italic (Ctrl+I)"
          :disabled="disabled"
          @click="insertItalic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          class="t-md-editor__toolbar-btn"
          title="Strikethrough"
          :disabled="disabled"
          @click="insertAtCursor('~~', '~~')"
        >
          <del>S</del>
        </button>
      </div>

      <div
        class="t-md-editor__toolbar-divider"
        role="separator"
      />

      <div class="t-md-editor__toolbar-group">
        <button
          type="button"
          class="t-md-editor__toolbar-btn"
          title="Inline code (Ctrl+E)"
          :disabled="disabled"
          @click="insertCode"
        >
          &lt;/&gt;
        </button>
        <button
          type="button"
          class="t-md-editor__toolbar-btn"
          title="Code block"
          :disabled="disabled"
          @click="insertCodeBlock"
        >
          { }
        </button>
        <button
          type="button"
          class="t-md-editor__toolbar-btn"
          title="Link (Ctrl+K)"
          :disabled="disabled"
          @click="insertLink"
        >
          🔗
        </button>
      </div>

      <div
        class="t-md-editor__toolbar-divider"
        role="separator"
      />

      <div class="t-md-editor__toolbar-group">
        <button
          type="button"
          class="t-md-editor__toolbar-btn"
          title="Unordered list"
          :disabled="disabled"
          @click="insertList"
        >
          •&nbsp;List
        </button>
        <button
          type="button"
          class="t-md-editor__toolbar-btn"
          title="Ordered list"
          :disabled="disabled"
          @click="insertOrderedList"
        >
          1.&nbsp;List
        </button>
        <button
          type="button"
          class="t-md-editor__toolbar-btn"
          title="Blockquote"
          :disabled="disabled"
          @click="insertQuote"
        >
          &gt;
        </button>
        <button
          type="button"
          class="t-md-editor__toolbar-btn"
          title="Horizontal rule"
          :disabled="disabled"
          @click="insertHr"
        >
          ―
        </button>
      </div>

      <slot name="toolbar" />
    </div>

    <!-- Editor body -->
    <div class="t-md-editor__body">
      <!-- Write pane -->
      <div
        class="t-md-editor__pane t-md-editor__pane--write"
      >
        <textarea
          ref="textareaRef"
          class="t-md-editor__textarea"
          :value="stringValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :aria-label="placeholder"
          @input="onInput"
          @paste="handlePaste"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @keydown="handleKeydown"
        />
      </div>

      <!-- Preview pane -->
      <div
        class="t-md-editor__pane t-md-editor__pane--preview"
        aria-label="Markdown preview"
      >
        <!-- eslint-disable vue/no-v-html -->
        <div
          class="t-md-editor__preview"
          v-html="renderedHtml"
        />
        <!-- eslint-enable vue/no-v-html -->
      </div>
    </div>

    <!-- Upload indicator -->
    <div
      v-if="isUploading"
      class="t-md-editor__upload-bar"
      role="status"
      aria-live="polite"
    >
      Uploading image…
    </div>
  </div>
</template>
