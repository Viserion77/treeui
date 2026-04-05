<script setup lang="ts">
import { computed, ref, useAttrs, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import type { TreeSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    size?: TreeSize;
    disabled?: boolean;
    placeholder?: string;
    uploadImage?: (file: File) => Promise<string>;
    previewMode?: 'split' | 'tab';
    initialTab?: 'write' | 'preview';
  }>(),
  {
    modelValue: '',
    size: 'md',
    disabled: false,
    placeholder: 'Write your markdown here...',
    uploadImage: undefined,
    previewMode: 'split',
    initialTab: 'write',
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
const activeTab = ref<'write' | 'preview'>(props.initialTab);
const isUploading = ref(false);

const rootClasses = computed(() => [
  'tree-md-editor',
  `tree-md-editor--${props.size}`,
  `tree-md-editor--${props.previewMode}`,
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
  return markdownToHtml(stringValue.value);
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
  let listType = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        html.push('</code></pre>');
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        html.push('<pre class="tree-md-editor__code-block"><code>');
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
      html.push('<hr class="tree-md-editor__hr" />');
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      html.push(`<h${level} class="tree-md-editor__heading tree-md-editor__heading--${level}">${inlineMarkdown(escapeHtml(headingMatch[2]))}</h${level}>`);
      continue;
    }

    // Blockquote
    if (line.trim().startsWith('> ')) {
      html.push(`<blockquote class="tree-md-editor__blockquote">${inlineMarkdown(escapeHtml(line.trim().slice(2)))}</blockquote>`);
      continue;
    }

    // Unordered list
    if (isUnorderedListItem) {
      if (!inList) {
        html.push('<ul class="tree-md-editor__list">');
        inList = true;
      }
      html.push(`<li>${inlineMarkdown(escapeHtml(line.trim().slice(2)))}</li>`);
      continue;
    }

    // Ordered list
    if (isOrderedListItem) {
      if (!inOrderedList) {
        html.push('<ol class="tree-md-editor__list tree-md-editor__list--ordered">');
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
    html.push(`<p class="tree-md-editor__paragraph">${inlineMarkdown(escapeHtml(line))}</p>`);
  }

  // Close any open blocks
  if (inCodeBlock) html.push('</code></pre>');
  if (inList) html.push('</ul>');
  if (inOrderedList) html.push('</ol>');

  return html.join('\n');
}

function inlineMarkdown(text: string): string {
  // Images: ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="tree-md-editor__image" loading="lazy" />');
  // Links: [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  // Bold: **text**
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic: _text_ or *text*
  text = text.replace(/_(.+?)_/g, '<em>$1</em>');
  text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  // Inline code: `text`
  text = text.replace(/`(.+?)`/g, '<code class="tree-md-editor__inline-code">$1</code>');
  // Strikethrough: ~~text~~
  text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');
  return text;
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

/* ──────── Tab switching (tab mode) ──────── */

const switchTab = (tab: 'write' | 'preview') => {
  activeTab.value = tab;
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
      class="tree-md-editor__toolbar"
      role="toolbar"
      aria-label="Markdown formatting"
    >
      <div class="tree-md-editor__toolbar-group">
        <button
          type="button"
          class="tree-md-editor__toolbar-btn"
          title="Heading 1 (H1)"
          :disabled="disabled"
          @click="insertHeading(1)"
        >
          H1
        </button>
        <button
          type="button"
          class="tree-md-editor__toolbar-btn"
          title="Heading 2 (H2)"
          :disabled="disabled"
          @click="insertHeading(2)"
        >
          H2
        </button>
        <button
          type="button"
          class="tree-md-editor__toolbar-btn"
          title="Heading 3 (H3)"
          :disabled="disabled"
          @click="insertHeading(3)"
        >
          H3
        </button>
      </div>

      <div class="tree-md-editor__toolbar-divider" role="separator" />

      <div class="tree-md-editor__toolbar-group">
        <button
          type="button"
          class="tree-md-editor__toolbar-btn"
          title="Bold (Ctrl+B)"
          :disabled="disabled"
          @click="insertBold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          class="tree-md-editor__toolbar-btn"
          title="Italic (Ctrl+I)"
          :disabled="disabled"
          @click="insertItalic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          class="tree-md-editor__toolbar-btn"
          title="Strikethrough"
          :disabled="disabled"
          @click="insertAtCursor('~~', '~~')"
        >
          <del>S</del>
        </button>
      </div>

      <div class="tree-md-editor__toolbar-divider" role="separator" />

      <div class="tree-md-editor__toolbar-group">
        <button
          type="button"
          class="tree-md-editor__toolbar-btn"
          title="Inline code (Ctrl+E)"
          :disabled="disabled"
          @click="insertCode"
        >
          &lt;/&gt;
        </button>
        <button
          type="button"
          class="tree-md-editor__toolbar-btn"
          title="Code block"
          :disabled="disabled"
          @click="insertCodeBlock"
        >
          { }
        </button>
        <button
          type="button"
          class="tree-md-editor__toolbar-btn"
          title="Link (Ctrl+K)"
          :disabled="disabled"
          @click="insertLink"
        >
          🔗
        </button>
      </div>

      <div class="tree-md-editor__toolbar-divider" role="separator" />

      <div class="tree-md-editor__toolbar-group">
        <button
          type="button"
          class="tree-md-editor__toolbar-btn"
          title="Unordered list"
          :disabled="disabled"
          @click="insertList"
        >
          •&nbsp;List
        </button>
        <button
          type="button"
          class="tree-md-editor__toolbar-btn"
          title="Ordered list"
          :disabled="disabled"
          @click="insertOrderedList"
        >
          1.&nbsp;List
        </button>
        <button
          type="button"
          class="tree-md-editor__toolbar-btn"
          title="Blockquote"
          :disabled="disabled"
          @click="insertQuote"
        >
          &gt;
        </button>
        <button
          type="button"
          class="tree-md-editor__toolbar-btn"
          title="Horizontal rule"
          :disabled="disabled"
          @click="insertHr"
        >
          ―
        </button>
      </div>

      <slot name="toolbar" />

      <!-- Tab buttons (only in tab mode) -->
      <div
        v-if="previewMode === 'tab'"
        class="tree-md-editor__tabs"
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          class="tree-md-editor__tab"
          :class="{ 'is-active': activeTab === 'write' }"
          :aria-selected="activeTab === 'write'"
          :disabled="disabled"
          @click="switchTab('write')"
        >
          Write
        </button>
        <button
          type="button"
          role="tab"
          class="tree-md-editor__tab"
          :class="{ 'is-active': activeTab === 'preview' }"
          :aria-selected="activeTab === 'preview'"
          :disabled="disabled"
          @click="switchTab('preview')"
        >
          Preview
        </button>
      </div>
    </div>

    <!-- Editor body -->
    <div class="tree-md-editor__body">
      <!-- Write pane -->
      <div
        v-show="previewMode === 'split' || activeTab === 'write'"
        class="tree-md-editor__pane tree-md-editor__pane--write"
        :role="previewMode === 'tab' ? 'tabpanel' : undefined"
      >
        <textarea
          ref="textareaRef"
          class="tree-md-editor__textarea"
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
        v-show="previewMode === 'split' || activeTab === 'preview'"
        class="tree-md-editor__pane tree-md-editor__pane--preview"
        :role="previewMode === 'tab' ? 'tabpanel' : undefined"
        aria-label="Markdown preview"
      >
        <div
          class="tree-md-editor__preview"
          v-html="renderedHtml"
        />
      </div>
    </div>

    <!-- Upload indicator -->
    <div
      v-if="isUploading"
      class="tree-md-editor__upload-bar"
      role="status"
      aria-live="polite"
    >
      Uploading image…
    </div>
  </div>
</template>
