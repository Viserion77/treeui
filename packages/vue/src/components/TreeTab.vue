<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, watch } from 'vue';
import { TABS_INJECTION_KEY } from './tabs-context';

const props = withDefaults(
  defineProps<{
    value: string;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

const ctx = inject(TABS_INJECTION_KEY);
if (!ctx) {
  throw new Error('TTab must be used inside TTabs');
}

onMounted(() => {
  ctx.registerTab(props.value);
  ctx.setTabDisabled(props.value, props.disabled);
});

watch(
  () => props.disabled,
  (val) => ctx.setTabDisabled(props.value, val),
);

onBeforeUnmount(() => {
  ctx.unregisterTab(props.value);
});

const isActive = computed(() => ctx.activeValue.value === props.value);
const isDisabled = computed(() => ctx.isTabDisabled(props.value));
const tabId = computed(() => `${ctx.baseId}-tab-${props.value}`);
const panelId = computed(() => `${ctx.baseId}-panel-${props.value}`);

const onClick = () => {
  if (isDisabled.value) return;
  ctx.setActiveValue(props.value);
};

const classes = computed(() => [
  'tree-tabs__tab',
  `tree-tabs__tab--${ctx.size.value}`,
  {
    'is-active': isActive.value,
    'is-disabled': isDisabled.value,
  },
]);
</script>

<template>
  <button
    :id="tabId"
    role="tab"
    type="button"
    :class="classes"
    :aria-selected="isActive"
    :aria-controls="panelId"
    :tabindex="isActive ? 0 : -1"
    :disabled="isDisabled || undefined"
    :data-tab-value="value"
    @click="onClick"
  >
    <slot />
  </button>
</template>
