<script setup lang="ts">
import { computed, provide, reactive } from 'vue';
import { type AccordionType, accordionInjectionKey } from './accordion';

const props = withDefaults(
  defineProps<{
    type?: AccordionType;
    modelValue?: string | string[];
    defaultValue?: string | string[];
    disabled?: boolean;
    collapsible?: boolean;
  }>(),
  {
    type: 'single',
    modelValue: undefined,
    defaultValue: undefined,
    disabled: false,
    collapsible: false,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | string[] | undefined): void;
}>();

// Internal uncontrolled state
const internalValue = computed<string[]>(() => {
  const def = props.defaultValue;
  if (def === undefined) return [];
  return Array.isArray(def) ? def : [def];
});

const uncontrolledValue = reactive<Set<string>>(new Set(internalValue.value));

const isControlled = computed(() => props.modelValue !== undefined);

const openValues = computed<Set<string>>(() => {
  if (isControlled.value) {
    const mv = props.modelValue!;
    return new Set(Array.isArray(mv) ? mv : [mv]);
  }
  return uncontrolledValue;
});

function isItemOpen(value: string): boolean {
  return openValues.value.has(value);
}

function emitUpdate(values: Set<string>) {
  if (props.type === 'single') {
    const arr = [...values];
    emit('update:modelValue', arr.length > 0 ? arr[0] : undefined);
  } else {
    emit('update:modelValue', [...values]);
  }
}

function toggleItem(value: string) {
  const currentlyOpen = isItemOpen(value);

  if (props.type === 'single') {
    if (currentlyOpen) {
      if (props.collapsible) {
        if (!isControlled.value) {
          uncontrolledValue.delete(value);
        }
        emitUpdate(new Set());
      }
    } else {
      if (!isControlled.value) {
        uncontrolledValue.clear();
        uncontrolledValue.add(value);
      }
      emitUpdate(new Set([value]));
    }
  } else {
    // Multiple mode
    const next = new Set(openValues.value);
    if (currentlyOpen) {
      next.delete(value);
    } else {
      next.add(value);
    }
    if (!isControlled.value) {
      if (currentlyOpen) {
        uncontrolledValue.delete(value);
      } else {
        uncontrolledValue.add(value);
      }
    }
    emitUpdate(next);
  }
}

// Keyboard navigation between triggers
const triggerMap = new Map<string, HTMLElement>();
const triggerOrder: string[] = reactive([]);

function registerTrigger(value: string, el: HTMLElement) {
  if (!triggerMap.has(value)) {
    triggerOrder.push(value);
  }
  triggerMap.set(value, el);
}

function unregisterTrigger(value: string) {
  triggerMap.delete(value);
  const idx = triggerOrder.indexOf(value);
  if (idx !== -1) triggerOrder.splice(idx, 1);
}

function getEnabledTriggers(): string[] {
  return triggerOrder.filter((v) => {
    const el = triggerMap.get(v);
    return el && !el.hasAttribute('disabled');
  });
}

function focusPrev(value: string) {
  const enabled = getEnabledTriggers();
  const idx = enabled.indexOf(value);
  const prev = idx > 0 ? idx - 1 : enabled.length - 1;
  triggerMap.get(enabled[prev])?.focus();
}

function focusNext(value: string) {
  const enabled = getEnabledTriggers();
  const idx = enabled.indexOf(value);
  const next = idx < enabled.length - 1 ? idx + 1 : 0;
  triggerMap.get(enabled[next])?.focus();
}

function focusFirst() {
  const enabled = getEnabledTriggers();
  if (enabled.length) triggerMap.get(enabled[0])?.focus();
}

function focusLast() {
  const enabled = getEnabledTriggers();
  if (enabled.length) triggerMap.get(enabled[enabled.length - 1])?.focus();
}

provide(accordionInjectionKey, {
  type: props.type,
  disabled: props.disabled,
  collapsible: props.collapsible,
  isItemOpen,
  toggleItem,
  registerTrigger,
  unregisterTrigger,
  focusPrev,
  focusNext,
  focusFirst,
  focusLast,
});
</script>

<template>
  <div class="tree-accordion">
    <slot />
  </div>
</template>
