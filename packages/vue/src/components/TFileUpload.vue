<script setup lang="ts">
import { createId, isActivationKey } from '@treeui/utils';
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue';
import type { TSize } from '../types/contracts';
import TProgress from './TProgress.vue';
import TSpinner from './TSpinner.vue';

defineOptions({
  inheritAttrs: false,
});

export type TFileUploadRejectionReason =
  | 'file-invalid-type'
  | 'file-too-large'
  | 'too-many-files';

export interface TFileUploadRejection {
  file: File;
  reason: TFileUploadRejectionReason;
  message: string;
}

export type TFileUploadStatus =
  | 'pending'
  | 'uploading'
  | 'paused'
  | 'error'
  | 'success';

export interface TFileUploadState {
  status: TFileUploadStatus;
  progress?: number;
  uploadedBytes?: number;
  remainingMs?: number;
  remainingLabel?: string;
  error?: string;
  resumable?: boolean;
  retryable?: boolean;
  thumbnailUrl?: string;
  meta?: string;
}

export type TFileUploadStateSource =
  | ReadonlyMap<File, TFileUploadState>
  | ((file: File, index: number) => TFileUploadState | undefined);

export interface TFileUploadRetryPayload {
  file: File;
  index: number;
  fileKey: string;
  mode: 'resume' | 'restart';
  state: TFileUploadState;
}

export interface TFileUploadCancelPayload {
  file: File;
  index: number;
  fileKey: string;
  state: TFileUploadState;
  reason: 'remove' | 'clear';
}

export interface TFileUploadFileSlotProps {
  file: File;
  index: number;
  fileKey: string;
  state: TFileUploadState | undefined;
  thumbnailUrl: string | undefined;
  sizeLabel: string;
  typeLabel: string;
  dimensionsLabel: string | undefined;
  progressLabel: string | undefined;
  remainingLabel: string | undefined;
  uploadedLabel: string | undefined;
  statusLabel: string | undefined;
  actionLabel: string | undefined;
  canRetry: boolean;
  retryMode: 'resume' | 'restart';
  isDragActive: boolean;
  isDragReject: boolean;
  removeFile: () => void;
  retryFile: () => void;
}

interface ThumbEntry {
  url: string;
  width: number | null;
  height: number | null;
}

interface FileRow {
  slotProps: TFileUploadFileSlotProps;
  rowClass: string | undefined;
  metaText: string;
  statusText: string;
  errorText: string | undefined;
  errorId: string | undefined;
  showProgress: boolean;
  progressValue: number | undefined;
  progressAriaLabel: string;
  isBusy: boolean;
  isSuccess: boolean;
}

const DEFAULT_STATUS_LABELS: Record<TFileUploadStatus, string> = {
  pending: 'Waiting',
  uploading: 'Uploading',
  paused: 'Paused',
  error: 'Upload failed',
  success: 'Uploaded',
};

// The status log keeps a bounded history of announcements. Old entries are
// trimmed rather than replaced in place so that each terminal transition
// inserts a brand new node: `aria-relevant` defaults to "additions text", so
// assistive tech announces the insertion and ignores the trim.
const STATUS_LOG_LIMIT = 5;

type StatusLogEntry = {
  id: number;
  text: string;
};

const slots = defineSlots<{
  icon?: () => unknown;
  default?: (props: {
    files: File[];
    isDragActive: boolean;
    isDragReject: boolean;
    openFileDialog: () => void;
    clearFiles: () => void;
  }) => unknown;
  file?: (props: TFileUploadFileSlotProps) => unknown;
  'file-status'?: (props: TFileUploadFileSlotProps) => unknown;
  actions?: (props: {
    files: File[];
    openFileDialog: () => void;
    clearFiles: () => void;
  }) => unknown;
}>();

const props = withDefaults(
  defineProps<{
    modelValue?: File[];
    size?: TSize;
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
    uploadState?: TFileUploadStateSource;
    dragLabel?: string;
    dragRejectLabel?: string;
    thumbnails?: boolean;
    maxThumbnailSize?: number | null;
    retryLabel?: string;
    resumeLabel?: (percent: number) => string;
    remainingTimeFormat?: (remainingMs: number) => string;
    statusLabels?: Partial<Record<TFileUploadStatus, string>>;
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
    uploadState: undefined,
    dragLabel: 'Release to upload',
    dragRejectLabel: 'This file type is not accepted',
    thumbnails: true,
    maxThumbnailSize: 10 * 1024 * 1024,
    retryLabel: 'Retry',
    resumeLabel: (percent: number) => `Resume from ${percent}%`,
    remainingTimeFormat: (remainingMs: number) => {
      if (remainingMs < 5000) {
        return 'Less than 5s left';
      }

      const seconds = Math.round(remainingMs / 1000);

      if (seconds < 60) {
        return `About ${seconds}s left`;
      }

      const minutes = Math.round(seconds / 60);

      if (minutes < 60) {
        return `About ${minutes} min left`;
      }

      return `About ${Math.round(minutes / 60)}h left`;
    },
    statusLabels: () => ({}),
  },
);

const emit = defineEmits<{
  'update:modelValue': [files: File[]];
  'files-accepted': [files: File[]];
  'files-rejected': [rejections: TFileUploadRejection[]];
  retry: [payload: TFileUploadRetryPayload];
  cancel: [payload: TFileUploadCancelPayload];
}>();

const attrs = useAttrs();
const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const isDragActive = ref(false);
const isDragReject = ref(false);
const isFocusedWithin = ref(false);
const dragDepth = ref(0);
const feedbackMessages = ref<string[]>([]);
const statusLog = ref<StatusLogEntry[]>([]);
let statusLogId = 0;
const retryFocusKey = ref<string | null>(null);
const thumbs = ref(new Map<File, ThumbEntry>());

const uploadId = createId('t-file-upload');
const descriptionId = `${uploadId}-description`;
const feedbackId = `${uploadId}-feedback`;
const filesId = `${uploadId}-files`;

const isDisabled = computed(() => props.disabled);
const hasFiles = computed(() => props.modelValue.length > 0);
const hasCustomBody = computed(() => Boolean(slots.default));

const resolvedStatusLabels = computed(() => ({
  ...DEFAULT_STATUS_LABELS,
  ...props.statusLabels,
}));

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
  't-file-upload',
  `t-file-upload--${props.size}`,
  {
    'is-disabled': isDisabled.value,
    'is-invalid': props.invalid,
    'is-loading': props.loading,
    'is-drag-active': isDragActive.value,
    'is-drag-reject': isDragReject.value,
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

const dropzoneLabel = computed(() => {
  if (isDragReject.value) {
    return props.dragRejectLabel;
  }

  return isDragActive.value ? props.dragLabel : props.label;
});

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

const formatFileType = (file: File) => {
  const dotIndex = file.name.lastIndexOf('.');
  const extension = dotIndex > 0 && dotIndex < file.name.length - 1
    ? file.name.slice(dotIndex + 1).toUpperCase()
    : '';

  if (extension && extension.length <= 5) {
    return extension;
  }

  const subtype = file.type.includes('/') ? file.type.split('/')[1] : '';

  return subtype ? subtype.toUpperCase() : 'FILE';
};

let keySeq = 0;
const keyCache = new WeakMap<File, string>();

const fileKeyFor = (file: File) => {
  let key = keyCache.get(file);

  if (!key) {
    keySeq += 1;
    key = `${uploadId}-f${keySeq}`;
    keyCache.set(file, key);
  }

  return key;
};

const acceptTokens = computed(() =>
  props.accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean),
);

const matchesAccept = (file: File) => {
  if (acceptTokens.value.length === 0) {
    return true;
  }

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  return acceptTokens.value.some((token) => {
    if (token.startsWith('.')) {
      return fileName.endsWith(token);
    }

    if (token.endsWith('/*')) {
      return fileType.startsWith(token.slice(0, -1));
    }

    return fileType === token;
  });
};

const canDetectDragReject = computed(() =>
  acceptTokens.value.length > 0 && acceptTokens.value.every((token) => token.includes('/')),
);

const matchesAcceptType = (type: string) => {
  const fileType = type.toLowerCase();

  if (!fileType) {
    return true;
  }

  return acceptTokens.value.some((token) =>
    token.endsWith('/*') ? fileType.startsWith(token.slice(0, -1)) : fileType === token,
  );
};

const detectDragReject = (dataTransfer?: DataTransfer | null) => {
  if (!canDetectDragReject.value || !dataTransfer) {
    return false;
  }

  const items = dataTransfer.items;

  if (!items || items.length === 0) {
    return false;
  }

  const fileItems = Array.from(items).filter((item) => item.kind === 'file');

  if (fileItems.length === 0) {
    return false;
  }

  return fileItems.every((item) => !matchesAcceptType(item.type));
};

const resolveState = (file: File, index: number) => {
  const source = props.uploadState;

  if (!source) {
    return undefined;
  }

  return typeof source === 'function' ? source(file, index) : source.get(file);
};

const resolvedStates = computed(() => props.modelValue.map(resolveState));

const canUseObjectUrl = () =>
  typeof window !== 'undefined' &&
  typeof URL !== 'undefined' &&
  typeof URL.createObjectURL === 'function' &&
  typeof URL.revokeObjectURL === 'function';

const isThumbnailable = (file: File) =>
  file.type.startsWith('image/') &&
  (props.maxThumbnailSize === null || file.size <= props.maxThumbnailSize);

const releaseAllThumbnails = () => {
  if (canUseObjectUrl()) {
    for (const entry of thumbs.value.values()) {
      URL.revokeObjectURL(entry.url);
    }
  }

  thumbs.value.clear();
};

const syncThumbnails = () => {
  if (!props.thumbnails || !canUseObjectUrl()) {
    releaseAllThumbnails();
    return;
  }

  const live = new Set(props.modelValue);

  for (const [file, entry] of [...thumbs.value]) {
    if (!live.has(file)) {
      URL.revokeObjectURL(entry.url);
      thumbs.value.delete(file);
    }
  }

  for (const file of props.modelValue) {
    if (thumbs.value.has(file) || !isThumbnailable(file)) {
      continue;
    }

    const url = URL.createObjectURL(file);
    thumbs.value.set(file, { url, width: null, height: null });

    const image = new Image();

    image.onload = () => {
      const current = thumbs.value.get(file);

      if (!current || current.url !== url) {
        return;
      }

      thumbs.value.set(file, { url, width: image.naturalWidth, height: image.naturalHeight });
    };

    image.src = url;
  }
};

const buildRejectionMessage = (
  file: File,
  reason: TFileUploadRejectionReason,
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
  if (isDisabled.value) {
    return;
  }

  inputRef.value?.click();
};

const emitFiles = (
  nextFiles: File[],
  acceptedFiles: File[],
  rejections: TFileUploadRejection[],
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
  if (isDisabled.value || incomingFiles.length === 0) {
    return;
  }

  const nextFiles = props.multiple ? [...props.modelValue] : [];
  const acceptedFiles: File[] = [];
  const rejections: TFileUploadRejection[] = [];
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

const emitCancel = (file: File, index: number, reason: 'remove' | 'clear') => {
  const state = resolvedStates.value[index];

  if (!state || (state.status !== 'uploading' && state.status !== 'paused')) {
    return;
  }

  emit('cancel', { file, index, fileKey: fileKeyFor(file), state, reason });
};

const removeFile = (index: number) => {
  if (isDisabled.value) {
    return;
  }

  const file = props.modelValue[index];

  if (file) {
    emitCancel(file, index, 'remove');
  }

  feedbackMessages.value = [];
  emit('update:modelValue', props.modelValue.filter((_, fileIndex) => fileIndex !== index));
};

const clearFiles = () => {
  if (isDisabled.value || !hasFiles.value) {
    return;
  }

  props.modelValue.forEach((file, index) => {
    emitCancel(file, index, 'clear');
  });

  feedbackMessages.value = [];
  emit('update:modelValue', []);
};

const rows = computed<FileRow[]>(() =>
  props.modelValue.map((file, index) => {
    const state = resolvedStates.value[index];
    const status = state?.status;
    const thumb = thumbs.value.get(file);
    const key = fileKeyFor(file);

    const progress = state?.progress;
    const percent = typeof progress === 'number' ? Math.round(progress) : undefined;
    const isResumable = state?.resumable === true;

    const canRetry = Boolean(
      state && (status === 'error' || status === 'paused') && state.retryable !== false,
    );
    const retryMode: 'resume' | 'restart' = isResumable ? 'resume' : 'restart';

    const sizeLabel = formatFileSize(file.size);
    const typeLabel = formatFileType(file);
    const dimensionsLabel = thumb && thumb.width !== null && thumb.height !== null
      ? `${thumb.width} × ${thumb.height}`
      : undefined;

    const progressLabel = status === 'uploading' && percent !== undefined
      ? `${percent}%`
      : undefined;

    let remainingLabel: string | undefined;

    if (status === 'uploading') {
      if (state?.remainingLabel) {
        remainingLabel = state.remainingLabel;
      } else if (
        typeof state?.remainingMs === 'number' &&
        Number.isFinite(state.remainingMs) &&
        state.remainingMs >= 0
      ) {
        remainingLabel = props.remainingTimeFormat(state.remainingMs);
      }
    }

    const uploadedLabel = (status === 'error' || status === 'paused') &&
      typeof state?.uploadedBytes === 'number'
      ? `${formatFileSize(state.uploadedBytes)} of ${sizeLabel} uploaded`
      : undefined;

    const statusLabel = status ? resolvedStatusLabels.value[status] : undefined;

    let actionLabel: string | undefined;

    if (canRetry) {
      actionLabel = isResumable && percent !== undefined
        ? props.resumeLabel(percent)
        : props.retryLabel;
    }

    const errorText = status === 'error' ? state?.error : undefined;

    const slotProps: TFileUploadFileSlotProps = {
      file,
      index,
      fileKey: key,
      state,
      thumbnailUrl: state?.thumbnailUrl ?? thumb?.url,
      sizeLabel,
      typeLabel,
      dimensionsLabel,
      progressLabel,
      remainingLabel,
      uploadedLabel,
      statusLabel,
      actionLabel,
      canRetry,
      retryMode,
      isDragActive: isDragActive.value,
      isDragReject: isDragReject.value,
      removeFile: () => removeFile(index),
      retryFile: () => {
        if (!canRetry || isDisabled.value || !state) {
          return;
        }

        emit('retry', { file, index, fileKey: key, mode: retryMode, state });
      },
    };

    return {
      slotProps,
      rowClass: status ? `is-${status}` : undefined,
      metaText: [typeLabel, sizeLabel, dimensionsLabel, state?.meta].filter(Boolean).join(' · '),
      statusText: [statusLabel, progressLabel, remainingLabel, uploadedLabel]
        .filter(Boolean)
        .join(' · '),
      errorText,
      errorId: errorText ? `${key}-error` : undefined,
      showProgress: Boolean(
        state &&
        (status === 'uploading' ||
          status === 'paused' ||
          status === 'error' ||
          (status === 'success' && percent !== undefined)),
      ),
      progressValue: status === 'uploading' ? progress : (progress ?? 0),
      progressAriaLabel: `${statusLabel ?? ''} ${file.name}`.trim(),
      isBusy: status === 'uploading',
      isSuccess: status === 'success',
    };
  }),
);

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
  if (!isActivationKey(event) || isDisabled.value) {
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

const onRetryFocus = (key: string) => {
  retryFocusKey.value = key;
};

const onRetryBlur = (key: string) => {
  if (retryFocusKey.value === key) {
    retryFocusKey.value = null;
  }
};

const onPaste = (event: ClipboardEvent) => {
  if (!props.paste || isDisabled.value) {
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
  if (!props.drop || isDisabled.value || !hasTransferFiles(event.dataTransfer)) {
    return;
  }

  event.preventDefault();
  dragDepth.value += 1;
  isDragActive.value = true;
  isDragReject.value = detectDragReject(event.dataTransfer);
};

const onDragOver = (event: DragEvent) => {
  if (!props.drop || isDisabled.value || !hasTransferFiles(event.dataTransfer)) {
    return;
  }

  event.preventDefault();

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy';
  }

  isDragActive.value = true;
  isDragReject.value = detectDragReject(event.dataTransfer);
};

const onDragLeave = (event: DragEvent) => {
  if (!props.drop || isDisabled.value || !hasTransferFiles(event.dataTransfer)) {
    return;
  }

  event.preventDefault();
  dragDepth.value = Math.max(dragDepth.value - 1, 0);

  if (dragDepth.value === 0) {
    isDragActive.value = false;
    isDragReject.value = false;
  }
};

const onDrop = (event: DragEvent) => {
  if (!props.drop || isDisabled.value || !hasTransferFiles(event.dataTransfer)) {
    return;
  }

  event.preventDefault();
  dragDepth.value = 0;
  isDragActive.value = false;
  isDragReject.value = false;
  processFiles(Array.from(event.dataTransfer?.files ?? []));
};

const previousStatuses = new Map<File, TFileUploadStatus>();

watch(
  resolvedStates,
  (states) => {
    const messages: string[] = [];
    const live = new Set<File>();

    props.modelValue.forEach((file, index) => {
      live.add(file);

      const status = states[index]?.status;

      if (!status) {
        return;
      }

      const previous = previousStatuses.get(file);

      if (previous === status) {
        return;
      }

      previousStatuses.set(file, status);

      if (previous === undefined) {
        return;
      }

      if (status === 'success') {
        messages.push(`${file.name} uploaded.`);
      } else if (status === 'error') {
        messages.push(`${file.name} failed. ${states[index]?.error ?? ''}`.trim());
      }
    });

    for (const file of [...previousStatuses.keys()]) {
      if (!live.has(file)) {
        previousStatuses.delete(file);
      }
    }

    if (messages.length > 0) {
      // Append instead of overwriting a single string: two identical messages
      // in a row (a retry that fails with the same error) would otherwise write
      // a byte-identical value, which `Object.is` suppresses — no DOM mutation,
      // so `aria-live` never fires and the repeat failure is announced as silence.
      statusLogId += 1;
      statusLog.value = [
        ...statusLog.value,
        { id: statusLogId, text: messages.join(' ') },
      ].slice(-STATUS_LOG_LIMIT);
    }
  },
  { flush: 'post', immediate: true },
);

watch(
  resolvedStates,
  () => {
    const key = retryFocusKey.value;
    const root = rootRef.value;

    if (!key || !root) {
      return;
    }

    if (document.activeElement && document.activeElement !== document.body) {
      return;
    }

    if (root.querySelector(`[data-t-retry="${key}"]`)) {
      return;
    }

    retryFocusKey.value = null;

    const fallback = root.querySelector<HTMLElement>(`[data-t-remove="${key}"]`) ??
      root.querySelector<HTMLElement>('.t-file-upload__dropzone');

    fallback?.focus();
  },
  { flush: 'post' },
);

watch(() => props.modelValue, syncThumbnails);
watch(() => props.thumbnails, syncThumbnails);

onMounted(() => {
  document.addEventListener('paste', onDocumentPaste);
  syncThumbnails();
});

onBeforeUnmount(() => {
  document.removeEventListener('paste', onDocumentPaste);
  releaseAllThumbnails();
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
      class="t-visually-hidden"
      type="file"
      :accept="accept || undefined"
      :multiple="multiple"
      :disabled="isDisabled"
      @change="onInputChange"
    >

    <div
      class="t-file-upload__dropzone"
      :aria-busy="loading || undefined"
      :aria-controls="showFileList && hasFiles ? filesId : undefined"
      :aria-describedby="describedBy"
      :aria-disabled="isDisabled || undefined"
      :aria-invalid="invalid || undefined"
      role="button"
      :tabindex="isDisabled ? -1 : 0"
      @click="openFileDialog"
      @keydown="onDropzoneKeydown"
      @dragenter="onDragEnter"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <div
        v-if="$slots.icon || !$slots.default"
        class="t-file-upload__icon"
        aria-hidden="true"
      >
        <slot name="icon">
          <span class="t-file-upload__icon-mark">+</span>
        </slot>
      </div>

      <div class="t-file-upload__content">
        <slot
          :files="modelValue"
          :is-drag-active="isDragActive"
          :is-drag-reject="isDragReject"
          :open-file-dialog="openFileDialog"
          :clear-files="clearFiles"
        >
          <p class="t-file-upload__label">
            {{ dropzoneLabel }}
          </p>
          <p
            v-if="description"
            :id="descriptionId"
            class="t-file-upload__description"
          >
            {{ description }}
          </p>
          <span class="t-file-upload__browse">
            {{ buttonLabel }}
          </span>
        </slot>
      </div>

      <TSpinner
        v-if="loading"
        class="t-file-upload__spinner"
        size="sm"
        label="Uploading files"
      />
    </div>

    <ul
      v-if="feedbackMessages.length > 0"
      :id="feedbackId"
      class="t-file-upload__feedback"
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
      class="t-file-upload__status-log t-visually-hidden"
      role="log"
      aria-live="polite"
    >
      <p
        v-for="entry in statusLog"
        :key="entry.id"
        class="t-file-upload__status-log-entry"
      >
        {{ entry.text }}
      </p>
    </div>

    <div
      v-if="showFileList && hasFiles"
      class="t-file-upload__files"
    >
      <div class="t-file-upload__files-header">
        <p
          :id="filesId"
          class="t-file-upload__files-label"
        >
          {{ selectedFilesLabel }}
        </p>

        <button
          class="t-file-upload__clear"
          type="button"
          :disabled="isDisabled"
          @click="clearFiles"
        >
          Clear all
        </button>
      </div>

      <ul class="t-file-upload__list">
        <li
          v-for="row in rows"
          :key="row.slotProps.fileKey"
          class="t-file-upload__file"
          :class="row.rowClass"
          :aria-busy="row.isBusy || undefined"
        >
          <slot
            name="file"
            v-bind="row.slotProps"
          >
            <span
              class="t-file-upload__thumb"
              aria-hidden="true"
            >
              <img
                v-if="row.slotProps.thumbnailUrl"
                class="t-file-upload__thumb-image"
                :src="row.slotProps.thumbnailUrl"
                alt=""
              >
              <span
                v-else
                class="t-file-upload__thumb-fallback"
              >
                {{ row.slotProps.typeLabel }}
              </span>
            </span>

            <div class="t-file-upload__file-copy">
              <p class="t-file-upload__file-name">
                {{ row.slotProps.file.name }}
              </p>
              <p class="t-file-upload__file-meta">
                {{ row.metaText }}
              </p>

              <slot
                name="file-status"
                v-bind="row.slotProps"
              >
                <div
                  v-if="row.showProgress"
                  class="t-file-upload__file-progress"
                >
                  <TProgress
                    size="sm"
                    :value="row.progressValue"
                    :label="row.progressAriaLabel"
                  />
                </div>

                <p
                  v-if="row.statusText"
                  class="t-file-upload__file-status"
                >
                  <span
                    v-if="row.isSuccess"
                    class="t-file-upload__proof"
                    aria-hidden="true"
                  >✓</span>{{ row.statusText }}
                </p>

                <p
                  v-if="row.errorText"
                  :id="row.errorId"
                  class="t-file-upload__file-error"
                >
                  {{ row.errorText }}
                </p>
              </slot>
            </div>

            <button
              v-if="row.slotProps.canRetry"
              class="t-file-upload__retry"
              type="button"
              :data-t-retry="row.slotProps.fileKey"
              :disabled="isDisabled"
              :aria-describedby="row.errorId"
              @focus="onRetryFocus(row.slotProps.fileKey)"
              @blur="onRetryBlur(row.slotProps.fileKey)"
              @click="row.slotProps.retryFile()"
            >
              {{ row.slotProps.actionLabel }}
            </button>

            <button
              class="t-file-upload__remove"
              type="button"
              :data-t-remove="row.slotProps.fileKey"
              :disabled="isDisabled"
              :aria-label="`Remove ${row.slotProps.file.name}`"
              @click="row.slotProps.removeFile()"
            >
              Remove
            </button>
          </slot>
        </li>
      </ul>
    </div>

    <div
      v-if="$slots.actions"
      class="t-file-upload__actions"
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
