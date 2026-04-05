<script setup lang="ts">
import { computed, inject } from 'vue';
import { TABS_INJECTION_KEY } from './tabs-context';

const props = defineProps<{
  value: string;
}>();

const ctx = inject(TABS_INJECTION_KEY);
if (!ctx) {
  throw new Error('TTabPanel must be used inside TTabs');
}

const isActive = computed(() => ctx.activeValue.value === props.value);
const panelId = computed(() => `${ctx.baseId}-panel-${props.value}`);
const tabId = computed(() => `${ctx.baseId}-tab-${props.value}`);
</script>

<template>
  <div
    v-if="isActive"
    :id="panelId"
    role="tabpanel"
    :aria-labelledby="tabId"
    tabindex="0"
    class="tree-tabs__panel"
  >
    <slot />
  </div>
</template>
