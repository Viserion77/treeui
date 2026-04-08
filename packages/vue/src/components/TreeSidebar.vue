<script setup lang="ts">
import { getTreeIcon } from '@treeui/icons';
import { computed, provide, toRef, useAttrs } from 'vue';
import { useControllableOpen } from '../composables/useControllableOpen';
import type { TreeSize } from '../types/contracts';
import { treeSidebarInjectionKey } from './sidebar';

defineOptions({
  inheritAttrs: false,
});

const _treeSidebarSides = ['left', 'right'] as const;

export type TreeSidebarSide = (typeof _treeSidebarSides)[number];

const ChevronLeftIcon = getTreeIcon('chevron-left');
const ChevronRightIcon = getTreeIcon('chevron-right');

const props = withDefaults(
  defineProps<{
    as?: string;
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    collapsible?: boolean;
    size?: TreeSize;
    side?: TreeSidebarSide;
    sticky?: boolean;
    bordered?: boolean;
    width?: string;
    collapsedWidth?: string;
    collapseLabel?: string;
    expandLabel?: string;
  }>(),
  {
    as: 'aside',
    collapsed: undefined,
    defaultCollapsed: false,
    collapsible: true,
    size: 'md',
    side: 'left',
    sticky: false,
    bordered: true,
    width: '17.5rem',
    collapsedWidth: '4.75rem',
    collapseLabel: 'Collapse sidebar',
    expandLabel: 'Expand sidebar',
  },
);

const emit = defineEmits<{
  'update:collapsed': [value: boolean];
  'collapse-change': [value: boolean];
}>();

defineSlots<{
  header?: (props: { collapsed: boolean }) => unknown;
  default?: (props: { collapsed: boolean }) => unknown;
  footer?: (props: { collapsed: boolean }) => unknown;
  toggle?: (props: { collapsed: boolean }) => unknown;
}>();

const attrs = useAttrs();

const { value: isCollapsed, setValue } = useControllableOpen(
  toRef(props, 'collapsed'),
  props.defaultCollapsed,
  (value) => {
    emit('update:collapsed', value);
    emit('collapse-change', value);
  },
);

const rootClasses = computed(() => [
  'tree-sidebar',
  `tree-sidebar--${props.size}`,
  `tree-sidebar--${props.side}`,
  {
    'is-collapsed': isCollapsed.value,
    'is-sticky': props.sticky,
    'is-bordered': props.bordered,
  },
  attrs.class,
]);

const rootStyle = computed(() => [
  {
    '--tree-sidebar-width': props.width,
    '--tree-sidebar-collapsed-width': props.collapsedWidth,
  },
  attrs.style,
]);

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const toggleCollapsed = () => {
  if (!props.collapsible) {
    return;
  }

  setValue(!isCollapsed.value);
};

const ToggleIcon = computed(() => {
  if (props.side === 'right') {
    return isCollapsed.value ? ChevronLeftIcon : ChevronRightIcon;
  }

  return isCollapsed.value ? ChevronRightIcon : ChevronLeftIcon;
});

const toggleLabel = computed(() =>
  isCollapsed.value ? props.expandLabel : props.collapseLabel,
);

provide(treeSidebarInjectionKey, {
  collapsed: computed(() => isCollapsed.value),
});
</script>

<template>
  <component
    :is="as"
    v-bind="rootAttrs"
    :class="rootClasses"
    :style="rootStyle"
    :data-state="isCollapsed ? 'collapsed' : 'expanded'"
  >
    <div
      v-if="$slots.header"
      class="tree-sidebar__header"
    >
      <slot
        name="header"
        :collapsed="isCollapsed"
      />
    </div>

    <div class="tree-sidebar__body">
      <slot :collapsed="isCollapsed" />
    </div>

    <div
      v-if="$slots.footer || collapsible"
      class="tree-sidebar__footer"
    >
      <slot
        v-if="$slots.footer"
        name="footer"
        :collapsed="isCollapsed"
      />

      <button
        v-if="collapsible"
        type="button"
        class="tree-sidebar__toggle"
        :aria-label="toggleLabel"
        :aria-expanded="!isCollapsed"
        @click="toggleCollapsed"
      >
        <slot
          name="toggle"
          :collapsed="isCollapsed"
        >
          <component
            :is="ToggleIcon"
            :size="16"
          />
          <span v-if="!isCollapsed">{{ toggleLabel }}</span>
        </slot>
      </button>
    </div>
  </component>
</template>
