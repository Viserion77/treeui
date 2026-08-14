<script setup lang="ts">
import { computed, ref, useAttrs, useId, watch } from 'vue';
import type { TSize } from '../types/contracts';
import TIcon from './TIcon.vue';
import { useFormFieldIdentity, type TModelModifiers } from './form-field';

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
  /** Placeholder standing in for a value that never reaches the client. */
  hidden?: string;
  /** Action that replaces a secret's value. */
  replace?: string;
  /** Action that empties a secret without removing its key. */
  clear?: string;
  /** Accessible name of the field that takes the new secret value. */
  newValue?: string;
  /** Confirms the new secret value. */
  save?: string;
  /** Abandons the replacement without sending anything. */
  cancel?: string;
}

/**
 * Write-only mode. The VALUE never reaches the client —
 * the API returns only which keys exist — so the model cannot be
 * `Record<string, string>`: there is nothing to read. Each row shows the key
 * and whether it is set, with an affordance to replace or clear.
 */
export type TKeyValueEditorMode = 'value' | 'secret';

export type TKeyValueEditorSecretMap = Record<string, { set: boolean }>;

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
  hidden: 'Set',
  replace: 'Replace',
  clear: 'Clear',
  newValue: 'New value',
  save: 'Save',
  cancel: 'Cancel',
};

const props = withDefaults(
  defineProps<{
    /** The edited map. Full value round-trips (this is the non-sensitive mode). */
    modelValue?: Record<string, string>;
    /**
     * `value` (default) round-trips the whole map. `secret` is the write-only
     * mode: bind `secrets` instead of `modelValue`, and the component never
     * reads or displays a value — it shows the key plus "set / not set" and
     * emits `set-value`/`clear-value`.
     */
    mode?: TKeyValueEditorMode;
    /** The key set in `secret` mode. Replaces `modelValue` there. */
    secrets?: TKeyValueEditorSecretMap;
    size?: TSize;
    disabled?: boolean;
    /** Marks the whole control invalid (e.g. mirrors a TFormField summary error). */
    invalid?: boolean;
    /** Localizable copy — merged over English defaults (ADR: no hardcoded prose). */
    labels?: TKeyValueEditorLabels;
  } & TModelModifiers>(),
  {
    modelModifiers: () => ({}),
    modelValue: () => ({}),
    size: 'md',
    disabled: false,
    invalid: false,
    labels: () => ({}),
    mode: 'value',
    secrets: () => ({}),
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>];
  'validity-change': [validity: TKeyValueEditorValidity];
  /** `secret` mode: the user committed a new value for this key. */
  'set-value': [key: string, value: string];
  /** `secret` mode: the user emptied this key without removing it. */
  'clear-value': [key: string];
  /**
   * `secret` mode: the SET of keys changed — one was added or removed.
   * Replacing a value does NOT emit this: the map says which keys exist and
   * whether they have a value, and replacing changes neither.
   */
  'update:secrets': [value: TKeyValueEditorSecretMap];
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

// ── secret (write-only) mode ────────────────────────────────────────────────
const secretKeys = computed(() => Object.keys(props.secrets));
const editingKey = ref<string | null>(null);
const secretDraft = ref('');
const newSecretKey = ref('');

const startReplace = (key: string) => {
  if (props.disabled) return;
  editingKey.value = key;
  secretDraft.value = '';
};

const cancelReplace = () => {
  editingKey.value = null;
  secretDraft.value = '';
};

const commitSecret = () => {
  const key = editingKey.value;
  if (!key) return;
  // Replacing a value does NOT touch the key set, so no `update:secrets`.
  emit('set-value', key, secretDraft.value);
  cancelReplace();
};

const clearSecret = (key: string) => {
  if (props.disabled) return;
  emit('clear-value', key);
  emit('update:secrets', { ...props.secrets, [key]: { set: false } });
};

const removeSecret = (key: string) => {
  if (props.disabled) return;
  const next = { ...props.secrets };
  delete next[key];
  emit('update:secrets', next);
};

const addSecret = () => {
  const key = newSecretKey.value.trim();
  if (props.disabled || !key || key in props.secrets) return;
  emit('update:secrets', { ...props.secrets, [key]: { set: false } });
  newSecretKey.value = '';
};

const rootClasses = computed(() => [
  't-key-value-editor',
  `t-key-value-editor--${props.size}`,
  props.mode !== 'value' ? `t-key-value-editor--${props.mode}` : null,
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
    <!--
      Write-only mode: the value never reaches the client, so there is nothing
      to render and nothing to bind. The row is the key plus "set / not set",
      with replace and clear — reading the current value is not an affordance
      that exists here, by design.
    -->
    <div
      v-if="mode === 'secret'"
      class="t-key-value-editor__rows"
    >
      <div
        v-for="key in secretKeys"
        :key="key"
        class="t-key-value-editor__row"
      >
        <div class="t-key-value-editor__fields">
          <span class="t-key-value-editor__secret-key">{{ key }}</span>

          <template v-if="editingKey === key">
            <input
              v-model="secretDraft"
              class="t-key-value-editor__value"
              type="password"
              autocomplete="new-password"
              :aria-label="labels.newValue"
              :disabled="disabled"
              @keydown.enter.prevent="commitSecret"
              @keydown.esc.prevent="cancelReplace"
            >
            <button
              type="button"
              class="t-key-value-editor__add"
              :disabled="disabled"
              @click="commitSecret"
            >
              {{ labels.save }}
            </button>
            <button
              type="button"
              class="t-key-value-editor__add"
              :disabled="disabled"
              @click="cancelReplace"
            >
              {{ labels.cancel }}
            </button>
          </template>

          <template v-else>
            <span
              class="t-key-value-editor__secret-state"
              :data-set="secrets[key]?.set ? 'true' : 'false'"
            >{{ secrets[key]?.set ? labels.hidden : '—' }}</span>
            <button
              type="button"
              class="t-key-value-editor__add"
              :disabled="disabled"
              @click="startReplace(key)"
            >
              {{ labels.replace }}
            </button>
            <button
              v-if="secrets[key]?.set"
              type="button"
              class="t-key-value-editor__add"
              :disabled="disabled"
              @click="clearSecret(key)"
            >
              {{ labels.clear }}
            </button>
            <button
              type="button"
              class="t-key-value-editor__remove"
              :disabled="disabled"
              :aria-label="labels.remove"
              @click="removeSecret(key)"
            >
              <TIcon
                name="x"
                :size="16"
              />
            </button>
          </template>
        </div>
      </div>

      <div class="t-key-value-editor__fields">
        <input
          v-model="newSecretKey"
          class="t-key-value-editor__key"
          type="text"
          :placeholder="labels.key"
          :aria-label="labels.key"
          :disabled="disabled"
          @keydown.enter.prevent="addSecret"
        >
        <button
          type="button"
          class="t-key-value-editor__add"
          :disabled="disabled"
          @click="addSecret"
        >
          <TIcon
            name="plus"
            :size="16"
          />
          <span>{{ labels.add }}</span>
        </button>
      </div>
    </div>

    <div
      v-else-if="rows.length"
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
      v-if="mode === 'value'"
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
