<script setup lang="ts">
import { createId } from '@treeui/utils';
import { computed, provide, reactive, ref, toRef, watch } from 'vue';
import type { TreeSize } from '../types/contracts';
import type { TabsActivationMode, TabsVariant } from './tabs-context';
import { TABS_INJECTION_KEY } from './tabs-context';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    defaultValue?: string;
    variant?: TabsVariant;
    size?: TreeSize;
    activationMode?: TabsActivationMode;
    disabled?: boolean;
  }>(),
  {
    modelValue: undefined,
    defaultValue: '',
    variant: 'line',
    size: 'md',
    activationMode: 'automatic',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const baseId = createId('tree-tabs');
const internalValue = ref(props.defaultValue);
const tabOrder = ref<string[]>([]);
const disabledTabs: Record<string, boolean> = reactive({});

const activeValue = computed(() => props.modelValue ?? internalValue.value);

const setActiveValue = (value: string) => {
  if (value === activeValue.value) return;
  if (props.modelValue === undefined) {
    internalValue.value = value;
  }
  emit('update:modelValue', value);
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
  variant: toRef(props, 'variant'),
  size: toRef(props, 'size'),
  activationMode: toRef(props, 'activationMode'),
  disabled: toRef(props, 'disabled'),
  baseId,
  registerTab,
  unregisterTab,
  getTabValues,
  isTabDisabled,
  setTabDisabled,
});

const rootClasses = computed(() => [
  'tree-tabs',
  `tree-tabs--${props.variant}`,
  `tree-tabs--${props.size}`,
]);
</script>

<template>
  <div :class="rootClasses">
    <slot />
  </div>
</template>
