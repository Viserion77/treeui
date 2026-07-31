<script setup lang="ts">
import { computed, ref, useAttrs, useId, watch } from 'vue';
import type { TSize } from '../types/contracts';
import TIcon from './TIcon.vue';

defineOptions({
  inheritAttrs: false,
});

export interface TKeyValueEditorLabels {
  /** Placeholder/accessible name for the key input. */
  key?: string;
  /** Placeholder/accessible name for the value input. */
  value?: string;
  /** Label of the add-row button. */
  add?: string;
  /** Accessible name of a row's remove button. */
  remove?: string;
  /** Shown on a row whose value is present but the key is blank. */
  emptyKey?: string;
  /** Shown on a row whose key repeats an earlier one. */
  duplicateKey?: string;
}

export interface TKeyValueEditorValidity {
  valid: boolean;
  /** Deduped, localized messages for the current errors — feed a TFormField summary. */
  errors: string[];
}

const DEFAULT_LABELS: Required<TKeyValueEditorLabels> = {
  key: 'Key',
  value: 'Value',
  add: 'Add row',
  remove: 'Remove row',
  emptyKey: 'Key is required.',
  duplicateKey: 'Duplicate key.',
};

const props = withDefaults(
  defineProps<{
    /** The edited map. Full value round-trips (this is the non-sensitive mode). */
    modelValue?: Record<string, string>;
    size?: TSize;
    disabled?: boolean;
    /** Marks the whole control invalid (e.g. mirrors a TFormField summary error). */
    invalid?: boolean;
    /** Localizable copy — merged over English defaults (ADR: no hardcoded prose). */
    labels?: TKeyValueEditorLabels;
  }>(),
  {
    modelValue: () => ({}),
    size: 'md',
    disabled: false,
    invalid: false,
    labels: () => ({}),
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>];
  'validity-change': [validity: TKeyValueEditorValidity];
}>();

const attrs = useAttrs();
const baseId = useId();
const labels = computed(() => ({ ...DEFAULT_LABELS, ...props.labels }));

interface Row {
  id: number;
  key: string;
  value: string;
}

let uid = 0;
const rows = ref<Row[]>([]);
// The last record we emitted, so v-model's echo doesn't rebuild rows mid-edit.
let lastEmitted: Record<string, string> | null = null;

function buildRows(record: Record<string, string>): Row[] {
  return Object.entries(record).map(([key, value]) => ({ id: (uid += 1), key, value }));
}

rows.value = buildRows(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    if (val === lastEmitted) return; // our own emit round-tripped back
    rows.value = buildRows(val);
  },
  { deep: true },
);

type RowError = 'empty' | 'duplicate' | null;

const rowErrors = computed<RowError[]>(() => {
  const seen = new Set<string>();
  return rows.value.map((row) => {
    const key = row.key.trim();
    if (!key) {
      // A value with no key is a mistake; a fully blank row is the next
      // placeholder and stays unflagged so the control never nags.
      return row.value.trim() ? 'empty' : null;
    }
    if (seen.has(key)) return 'duplicate';
    seen.add(key);
    return null;
  });
});

const committed = computed(() => {
  const out: Record<string, string> = {};
  rows.value.forEach((row, index) => {
    if (rowErrors.value[index]) return; // invalid row: blocked from commit
    const key = row.key.trim();
    if (!key) return; // blank placeholder
    out[key] = row.value;
  });
  return out;
});

function recordsEqual(a: Record<string, string>, b: Record<string, string> | null) {
  if (!b) return false;
  const aKeys = Object.keys(a);
  if (aKeys.length !== Object.keys(b).length) return false;
  return aKeys.every((key) => a[key] === b[key]);
}

function emitState() {
  const next = committed.value;
  if (!recordsEqual(next, lastEmitted)) {
    lastEmitted = next;
    emit('update:modelValue', next);
  }

  const errors: string[] = [];
  const kinds = new Set(rowErrors.value.filter(Boolean) as Exclude<RowError, null>[]);
  if (kinds.has('empty')) errors.push(labels.value.emptyKey);
  if (kinds.has('duplicate')) errors.push(labels.value.duplicateKey);
  emit('validity-change', { valid: errors.length === 0, errors });
}

function onKeyInput(index: number, event: Event) {
  rows.value[index].key = (event.target as HTMLInputElement).value;
  emitState();
}

function onValueInput(index: number, event: Event) {
  rows.value[index].value = (event.target as HTMLInputElement).value;
  emitState();
}

function addRow() {
  if (props.disabled) return;
  rows.value.push({ id: (uid += 1), key: '', value: '' });
}

function removeRow(index: number) {
  if (props.disabled) return;
  rows.value.splice(index, 1);
  emitState();
}

function errorId(row: Row) {
  return `${baseId}-err-${row.id}`;
}

function errorMessage(err: RowError) {
  if (err === 'empty') return labels.value.emptyKey;
  if (err === 'duplicate') return labels.value.duplicateKey;
  return '';
}

const rootClasses = computed(() => [
  't-key-value-editor',
  `t-key-value-editor--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-invalid': props.invalid,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const fieldAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <div
    v-bind="fieldAttrs"
    :class="rootClasses"
    :style="rootStyle"
  >
    <div
      v-if="rows.length"
      class="t-key-value-editor__rows"
    >
      <div
        v-for="(row, index) in rows"
        :key="row.id"
        class="t-key-value-editor__row"
        :class="{ 'is-invalid': !!rowErrors[index] }"
      >
        <div class="t-key-value-editor__fields">
          <input
            class="t-key-value-editor__key"
            type="text"
            :value="row.key"
            :placeholder="labels.key"
            :aria-label="labels.key"
            :disabled="disabled"
            :aria-invalid="rowErrors[index] ? true : undefined"
            :aria-describedby="rowErrors[index] ? errorId(row) : undefined"
            @input="onKeyInput(index, $event)"
          >
          <input
            class="t-key-value-editor__value"
            type="text"
            :value="row.value"
            :placeholder="labels.value"
            :aria-label="labels.value"
            :disabled="disabled"
            @input="onValueInput(index, $event)"
          >
          <button
            type="button"
            class="t-key-value-editor__remove"
            :disabled="disabled"
            :aria-label="labels.remove"
            @click="removeRow(index)"
          >
            <TIcon
              name="x"
              :size="16"
            />
          </button>
        </div>
        <p
          v-if="rowErrors[index]"
          :id="errorId(row)"
          class="t-key-value-editor__row-error"
          role="alert"
        >
          {{ errorMessage(rowErrors[index]) }}
        </p>
      </div>
    </div>

    <button
      type="button"
      class="t-key-value-editor__add"
      :disabled="disabled"
      @click="addRow"
    >
      <TIcon
        name="plus"
        :size="16"
      />
      <span>{{ labels.add }}</span>
    </button>
  </div>
</template>
