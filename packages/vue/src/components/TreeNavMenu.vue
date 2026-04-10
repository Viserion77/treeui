<script setup lang="ts">
import { getNextEnabledIndex, isActivationKey } from '@treeui/utils';
import { computed, getCurrentInstance, inject, nextTick, ref, useAttrs, watch, type Component, type ComponentPublicInstance } from 'vue';
import type { TreeSize } from '../types/contracts';
import { treeSidebarInjectionKey } from './sidebar';

defineOptions({
  inheritAttrs: false,
});

export interface TreeNavMenuItem {
  label: string;
  value: string;
  shortLabel?: string;
  description?: string;
  icon?: Component;
  to?: string | Record<string, unknown>;
  badge?: string | number;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    defaultValue?: string;
    items?: TreeNavMenuItem[];
    size?: TreeSize;
    collapsed?: boolean;
    disabled?: boolean;
  }>(),
  {
    modelValue: undefined,
    defaultValue: '',
    items: () => [],
    size: 'md',
    collapsed: undefined,
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  select: [value: string, item: TreeNavMenuItem];
}>();

defineSlots<{
  item?: (props: {
    item: TreeNavMenuItem;
    selected: boolean;
    focused: boolean;
    collapsed: boolean;
  }) => unknown;
  empty?: () => unknown;
}>();

const attrs = useAttrs();
const sidebar = inject(treeSidebarInjectionKey, null);
const internalValue = ref(props.defaultValue);
const itemRefs = ref<Map<string, HTMLElement>>(new Map());
const instance = getCurrentInstance();

const selectedValue = computed(() => props.modelValue ?? internalValue.value);
const resolvedCollapsed = computed(() => props.collapsed ?? sidebar?.collapsed.value ?? false);

const routerLinkComponent = computed<Component | null>(() => (
  (instance?.appContext.components.RouterLink as Component | undefined) ?? null
));

const itemTag = (item: TreeNavMenuItem) => {
  if (item.to && routerLinkComponent.value) {
    return routerLinkComponent.value;
  }
  return 'button';
};

const getInitialFocusedIndex = () => {
  const selectedIndex = props.items.findIndex((item) =>
    item.value === selectedValue.value && !item.disabled,
  );

  if (selectedIndex >= 0) {
    return selectedIndex;
  }

  return props.items.findIndex((item) => !item.disabled);
};

const focusedIndex = ref(getInitialFocusedIndex());

const rootClasses = computed(() => [
  'tree-nav-menu',
  `tree-nav-menu--${props.size}`,
  {
    'is-collapsed': resolvedCollapsed.value,
    'is-disabled': props.disabled,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const isSelected = (value: string) => selectedValue.value === value;

const setItemRef = (element: Element | ComponentPublicInstance | null, value: string) => {
  const resolvedElement =
    element instanceof HTMLElement
      ? element
      : element && '$el' in element && element.$el instanceof HTMLElement
        ? element.$el
        : null;

  if (resolvedElement) {
    itemRefs.value.set(value, resolvedElement);
  } else {
    itemRefs.value.delete(value);
  }
};

const focusItem = (index: number) => {
  const item = props.items[index];

  if (!item) {
    return;
  }

  focusedIndex.value = index;
  nextTick(() => itemRefs.value.get(item.value)?.focus());
};

const selectItem = (item: TreeNavMenuItem) => {
  if (props.disabled || item.disabled) {
    return;
  }

  if (props.modelValue === undefined) {
    internalValue.value = item.value;
  }

  emit('update:modelValue', item.value);
  emit('select', item.value, item);
};

const onItemKeydown = (event: KeyboardEvent, index: number) => {
  if (props.disabled) {
    return;
  }

  if (event.key === 'Home') {
    event.preventDefault();
    const firstIndex = props.items.findIndex((item) => !item.disabled);

    if (firstIndex >= 0) {
      focusItem(firstIndex);
    }

    return;
  }

  if (event.key === 'End') {
    event.preventDefault();
    const lastIndex = [...props.items].reverse().findIndex((item) => !item.disabled);

    if (lastIndex >= 0) {
      focusItem(props.items.length - 1 - lastIndex);
    }

    return;
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    event.preventDefault();
    const nextIndex = getNextEnabledIndex(index, props.items, 1);

    if (nextIndex >= 0) {
      focusItem(nextIndex);
    }

    return;
  }

  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
    event.preventDefault();
    const previousIndex = getNextEnabledIndex(index, props.items, -1);

    if (previousIndex >= 0) {
      focusItem(previousIndex);
    }

    return;
  }

  if (isActivationKey(event)) {
    event.preventDefault();
    selectItem(props.items[index]);
  }
};

const getTabIndex = (index: number) => (focusedIndex.value === index ? 0 : -1);

watch(
  () => [props.items, props.modelValue] as const,
  () => {
    const nextIndex = getInitialFocusedIndex();
    focusedIndex.value = nextIndex >= 0 ? nextIndex : -1;
  },
  { deep: true },
);
</script>

<template>
  <nav
    v-bind="rootAttrs"
    :class="rootClasses"
    :style="rootStyle"
  >
    <ul
      v-if="items.length > 0"
      class="tree-nav-menu__list"
    >
      <li
        v-for="(item, index) in items"
        :key="item.value"
        class="tree-nav-menu__entry"
      >
        <component
          :is="itemTag(item)"
          :ref="(element: Element | ComponentPublicInstance | null) => setItemRef(element, item.value)"
          :type="item.to ? undefined : 'button'"
          :to="item.to || undefined"
          class="tree-nav-menu__item"
          :class="{
            'is-selected': isSelected(item.value),
            'is-disabled': disabled || item.disabled,
          }"
          :disabled="(!item.to && (disabled || item.disabled)) || undefined"
          :aria-disabled="(item.to && (disabled || item.disabled)) || undefined"
          :aria-current="isSelected(item.value) ? 'page' : undefined"
          :tabindex="disabled || item.disabled ? -1 : getTabIndex(index)"
          :title="resolvedCollapsed ? item.label : undefined"
          @click="selectItem(item)"
          @keydown="onItemKeydown($event, index)"
          @focus="focusedIndex = index"
        >
          <slot
            name="item"
            :item="item"
            :selected="isSelected(item.value)"
            :focused="focusedIndex === index"
            :collapsed="resolvedCollapsed"
          >
            <component
              :is="item.icon"
              v-if="item.icon"
              class="tree-nav-menu__icon"
              aria-hidden="true"
            />
            <span
              v-else
              class="tree-nav-menu__marker"
              aria-hidden="true"
            >
              {{ (item.shortLabel ?? item.label.charAt(0)).toUpperCase() }}
            </span>

            <span class="tree-nav-menu__copy">
              <span class="tree-nav-menu__label">{{ item.label }}</span>
              <span
                v-if="item.description"
                class="tree-nav-menu__description"
              >
                {{ item.description }}
              </span>
            </span>

            <span
              v-if="item.badge !== undefined && item.badge !== null"
              class="tree-nav-menu__badge"
            >
              {{ item.badge }}
            </span>
          </slot>
        </component>
      </li>
    </ul>

    <div
      v-else
      class="tree-nav-menu__empty"
    >
      <slot name="empty">
        No navigation items.
      </slot>
    </div>
  </nav>
</template>
