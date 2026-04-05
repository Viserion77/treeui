<script setup lang="ts">
import { isActivationKey } from '@treeui/utils';
import { computed, inject, ref } from 'vue';
import { TABS_INJECTION_KEY } from './tabs-context';

const ctx = inject(TABS_INJECTION_KEY);
if (!ctx) {
  throw new Error('TTabList must be used inside TTabs');
}

const listRef = ref<HTMLElement | null>(null);

const getAllTabElements = (): HTMLElement[] => {
  if (!listRef.value) return [];
  return Array.from(
    listRef.value.querySelectorAll<HTMLElement>('[role="tab"]'),
  );
};

const getEnabledTabElements = (): HTMLElement[] => {
  return getAllTabElements().filter((el) => {
    const value = el.dataset.tabValue;
    return value ? !ctx.isTabDisabled(value) : false;
  });
};

const moveFocus = (direction: 1 | -1) => {
  const tabs = getEnabledTabElements();
  if (!tabs.length) return;

  const current = document.activeElement as HTMLElement;
  const currentIndex = tabs.indexOf(current);
  let nextIndex = currentIndex + direction;

  if (nextIndex < 0) nextIndex = tabs.length - 1;
  if (nextIndex >= tabs.length) nextIndex = 0;

  const nextTab = tabs[nextIndex];
  nextTab.focus();

  if (ctx.activationMode.value === 'automatic') {
    const value = nextTab.dataset.tabValue;
    if (value) ctx.setActiveValue(value);
  }
};

const focusFirst = () => {
  const tabs = getEnabledTabElements();
  if (!tabs.length) return;
  tabs[0].focus();
  if (ctx.activationMode.value === 'automatic') {
    const value = tabs[0].dataset.tabValue;
    if (value) ctx.setActiveValue(value);
  }
};

const focusLast = () => {
  const tabs = getEnabledTabElements();
  if (!tabs.length) return;
  const last = tabs[tabs.length - 1];
  last.focus();
  if (ctx.activationMode.value === 'automatic') {
    const value = last.dataset.tabValue;
    if (value) ctx.setActiveValue(value);
  }
};

const onKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault();
      moveFocus(1);
      break;
    case 'ArrowLeft':
      event.preventDefault();
      moveFocus(-1);
      break;
    case 'Home':
      event.preventDefault();
      focusFirst();
      break;
    case 'End':
      event.preventDefault();
      focusLast();
      break;
    default:
      if (ctx.activationMode.value === 'manual' && isActivationKey(event)) {
        event.preventDefault();
        const target = event.target as HTMLElement;
        const value = target.dataset?.tabValue;
        if (value) ctx.setActiveValue(value);
      }
      break;
  }
};

const classes = computed(() => [
  'tree-tabs__list',
  `tree-tabs__list--${ctx.variant.value}`,
]);
</script>

<template>
  <div
    ref="listRef"
    role="tablist"
    aria-orientation="horizontal"
    :class="classes"
    @keydown="onKeydown"
  >
    <slot />
  </div>
</template>
