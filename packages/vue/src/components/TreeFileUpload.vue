<script setup lang="ts">
import { createId, isActivationKey } from '@treeui/utils';
import { computed, onBeforeUnmount, onMounted, ref, useAttrs } from 'vue';
import type { TreeSize } from '../types/contracts';
import TreeSpinner from './TreeSpinner.vue';

defineOptions({
  inheritAttrs: false,
});

export type TreeFileUploadRejectionReason =
  | 'file-invalid-type'
  | 'file-too-large'
  | 'too-many-files';

export interface TreeFileUploadRejection {
  file: File;
  reason: TreeFileUploadRejectionReason;
  message: string;
}

const slots = defineSlots<{
  icon?: () => unknown;
  default?: (props: {
    files: File[];
    isDragActive: boolean;
    openFileDialog: () => void;
    clearFiles: () => void;
  }) => unknown;
  file?: (props: {
    file: File;
    index: number;
    removeFile: () => void;
  }) => unknown;
  actions?: (props: {
    files: File[];
    openFileDialog: () => void;
    clearFiles: () => void;
  }) => unknown;
}>();

const props = withDefaults(
  defineProps<{
    modelValue?: File[];
    size?: TreeSize;
    disabled?: boolean;
    loading?: boolean;
    invalid?: boolean;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number | null;
    maxFileSize?: number | null;
    label?: string;
    description?: string;
    buttonLabel?: string;
    filesLabel?: string;
    paste?: boolean;
    drop?: boolean;
    showFileList?: boolean;
  }>(),
  {
    modelValue: () => [],
    size: 'md',
    disabled: false,
    loading: false,
    invalid: false,
    accept: '',
    multiple: true,
    label: 'Drop files here',
    description: 'Click to browse, drag and drop, or paste with Ctrl+V.',
    buttonLabel: 'Browse files',
    filesLabel: 'Selected files',
    maxFiles: null,
    maxFileSize: null,
    paste: true,
    drop: true,
    showFileList: true,
  },
);

const emit = defineEmits<{
  'update:modelValue': [files: File[]];
  'files-accepted': [files: File[]];
  'files-rejected': [rejections: TreeFileUploadRejection[]];
}>();

const attrs = useAttrs();
const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const isDragActive = ref(false);
const isFocusedWithin = ref(false);
const dragDepth = ref(0);
const feedbackMessages = ref<string[]>([]);

const uploadId = createId('tree-file-upload');
const descriptionId = `${uploadId}-description`;
const feedbackId = `${uploadId}-feedback`;
const filesId = `${uploadId}-files`;

const isUnavailable = computed(() => props.disabled || props.loading);
const hasFiles = computed(() => props.modelValue.length > 0);
const hasCustomBody = computed(() => Boolean(slots.default));

const effectiveMaxFiles = computed(() => {
  if (!props.multiple) {
    return 1;
  }

  if (typeof props.maxFiles !== 'number') {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(props.maxFiles, 0);
});

const rootClasses = computed(() => [
  'tree-file-upload',
  `tree-file-upload--${props.size}`,
  {
    'is-disabled': isUnavailable.value,
    'is-invalid': props.invalid,
    'is-loading': props.loading,
    'is-drag-active': isDragActive.value,
    'has-files': hasFiles.value,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const describedBy = computed(() => {
  const ids: string[] = [];

  if (props.description && !hasCustomBody.value) {
    ids.push(descriptionId);
  }

  if (feedbackMessages.value.length > 0) {
    ids.push(feedbackId);
  }

  if (props.showFileList && hasFiles.value) {
    ids.push(filesId);
  }

  return ids.length > 0 ? ids.join(' ') : undefined;
});

const selectedFilesLabel = computed(() => `${props.filesLabel} (${props.modelValue.length})`);

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }

  const units = ['KB', 'MB', 'GB'];
  let value = size / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const roundedValue = value >= 10 || Number.isInteger(value)
    ? Math.round(value)
    : Number(value.toFixed(1));

  return `${roundedValue} ${units[unitIndex]}`;
};

const fileKey = (file: File, index: number) =>
  `${file.name}-${file.size}-${file.lastModified}-${index}`;

const matchesAccept = (file: File) => {
  if (!props.accept.trim()) {
    return true;
  }

  const tokens = props.accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  return tokens.some((token) => {
    if (token.startsWith('.')) {
      return fileName.endsWith(token);
    }

    if (token.endsWith('/*')) {
      return fileType.startsWith(token.slice(0, -1));
    }

    return fileType === token;
  });
};

const buildRejectionMessage = (
  file: File,
  reason: TreeFileUploadRejectionReason,
) => {
  switch (reason) {
    case 'file-invalid-type':
      return `${file.name} is not an accepted file type.`;
    case 'file-too-large':
      return `${file.name} exceeds the ${formatFileSize(props.maxFileSize ?? 0)} limit.`;
    case 'too-many-files':
      return `You can only add up to ${effectiveMaxFiles.value} file${effectiveMaxFiles.value === 1 ? '' : 's'}.`;
    default:
      return `${file.name} could not be added.`;
  }
};

const resetInputValue = () => {
  if (inputRef.value) {
    inputRef.value.value = '';
  }
};

const openFileDialog = () => {
  if (isUnavailable.value) {
    return;
  }

  inputRef.value?.click();
};

const emitFiles = (
  nextFiles: File[],
  acceptedFiles: File[],
  rejections: TreeFileUploadRejection[],
) => {
  feedbackMessages.value = rejections.map((rejection) => rejection.message);

  if (rejections.length > 0) {
    emit('files-rejected', rejections);
  }

  if (acceptedFiles.length > 0) {
    emit('update:modelValue', nextFiles);
    emit('files-accepted', acceptedFiles);
  }
};

const processFiles = (incomingFiles: File[]) => {
  if (isUnavailable.value || incomingFiles.length === 0) {
    return;
  }

  const nextFiles = props.multiple ? [...props.modelValue] : [];
  const acceptedFiles: File[] = [];
  const rejections: TreeFileUploadRejection[] = [];
  let remainingSlots = Number.isFinite(effectiveMaxFiles.value)
    ? Math.max(effectiveMaxFiles.value - nextFiles.length, 0)
    : Number.POSITIVE_INFINITY;

  for (const file of incomingFiles) {
    if (remainingSlots <= 0) {
      rejections.push({
        file,
        reason: 'too-many-files',
        message: buildRejectionMessage(file, 'too-many-files'),
      });
      continue;
    }

    if (!matchesAccept(file)) {
      rejections.push({
        file,
        reason: 'file-invalid-type',
        message: buildRejectionMessage(file, 'file-invalid-type'),
      });
      continue;
    }

    if (
      typeof props.maxFileSize === 'number' &&
      props.maxFileSize > 0 &&
      file.size > props.maxFileSize
    ) {
      rejections.push({
        file,
        reason: 'file-too-large',
        message: buildRejectionMessage(file, 'file-too-large'),
      });
      continue;
    }

    acceptedFiles.push(file);
    nextFiles.push(file);

    if (Number.isFinite(remainingSlots)) {
      remainingSlots -= 1;
    }
  }

  emitFiles(nextFiles, acceptedFiles, rejections);
};

const removeFile = (index: number) => {
  if (isUnavailable.value) {
    return;
  }

  feedbackMessages.value = [];
  emit('update:modelValue', props.modelValue.filter((_, fileIndex) => fileIndex !== index));
};

const clearFiles = () => {
  if (isUnavailable.value || !hasFiles.value) {
    return;
  }

  feedbackMessages.value = [];
  emit('update:modelValue', []);
};

const hasTransferFiles = (dataTransfer?: DataTransfer | null) => {
  if (!dataTransfer) {
    return false;
  }

  return dataTransfer.files.length > 0 || Array.from(dataTransfer.types).includes('Files');
};

const getClipboardFiles = (
  clipboardData?: Pick<DataTransfer, 'items'> | null,
) => {
  if (!clipboardData?.items) {
    return [];
  }

  return Array.from(clipboardData.items)
    .map((item) => item.getAsFile?.() ?? null)
    .filter((file): file is File => file instanceof File);
};

const onInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  processFiles(Array.from(target.files ?? []));
  resetInputValue();
};

const onDropzoneKeydown = (event: KeyboardEvent) => {
  if (!isActivationKey(event) || isUnavailable.value) {
    return;
  }

  event.preventDefault();
  openFileDialog();
};

const onFocusIn = () => {
  isFocusedWithin.value = true;
};

const onFocusOut = (event: FocusEvent) => {
  const nextTarget = event.relatedTarget as Node | null;

  if (nextTarget && rootRef.value?.contains(nextTarget)) {
    return;
  }

  isFocusedWithin.value = false;
};

const onPaste = (event: ClipboardEvent) => {
  if (!props.paste || isUnavailable.value) {
    return;
  }

  const clipboardFiles = getClipboardFiles(event.clipboardData);

  if (clipboardFiles.length === 0) {
    return;
  }

  event.preventDefault();
  processFiles(clipboardFiles);
};

const onDocumentPaste = (event: Event) => {
  if (!isFocusedWithin.value || event.defaultPrevented) {
    return;
  }

  onPaste(event as ClipboardEvent);
};

const onDragEnter = (event: DragEvent) => {
  if (!props.drop || isUnavailable.value || !hasTransferFiles(event.dataTransfer)) {
    return;
  }

  event.preventDefault();
  dragDepth.value += 1;
  isDragActive.value = true;
};

const onDragOver = (event: DragEvent) => {
  if (!props.drop || isUnavailable.value || !hasTransferFiles(event.dataTransfer)) {
    return;
  }

  event.preventDefault();

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy';
  }

  isDragActive.value = true;
};

const onDragLeave = (event: DragEvent) => {
  if (!props.drop || isUnavailable.value || !hasTransferFiles(event.dataTransfer)) {
    return;
  }

  event.preventDefault();
  dragDepth.value = Math.max(dragDepth.value - 1, 0);

  if (dragDepth.value === 0) {
    isDragActive.value = false;
  }
};

const onDrop = (event: DragEvent) => {
  if (!props.drop || isUnavailable.value || !hasTransferFiles(event.dataTransfer)) {
    return;
  }

  event.preventDefault();
  dragDepth.value = 0;
  isDragActive.value = false;
  processFiles(Array.from(event.dataTransfer?.files ?? []));
};

onMounted(() => {
  document.addEventListener('paste', onDocumentPaste);
});

onBeforeUnmount(() => {
  document.removeEventListener('paste', onDocumentPaste);
});
</script>

<template>
  <div
    ref="rootRef"
    v-bind="rootAttrs"
    :class="rootClasses"
    :style="rootStyle"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @paste="onPaste"
  >
    <input
      :id="uploadId"
      ref="inputRef"
      class="tree-visually-hidden"
      type="file"
      :accept="accept || undefined"
      :multiple="multiple"
      :disabled="isUnavailable"
      @change="onInputChange"
    >

    <div
      class="tree-file-upload__dropzone"
      :aria-busy="loading || undefined"
      :aria-controls="showFileList && hasFiles ? filesId : undefined"
      :aria-describedby="describedBy"
      :aria-disabled="isUnavailable || undefined"
      :aria-invalid="invalid || undefined"
      role="button"
      :tabindex="isUnavailable ? -1 : 0"
      @click="openFileDialog"
      @keydown="onDropzoneKeydown"
      @dragenter="onDragEnter"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <div
        v-if="$slots.icon || !$slots.default"
        class="tree-file-upload__icon"
        aria-hidden="true"
      >
        <slot name="icon">
          <span class="tree-file-upload__icon-mark">+</span>
        </slot>
      </div>

      <div class="tree-file-upload__content">
        <slot
          :files="modelValue"
          :is-drag-active="isDragActive"
          :open-file-dialog="openFileDialog"
          :clear-files="clearFiles"
        >
          <p class="tree-file-upload__label">
            {{ label }}
          </p>
          <p
            v-if="description"
            :id="descriptionId"
            class="tree-file-upload__description"
          >
            {{ description }}
          </p>
          <span class="tree-file-upload__browse">
            {{ buttonLabel }}
          </span>
        </slot>
      </div>

      <TreeSpinner
        v-if="loading"
        class="tree-file-upload__spinner"
        size="sm"
        label="Uploading files"
      />
    </div>

    <ul
      v-if="feedbackMessages.length > 0"
      :id="feedbackId"
      class="tree-file-upload__feedback"
      aria-live="polite"
    >
      <li
        v-for="message in feedbackMessages"
        :key="message"
      >
        {{ message }}
      </li>
    </ul>

    <div
      v-if="showFileList && hasFiles"
      class="tree-file-upload__files"
    >
      <div class="tree-file-upload__files-header">
        <p
          :id="filesId"
          class="tree-file-upload__files-label"
        >
          {{ selectedFilesLabel }}
        </p>

        <button
          class="tree-file-upload__clear"
          type="button"
          :disabled="isUnavailable"
          @click="clearFiles"
        >
          Clear all
        </button>
      </div>

      <ul class="tree-file-upload__list">
        <li
          v-for="(file, index) in modelValue"
          :key="fileKey(file, index)"
          class="tree-file-upload__file"
        >
          <slot
            name="file"
            :file="file"
            :index="index"
            :remove-file="() => removeFile(index)"
          >
            <div class="tree-file-upload__file-copy">
              <p class="tree-file-upload__file-name">
                {{ file.name }}
              </p>
              <p class="tree-file-upload__file-meta">
                {{ formatFileSize(file.size) }}
              </p>
            </div>

            <button
              class="tree-file-upload__remove"
              type="button"
              :disabled="isUnavailable"
              :aria-label="`Remove ${file.name}`"
              @click="removeFile(index)"
            >
              Remove
            </button>
          </slot>
        </li>
      </ul>
    </div>

    <div
      v-if="$slots.actions"
      class="tree-file-upload__actions"
    >
      <slot
        name="actions"
        :files="modelValue"
        :open-file-dialog="openFileDialog"
        :clear-files="clearFiles"
      />
    </div>
  </div>
</template>
