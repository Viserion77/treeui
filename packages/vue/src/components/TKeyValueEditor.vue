<script setup lang="ts">
import { computed, ref, useAttrs, useId, watch } from 'vue';
import type { TSize } from '../types/contracts';
import TIcon from './TIcon.vue';
import { useFormFieldIdentity } from './form-field';

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

/**
 * Rebuild the rows from an external record, reusing the row id of any key that
 * survives so its `<input>` is patched rather than remounted (a remount steals
 * the caret). Keys the incoming record no longer has simply lose their row.
 */
function buildRows(record: Record<string, string>): Row[] {
  const idsByKey = new Map<string, number>();
  for (const row of rows.value) {
    const key = row.key.trim();
    if (key && !idsByKey.has(key)) idsByKey.set(key, row.id);
  }

  return Object.entries(record).map(([key, value]) => ({
    id: idsByKey.get(key) ?? (uid += 1),
    key,
    value,
  }));
}

rows.value = buildRows(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    // Compare by CONTENT, not by reference. A parent holding the map in
    // `reactive()`/`ref()` hands back a proxy, which is never `===` the raw
    // object we emitted — an identity check therefore fails on every keystroke
    // and rebuilds the rows from the COMMITTED record, which by contract omits
    // the row being edited. Clearing a key would delete that row and its value.
    if (recordsEqual(val, lastEmitted)) return;
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

const validity = computed<TKeyValueEditorValidity>(() => {
  const errors: string[] = [];
  const kinds = new Set(rowErrors.value.filter(Boolean) as Exclude<RowError, null>[]);
  if (kinds.has('empty')) errors.push(labels.value.emptyKey);
  if (kinds.has('duplicate')) errors.push(labels.value.duplicateKey);
  return { valid: errors.length === 0, errors };
});

// Validity is watched, not emitted from the input handlers, because a Record
// can ARRIVE invalid: `{"": "x"}` is a legitimate `Record<string, string>` and
// the control mounts already showing the row error. Emitting only on keystroke
// left the consumer's aggregated summary out of sync on mount, after an
// external reset, and after add-row. `immediate` covers mount; the signature
// guard keeps it to one emit per actual change.
let lastValiditySignature: string | null = null;
watch(
  validity,
  (value) => {
    const signature = JSON.stringify(value);
    if (signature === lastValiditySignature) return;
    lastValiditySignature = signature;
    emit('validity-change', value);
  },
  { immediate: true },
);

function emitState() {
  const next = committed.value;
  if (recordsEqual(next, lastEmitted)) return;
  lastEmitted = next;
  emit('update:modelValue', next);
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

// A `<label for>` has to point at a form control. TFormField hands the control
// an `id` (explicitly, or through the field context); landing it on the wrapper
// `div` makes the label name nothing at all, so it is routed to the first key
// input — the field the label is about — and everything else stays on the group.
const { controlId, describedBy } = useFormFieldIdentity(attrs);

const fieldAttrs = computed(() => {
  const {
    class: _class,
    style: _style,
    id: _id,
    'aria-describedby': _describedBy,
    ...rest
  } = attrs;
  return rest;
});
</script>

<template>
  <div
    v-bind="fieldAttrs"
    :class="rootClasses"
    :style="rootStyle"
    role="group"
    :aria-invalid="invalid || undefined"
    :aria-describedby="describedBy"
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
            :id="index === 0 ? controlId : undefined"
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
