<script setup lang="ts" generic="T extends string = string">
import { createId } from '@treeui/utils';
import { computed, provide, reactive, ref, watch } from 'vue';
import type { TSize } from '../types/contracts';
import type { TabsActivationMode } from './tabs-context';
import { TABS_INJECTION_KEY } from './tabs-context';
import type { TModelModifiers } from './form-field';

const props = withDefaults(
  defineProps<{
    /**
     * Generic over the tab id, so a `ref<'overview' | 'logs'>` gets its own
     * literal union back instead of a widened `string` (TREEUX-011, group 3).
     */
    modelValue?: T;
    defaultValue?: T;
    size?: TSize;
    activationMode?: TabsActivationMode;
    disabled?: boolean;
  } & TModelModifiers>(),
  {
    modelModifiers: () => ({}),
    modelValue: undefined,
    defaultValue: undefined,
    size: 'md',
    activationMode: 'automatic',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: T];
}>();

const baseId = createId('t-tabs');
const internalValue = ref<string>(props.defaultValue ?? '');
const tabOrder = ref<string[]>([]);
const disabledTabs: Record<string, boolean> = reactive({});

const activeValue = computed<string>(() => props.modelValue ?? internalValue.value);

const setActiveValue = (value: string) => {
  if (value === activeValue.value) return;
  if (props.modelValue === undefined) {
    internalValue.value = value;
  }
  // The registered tabs ARE the union: a value that reached here came from a
  // TTab the consumer declared, so it is a T by construction.
  emit('update:modelValue', value as T);
};

const registerTab = (value: string) => {
  if (!tabOrder.value.includes(value)) {
    tabOrder.value.push(value);
  }
};

const unregisterTab = (value: string) => {
  const idx = tabOrder.value.indexOf(value);
  if (idx >= 0) tabOrder.value.splice(idx, 1);
  delete disabledTabs[value];
};

const getTabValues = () => tabOrder.value;

const isTabDisabled = (value: string) => props.disabled || !!disabledTabs[value];

const setTabDisabled = (value: string, disabled: boolean) => {
  if (disabled) {
    disabledTabs[value] = true;
  } else {
    delete disabledTabs[value];
  }
};

watch(
  () => props.modelValue,
  (val) => {
    if (val !== undefined) {
      internalValue.value = val;
    }
  },
);

provide(TABS_INJECTION_KEY, {
  activeValue,
  setActiveValue,
  // `computed`, not `toRef`: on a generic `<script setup>` the props object is a
  // conditional mapped type, and `toRef(props, 'disabled')` cannot narrow it
  // back to `Ref<boolean>`. A getter reads the same value with no inference to
  // unwind, and the context type stays honest.
  size: computed(() => props.size),
  activationMode: computed(() => props.activationMode),
  disabled: computed(() => props.disabled),
  baseId,
  registerTab,
  unregisterTab,
  getTabValues,
  isTabDisabled,
  setTabDisabled,
});

const rootClasses = computed(() => [
  't-tabs',
  `t-tabs--${props.size}`,
]);
</script>

<template>
  <div :class="rootClasses">
    <slot />
  </div>
</template>
